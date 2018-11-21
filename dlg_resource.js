//
// Canvas dialog resource representation.
//
'use strict';

///////////////////

// Attempts to require a given file. Returns undefined if 'require' is not available.
// Helps to use the calling js file in both node.js and browser environments. In a
// node.js environment the passed dependency will be loaded through the require
// mechanism. In a browser environment this function will return undefined and the
// dependency has to be loaded through a script tag.
function tryRequire(file) {
  return typeof require !== 'undefined' ? require(file) : undefined;
}

// Dependencies
var cred = tryRequire('./cred_types') || cred || {};
cred.spec = tryRequire('./dlg_spec') || cred.spec || {};
var util = tryRequire('./util') || util || {};

///////////////////

// Resource module.
cred.resource = (function() {
  ///////////////////

  // Handles interactions between the resource model and other parts of the app.
  class ResourceManager {
    constructor() {
      this._resourceSet = undefined;
      this._controller = undefined;
    }

    setup() {
      // Nothing to do.
    }

    // Inject controller.
    set controller(value) {
      this._controller = value;
    }

    dialogResource(locale) {
      return this._resourceSet.dialogResource(locale);
    }

    isLinkedToMaster(locale) {
      if (this._resourceSet) {
        return this._resourceSet.isLinkedToMaster(locale);
      }
      return false;
    }

    // Generator function for all locales that have linked resources.
    *linkedLocales() {
      yield* this._resourceSet.linkedLocales();
    }

    // Generator function for all locales that have unlinked resources.
    *unlinkedLocales() {
      yield* this._resourceSet.unlinkedLocales();
    }

    lookupString(stringId, language) {
      return this._resourceSet.lookupString(stringId, language);
    }

    // Notifications

    onFilesChosenNotification(files) {
      this._openFiles(files);
    }

    onSaveChosenNotification() {
      this._storeDialog();
    }

    onItemIdModifiedNotification(id) {
      this._updateItemId(this._controller.selectedItem, id);
    }

    onItemBoundsModifiedNotification(bounds) {
      this._updateItemBounds(this._controller.selectedItem, bounds);
    }

    onItemPropertyModifiedNotification(propLabel, value) {
      this._updateItemProperty(this._controller.selectedItem, propLabel, value);
    }

    onItemLocalizedStringPropertyModifiedNotification(propLabel, value) {
      this._updateItemLocalizedStringProperty(
        this._controller.selectedItem,
        propLabel,
        value
      );
    }

    onItemFlagPropertyModifiedNotification(propLabel, flagText, flagValue, isSet) {
      this._updateItemFlagProperty(
        this._controller.selectedItem,
        propLabel,
        flagText,
        flagValue,
        isSet
      );
    }

    onLinkedToMasterModifiedNotification(isLinked) {
      this._updateLinkingToMasterLocale(this._controller.currentLocale, isLinked);
    }

    // Opens a given array of files.
    _openFiles(files) {
      let fileSet = new cred.io.FileSet(files);
      if (fileSet.isValid()) {
        this._loadDialog(fileSet);
      } else {
        this._controller.notifyErrorOccurred(this, composeOpenDlgErrorMessage(fileSet));
      }
    }

    // Load a dialog from a given set of dialog files.
    _loadDialog(fileSet) {
      let self = this;
      let reader = new cred.io.Reader(fileSet);
      reader
        .read()
        .then(resourceSet => {
          self._resourceSet = resourceSet;
          self._controller.notifyDialogLoaded(this, resourceSet);
        })
        .catch(err => {
          self._controller.notifyErrorOccurred(
            this,
            `Unable to open file ${fileSet.dialogName}.\nError: ${err}`
          );
        });
    }

    // Stores the current dialog resources.
    _storeDialog() {
      if (this._resourceSet) {
        let writer = new cred.io.Writer(this._resourceSet);
        writer.write();
      }
    }

    // Updates the id of a given layout item.
    _updateItemId(layoutItem, id) {
      // An item's id is shared among all locale resources, so we have to change
      // all of them. Also, control ids are used as keys in some dialog data
      // structures and need special treatment there.
      if (layoutItem.isDialog()) {
        this._resourceSet.updateDialogId(id);
      } else {
        this._resourceSet.updateControlId(layoutItem.id, id);
      }
    }

    // Updates the bounds stored in the resource of a given layout item.
    _updateItemBounds(layoutItem, bounds) {
      // The bounds of an item are specific to that item and can be different
      // for each locale, so only the item's definition needs to be changed,
      // the other locales remain untouched (in case they are linked the
      // item definition will be the same!).
      const propLabel = cred.spec.propertyLabel;
      let resourceDef = layoutItem.resourceDefinition();
      resourceDef.property(propLabel.left).value = bounds.left;
      resourceDef.property(propLabel.top).value = bounds.top;
      resourceDef.property(propLabel.width).value = bounds.width;
      resourceDef.property(propLabel.height).value = bounds.height;
    }

    // Updates a given property of a given layout item.
    _updateItemProperty(layoutItem, propLabel, value) {
      this._resourceSet.updateProperty(
        layoutItem,
        propLabel,
        value,
        this._selectAffectedLocales(propLabel)
      );
    }

    // Updates a given localized string property of a given layout item.
    _updateItemLocalizedStringProperty(layoutItem, propLabel, value) {
      // Localized string properties are specific to the current locale.
      this._resourceSet.updateLocalizedStringProperty(
        layoutItem,
        propLabel,
        value,
        this._controller.currentLocale
      );
    }

    // Updates a given flag property of a given layout item.
    _updateItemFlagProperty(layoutItem, propLabel, flagText, flagValue, isSet) {
      this._resourceSet.updateFlagProperty(
        layoutItem,
        propLabel,
        flagText,
        flagValue,
        isSet,
        this._selectAffectedLocales(propLabel)
      );
    }

    // Updates the linking of the resource of a given locale to the master resource.
    _updateLinkingToMasterLocale(locale, isLinked) {
      if (isLinked) {
        this._resourceSet.linkToMaster(locale);
      } else {
        this._resourceSet.unlinkFromMaster(locale);
      }
    }

    // Returns an array with the locales affected when a given property changes.
    _selectAffectedLocales(propLabel) {
      if (this._isGlobalProperty(propLabel)) {
        return Array.from(cred.locale);
      }
      return [this._controller.currentLocale];
    }

    // Returns whether a given property is set to have global effect when edited.
    _isGlobalProperty(propLabel) {
      return this._controller.isCurrentPropertyGlobal(propLabel);
    }
  }

  // Returns an error message for a failed dialog opening operation.
  function composeOpenDlgErrorMessage(fileSet) {
    if (!fileSet.masterFile) {
      return 'Unable to open dialog files. No master dialog file found.';
    } else if (!fileSet.haveAllLanguageStringFiles()) {
      return 'Unable to open dialog files. Some string files are missing.';
    } else {
      return 'Unable to open dialog files. Unexpected error.';
    }
  }

  ///////////////////

  // Holds all data contained in a set of dialog resource files.
  class DialogResourceSet {
    constructor() {
      // Map of unlinked resources that associates locales their resources.
      // Linked resources are not contained in the map.
      this._resources = new Map();
      // Maps that associates locales with a log of collected issues when
      // importing the dialog.
      this._importLog = new Map();
      // Data structure that maps string identifiers to strings for each language.
      this._stringMap = new StringMap();

      this._init();
    }

    // Returns the file name of the master resource file.
    get masterFileName() {
      return cred.dialogFileName(this.dialogName, cred.locale.any);
    }

    languageDialogFileName(language) {
      return cred.dialogFileName(this.dialogName, cred.localeFromLanguage(language));
    }

    languageStringFileName(language) {
      return cred.stringFileName(this.dialogName, cred.localeFromLanguage(language));
    }

    get dialogName() {
      // The dialog name is the same for all locales, so grab the first available one.
      let resource = this._firstAvailableDialogResource();
      if (typeof resource === 'undefined') {
        return '';
      }
      return resource.dialogName;
    }

    // Returns the dialog resource for a given locale.
    dialogResource(locale) {
      // Resolve the link, if any.
      const resolvedLocale = this.isLinkedToMaster(locale) ? cred.locale.any : locale;
      return this._resources.get(resolvedLocale);
    }

    setDialogResource(locale, resource) {
      this._resources.set(locale, resource);
    }

    // Generator function for all unlinked dialog resources.
    *unlinkedDialogResources() {
      for (let resource of this._resources.values()) {
        yield resource;
      }
    }

    isLinkedToMaster(locale) {
      return locale === cred.locale.any || !this._resources.has(locale);
    }

    // Unlink a given locale to the master resource.
    linkToMaster(locale) {
      if (locale === cred.locale.any) {
        // Cannot link master to master.
        return;
      }

      // If all resources are unlinked, we have to re-create the master resource
      // as a copy of the linked resource before we can clear the linked resource.
      if (this.areAllLocalesUnlinked()) {
        this._copyResource(locale, cred.locale.any);
      }

      this._resources.delete(locale);
    }

    // Unlink a given locale from the master resource.
    unlinkFromMaster(locale) {
      if (locale === cred.locale.any) {
        // Cannot unlink master to master.
        return;
      }

      this._copyResource(cred.locale.any, locale);

      // Clear the master resource, if all resources are unlinked.
      if (this.areAllLocalesUnlinked()) {
        this._resources.delete(cred.locale.any);
      }
    }

    // Checks if the resources of all locales are unlinked from the master resource.
    areAllLocalesUnlinked() {
      for (let locale of cred.locale) {
        if (locale !== cred.locale.any && this.isLinkedToMaster(locale)) {
          return false;
        }
      }
      return true;
    }

    // Checks if the resources of all locales are linked to the master resource.
    areAllLocalesLinked() {
      for (let locale of cred.locale) {
        if (locale !== cred.locale.any && !this.isLinkedToMaster(locale)) {
          return false;
        }
      }
      return true;
    }

    // Generator function for all locales that have linked resources.
    *linkedLocales() {
      for (let locale of cred.locale) {
        if (this.isLinkedToMaster(locale)) {
          yield locale;
        }
      }
    }

    // Generator function for all locales that have unlinked resources.
    *unlinkedLocales() {
      for (let locale of cred.locale) {
        if (!this.isLinkedToMaster(locale)) {
          yield locale;
        }
      }
    }

    importLog(locale) {
      return this._importLog.get(locale);
    }

    setImportLog(locale, log) {
      this._importLog.set(locale, log);
    }

    lookupString(id, language) {
      return this._stringMap.text(id, language);
    }

    // Adds a id-string pair for a given language.
    addString(id, text, language) {
      this._stringMap.add(id, text, language);
    }

    // Adds the strings and resource encoding for a given language.
    // Duplicate strings will be overwritten with the passed in copy.
    addStrings(language, stringMap, resourceEncoding) {
      this._stringMap.setSourceEncoding(language, resourceEncoding);

      for (const entry of stringMap) {
        if (entry.length > 0) {
          this.addString(...entry);
        }
      }
    }

    // Returns the source encoding of a given language.
    sourceStringEncoding(language) {
      return this._stringMap.sourceEncoding(language);
    }

    // Returns a generator function for the strings of a given language.
    languageStrings(language) {
      return this._stringMap.languageStrings(language);
    }

    // Updates the dialog's id in all dialog resources.
    updateDialogId(id) {
      for (let [, dlgResource] of this._resources) {
        dlgResource.updateDialogId(id);
      }
    }

    // Updates a control's id in all dialog resources.
    updateControlId(currentId, id) {
      for (let [, dlgResource] of this._resources) {
        dlgResource.updateControlId(currentId, id);
      }
    }

    // Updates the value of a given property for a given layout item in the given
    // locales.
    updateProperty(layoutItem, propLabel, value, locales) {
      for (const locale of locales) {
        let property = this._resourceProperty(layoutItem, propLabel, locale);
        property.value = value;
      }
    }

    // Updates the value of a given localized string property for a given layout
    // item in the given locale.
    updateLocalizedStringProperty(layoutItem, propLabel, value, locale) {
      let property = this._resourceProperty(layoutItem, propLabel, locale);
      let language = cred.languageFromLocale(locale);
      // Safeguard against master locale, although localized properties should
      // be read-only in for the master layout.
      if (typeof language !== 'undefined') {
        // Localized properties have an identifier as value. The identifier
        // is a string id for the localized string. We have to change the string
        // in the string map, not the value of the property.
        if (property.type === cred.spec.physicalPropertyType.identifier) {
          let stringId = property.value;
          this.addString(stringId, value, language);
        } else {
          throw new Error('Unexpected property type for localized string property.');
        }
      }
    }

    // Updates the value of a given flags property for a given layout item in the
    // given locales.
    updateFlagProperty(layoutItem, propLabel, flagText, flagValue, isSet, locales) {
      for (const locale of locales) {
        let property = this._resourceProperty(layoutItem, propLabel, locale);

        if (isSet) {
          property.addFlag(flagText, flagValue);
        } else {
          property.removeFlag(flagText, flagValue);
        }
      }
    }

    // Normalizes localized string properties to always store a string identifier.
    normalizeLocalizedStrings() {
      let normalization = new LocalizedStringNormalization(this, this._stringMap);
      this._stringMap = normalization.normalize();
    }

    // Denormalizes localized string properties to store a string identifier when the
    // string's text is non-empty or the string directly when the text is empty.
    // String identifiers will be re-generated to be suitable for export.
    denormalizeLocalizedStrings() {
      let denormalization = new LocalizedStringDenormalization(this, this._stringMap);
      this._stringMap = denormalization.denormalize();
    }

    // Initializes the internal data structures.
    _init() {
      for (const locale of cred.locale) {
        this._importLog.set(locale, []);
      }
    }

    // Copies the resource of a given source locale to a given target locale.
    _copyResource(fromLocale, toLocale) {
      if (this._resources.has(fromLocale)) {
        let copy = this._resources.get(fromLocale).copyAs(toLocale);
        this._resources.set(toLocale, copy);
      } else {
        this._resources.delete(toLocale);
      }
    }

    // Returns the first available dialog resource.
    _firstAvailableDialogResource() {
      for (const [, resource] of this._resources) {
        return resource;
      }
      return undefined;
    }

    // Returns a property of a given layout item for a given locale.
    _resourceProperty(layoutItem, propLabel, locale) {
      let resourceDef = this._resourceDefinition(layoutItem, locale);
      return resourceDef.property(propLabel);
    }

    // Returns the resource definition of a given layout item for a given
    // locale.
    _resourceDefinition(layoutItem, locale) {
      let resource = this.dialogResource(locale);
      if (layoutItem.isDialog()) {
        return resource.dialogDefinition;
      }
      return resource.control(layoutItem.id);
    }
  }

  ///////////////////

  // Helper class that provides string ids for properties of dialog items (dialogs or
  // controls). If a string id exists already it will be returned, if not a new one will
  // be generated based on a given generator function.
  class StringIdRepository {
    constructor(idGenerator) {
      this._idGen = idGenerator;
      this._map = [];
    }

    // Returns the string id for a given property of a given dialog item (either the
    // dialog itself or a control in it). If no string id is stored for the property
    // generates a new one.
    getOrMake(dlgItem, prop) {
      let stringId = this.find(dlgItem, prop);
      if (typeof stringId === 'undefined') {
        stringId = this._idGen();
        this.add(dlgItem, prop, stringId);
      }
      return stringId;
    }

    find(dlgItem, prop) {
      for (let elem of this._map) {
        if (this._matches(dlgItem, prop, elem)) {
          return elem.id;
        }
      }
      return undefined;
    }

    add(dlgItem, prop, stringId) {
      this._map.push({
        item: dlgItem,
        property: prop,
        id: stringId
      });
    }

    _matches(dlgItem, prop, mapElem) {
      return (
        isEqualDialogOrControl(dlgItem, mapElem.item) &&
        prop.label === mapElem.property.label
      );
    }
  }

  ///////////////////

  // Normalizes localized string properties.
  // Normalization performs two operations:
  // - Always stores a string identifier to a string entry in the string map, even for
  //   empty strings. This allows to treat string processing later on more uniformly
  //   instead of always checking whether a property stores a string id or an empty
  //   string value.
  // - Replace all strings ids with internal string ids.
  class LocalizedStringNormalization {
    constructor(dlgResourceSet, stringMap) {
      this._dlgResourceSet = dlgResourceSet;
      // String map with the imported strings.
      this._stringMap = stringMap;
      // String map with the normalized strings.
      this._normalizedMap = undefined;
      // Mapping from imported to normalized ids.
      this._idLookup = undefined;
      // Repository that provides string ids for strings of properties that before
      // normalization held strings directly.
      this._newIdRepos = new StringIdRepository(generateInternalStringId);
    }

    // Starts the normalization.
    normalize() {
      this._normalizeStrings();
      this._normalizeProperties();
      return this._normalizedMap;
    }

    // Creates a copy of the string map with normalized strings ids.
    _normalizeStrings() {
      [this._normalizedMap, this._idLookup] = this._stringMap.copyWithRegeneratedIds(
        generateInternalStringId
      );
    }

    // Updates the string ids in the dialog and control properties. Normalizes strings
    // stored directly in properties.
    _normalizeProperties() {
      const dlgSpec = cred.spec.makeDialogSpec();

      for (let dlgRes of this._dlgResourceSet.unlinkedDialogResources()) {
        let dlg = dlgRes.dialogDefinition;
        let locale = dlgRes.locale;

        // Normalize dialog properties.
        for (let prop of dlg.properties()) {
          if (isLocalizedStringProperty(prop, dlgSpec)) {
            this._normalizeProperty(dlg, prop, locale);
          }
        }

        // Normalize control properties.
        for (let ctrl of dlg.controls()) {
          let ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
          for (let prop of ctrl.properties()) {
            if (isLocalizedStringProperty(prop, ctrlSpec)) {
              this._normalizeProperty(ctrl, prop, locale);
            }
          }
        }
      }
    }

    // Normalizes a given property.
    _normalizeProperty(item, prop, locale) {
      switch (prop.type) {
        case cred.spec.physicalPropertyType.identifier: {
          // Replace the id.
          const currentStrId = prop.value;

          let normedProp = new IdentifierPropertyDefinition(
            prop.label,
            cred.spec.physicalPropertyType.identifier,
            this._idLookup.get(currentStrId)
          );
          item.setProperty(prop.label, normedProp);
          break;
        }

        case cred.spec.physicalPropertyType.string: {
          // Move the string to the string map and replace the property with an
          // id property refering to the string.
          const strId = this._addString(item, prop, locale);

          let normedProp = new IdentifierPropertyDefinition(
            prop.label,
            cred.spec.physicalPropertyType.identifier,
            strId
          );
          item.setProperty(prop.label, normedProp);
          break;
        }

        default: {
          throw new Error('Unexpected property type when normalizing localized strings.');
        }
      }
    }

    // Adds a new string to the normalized string map for the string value of a given
    // property.
    _addString(item, prop, locale) {
      const stringId = this._newIdRepos.getOrMake(item, prop);

      const srcLang = cred.languageFromLocale(locale);
      for (const lang of cred.language) {
        if (lang === srcLang) {
          this._normalizedMap.add(stringId, prop.value, lang);
        } else {
          this._normalizedMap.add(stringId, '', lang);
        }
      }

      return stringId;
    }
  }

  ///////////////////

  // Denormalizes localized string properties.
  // Denormalization performs two operations:
  // - If a string is empty for all languages, removes the string from the string map
  //   and writes it directly into the properties that use it.
  // - Replaces all strings ids with persistent string ids.
  class LocalizedStringDenormalization {
    constructor(dlgResourceSet, stringMap) {
      this._dlgResourceSet = dlgResourceSet;
      // String map with the normalized strings.
      this._stringMap = stringMap;
      // String map with the denormalized strings.
      this._denormalizedMap = undefined;
      // Mapping from normalized to denormalized ids.
      this._idLookup = undefined;
    }

    // Starts the denormalization.
    denormalize() {
      this._denormalizeStrings();
      this._denormalizeProperties();
      return this._denormalizedMap;
    }

    _denormalizeStrings() {
      [this._denormalizedMap, this._idLookup] = this._stringMap.copyWithRegeneratedIds(
        generatePersistentStringId(this._dlgResourceSet.dialogName)
      );
    }

    _denormalizeProperties() {
      const dlgSpec = cred.spec.makeDialogSpec();

      for (let dlgRes of this._dlgResourceSet.unlinkedDialogResources()) {
        let dlg = dlgRes.dialogDefinition;

        // Denormalize dialog properties.
        for (let prop of dlg.properties()) {
          if (isLocalizedStringProperty(prop, dlgSpec)) {
            this._denormalizeProperty(dlg, prop);
          }
        }

        // Denormalize control properties.
        for (let ctrl of dlg.controls()) {
          let ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
          for (let prop of ctrl.properties()) {
            if (isLocalizedStringProperty(prop, ctrlSpec)) {
              this._denormalizeProperty(ctrl, prop);
            }
          }
        }
      }
    }

    // Denormalizes the string of a given property.
    _denormalizeProperty(item, prop) {
      if (prop.type !== cred.spec.physicalPropertyType.identifier) {
        throw new Error('Unexpected property type when denormalizing localized strings.');
      }

      const internalStrId = prop.value;
      const denormedStrId = this._idLookup.get(internalStrId);
      if (this._isStringEmptyAcrossAllLanguages(internalStrId)) {
        // Replace the property with a string property that holds the empty string
        // directly.
        let stringProp = new StringPropertyDefinition(
          prop.label,
          cred.spec.physicalPropertyType.string,
          ''
        );
        item.setProperty(prop.label, stringProp);
        // Remove the string from the string map.
        this._denormalizedMap.remove(denormedStrId);
      } else {
        // Replace the id with a persistent id.
        let denormedProp = new IdentifierPropertyDefinition(
          prop.label,
          cred.spec.physicalPropertyType.identifier,
          denormedStrId
        );
        item.setProperty(prop.label, denormedProp);
      }
    }

    // Checks if a string for a given id is empty for all languages.
    _isStringEmptyAcrossAllLanguages(stringId) {
      for (const lang of cred.language) {
        if (this._stringMap.text(stringId, lang).length > 0) {
          return false;
        }
      }
      return true;
    }
  }

  ///////////////////

  // Returns whether a given property is meant to hold a localized string.
  function isLocalizedStringProperty(prop, spec) {
    return (
      spec.propertySpec(prop.label).logicalType ===
      cred.spec.logicalPropertyType.localizedString
    );
  }

  // Maker to identify internal string ids. Could be used to identify internal ids.
  const internalStringIdMarker = '_internal';

  // Generates an internal string id. The value is only used internally and can
  // therefore be any unique string. During export persistent string ids will
  // be created. Internal strings can be identified as internal.
  function generateInternalStringId() {
    return util.uuidv4() + internalStringIdMarker;
  }

  // Returns a function that generates persistent string ids.
  function generatePersistentStringId(dlgName) {
    let idNum = 0;
    return function() {
      return `DLGPROP_${dlgName}_${idNum++}_Text`;
    };
  }

  ///////////////////

  // Collection of id to string mappings for all supported languages.
  class StringMap {
    constructor() {
      // Map that associates languages with their localized strings.
      // Each collection of strings is a map that associates string
      // identifiers with the string's text.
      this._map = new Map();
      // Map that associates languages with the encoding of their
      // string resource file.
      this._srcEncoding = new Map();

      for (const lang of cred.language) {
        this._map.set(lang, new Map());
      }
    }

    // Adds a string to the map.
    add(id, text, language) {
      this._map.get(language).set(id, text);
    }

    // Removes a string from all languages.
    remove(id) {
      for (let [, idMap] of this._map) {
        idMap.delete(id);
      }
    }

    // Returns the text of a string.
    text(id, language) {
      return this._map.get(language).get(id);
    }

    // Implements @@iterator method making the object iterable.
    // Returns the next (id, text, language) tuple in the collection.
    *[Symbol.iterator]() {
      for (const [lang, idMap] of this._map) {
        for (const [id, text] of idMap) {
          yield [id, text, lang];
        }
      }
    }

    // Generator function for all strings of a given language.
    *languageStrings(language) {
      const langMap = this._map.get(language);
      for (const [id, text] of langMap) {
        yield [id, text];
      }
    }

    // Returns the encoding of the string resource file for a given language.
    sourceEncoding(language) {
      return this._srcEncoding.get(language);
    }

    // Sets the encoding of the string resource file for a given language.
    setSourceEncoding(language, encoding) {
      this._srcEncoding.set(language, encoding);
    }

    // Creates a duplicate of the string map with ids replaced based on a given id
    // generator.
    // Returns the new string map and a mapping of the old string ids to the new ones.
    copyWithRegeneratedIds(idGenerator) {
      let duplicate = new StringMap();
      for (let [lang, encoding] of this._srcEncoding) {
        duplicate.setSourceEncoding(lang, encoding);
      }
      let idMapping = new Map();

      for (let [id, text, lang] of this) {
        let newId = idMapping.get(id);
        if (typeof newId === 'undefined') {
          newId = idGenerator();
          idMapping.set(id, newId);
        }
        duplicate.add(newId, text, lang);
      }

      return [duplicate, idMapping];
    }
  }

  ///////////////////

  // Holds data read from a dialog resource file.
  class DialogResource {
    constructor(locale) {
      // The locale that this definition applies to.
      this._locale = locale;
      // Version of the resource format.
      this.version = '';
      // Array of included header files.
      this._includedHeaders = [];
      // Map that associates languages with a string file.
      this._stringFiles = new Map();
      // Definition of the dialog.
      this._dlgDefinition = new DialogDefinition();
      // Array of layer definitions. A layer definition has a name and an array of
      // layer values.
      this._layerDefinitions = [];

      // When editing properties, also edit the copy function below!
    }

    // Returns a deep copy of the dialog resource with the locale adjusted to
    // a given target.
    copyAs(targetLocale) {
      let copy = new DialogResource(targetLocale);
      copy.version = this.version;
      copy._includedHeaders = util.copyArrayShallow(this._includedHeaders);
      for (const [lang, strFile] of this._stringFiles) {
        copy._stringFiles.set(lang, strFile);
      }
      copy._dlgDefinition = this._dlgDefinition.copy();
      copy._layerDefinitions = [];
      for (const layerDef of this._layerDefinitions) {
        copy._layerDefinitions.push(layerDef.copy());
      }
      return copy;
    }

    // Returns the locale of the resource.
    // Note that for linked resources this will be the locale that is linked to.
    get locale() {
      return this._locale;
    }

    get dialogName() {
      const name = this.dialogPropertyValue(cred.spec.propertyLabel.id);
      if (typeof name === 'undefined') {
        return '';
      }
      return name;
    }

    // Returns the file name of the dialog string file for language resources or
    // undefined for the master resource.
    stringFileName() {
      if (this._locale !== cred.locale.any) {
        return cred.stringFileName(
          this.dialogName,
          cred.languageFromLocale(this._locale)
        );
      }
      return undefined;
    }

    // Adds a string file for a given language.
    addStringFile(language, fileName) {
      this._stringFiles.set(language, fileName);
    }

    get dialogDefinition() {
      return this._dlgDefinition;
    }

    // Returns the value of a property with a given label.
    dialogPropertyValue(label) {
      const prop = this._dlgDefinition.property(label);
      if (prop) {
        return prop.value;
      }
      return undefined;
    }

    // Polymorphic function that adds a positional property to the dialog.
    addPositionalProperty(label, property) {
      this._dlgDefinition.addPositionalProperty(label, property);
    }

    // Polymorphic function that adds a labeled property to the dialog.
    addLabeledProperty(label, property) {
      this._dlgDefinition.addLabeledProperty(label, property);
    }

    // Polymorphic function that adds a serialized property to the dialog.
    addSerializedProperty(label, property) {
      this._dlgDefinition.addSerializedProperty(label, property);
    }

    control(id) {
      return this._dlgDefinition.control(id);
    }

    *controls() {
      yield* this._dlgDefinition.controls();
    }

    // Adds a control definition to the dialog.
    addControlDefinition(ctrl) {
      this._dlgDefinition.addControlDefinition(ctrl);
    }

    // Generator function for included headers.
    *includedHeaders() {
      for (const header of this._includedHeaders) {
        yield header;
      }
    }

    // Adds an included C/C++ header file.
    addIncludedHeader(headerName) {
      const headerLower = headerName.toLowerCase();
      let idx = this._includedHeaders.findIndex(elem => {
        return elem.toLowerCase() === headerLower;
      });
      if (idx === -1) {
        this._includedHeaders.push(headerName);
      }
    }

    // Generator function for layers of the resource.
    *layers() {
      for (const layer of this._layerDefinitions) {
        yield layer;
      }
    }

    // Adds a layer to the dialog resource.
    addLayer(layer) {
      this._layerDefinitions.push(layer);
    }

    // Updates the dialog's id.
    updateDialogId(id) {
      this._dlgDefinition.id = id;
    }

    // Updates a control's id.
    updateControlId(currentId, id) {
      this._dlgDefinition.updateControlId(currentId, id);
    }
  }

  ///////////////////

  // Dialog information read from the dialogs's resource for a particular locale.
  class DialogDefinition {
    constructor() {
      // Map that associates property labels with property definitions.
      this._properties = new Map();
      // Map that associates control ids with control definitions.
      this._controls = new Map();
      // When editing properties, also edit the copy function below!
    }

    // Returns a deep copy of the dialog definition.
    copy() {
      let copy = new DialogDefinition();
      for (let [label, property] of this._properties) {
        copy._properties.set(label, property.copy());
      }
      for (let [id, control] of this._controls) {
        copy._controls.set(id, control.copy());
      }
      return copy;
    }

    // Polymorphic function to return the definition's identifier.
    get id() {
      if (!this._properties.has(cred.spec.propertyLabel.id)) {
        throw new Error('Dialog id accessed before being defined.');
      }
      return this.property(cred.spec.propertyLabel.id).value;
    }

    // Polymorphic function to set the definition's identifier.
    set id(value) {
      let idProp = this.property(cred.spec.propertyLabel.id);
      if (idProp) {
        idProp.value = value;
      } else {
        // Create a property for the id.
        this.setProperty(
          cred.spec.propertyLabel.id,
          cred.resource.makePropertyDefinition(
            cred.spec.propertyLabel.id,
            cred.spec.physicalPropertyType.identifier,
            value
          )
        );
      }
    }

    // Polymorphic function to check if this definition is for a dialog.
    isDialog() {
      return true;
    }

    // Polymorphic function to check if a dialog property exists.
    haveProperty(label) {
      return this._properties.has(label);
    }

    // Polymorphic function to return a dialog property with a given label.
    property(label) {
      return this._properties.get(label);
    }

    // Polymorphic function to set a dialog property.
    // Sets the property straight without considering any policies.
    setProperty(label, property) {
      this._properties.set(label, property);
    }

    *properties() {
      for (let prop of this._properties.values()) {
        yield prop;
      }
    }

    // Polymorphic function that adds a positional property for the dialog.
    // Uses policy to resolve situations where a property is added multiple times.
    addPositionalProperty(label, property) {
      addPositionalProperty(label, property, this);
    }

    // Polymorphic function that adds a labeled property for the dialog.
    // Uses policy to resolve situations where a property is added multiple times.
    addLabeledProperty(label, property) {
      addLabeledProperty(label, property, this);
    }

    // Polymorphic function that adds a serialized property for the dialog.
    // Uses policy to resolve situations where a property is added multiple times.
    addSerializedProperty(label, property) {
      addSerializedProperty(label, property, this);
    }

    control(id) {
      return this._controls.get(id);
    }

    *controls() {
      for (let ctrl of this._controls.values()) {
        yield ctrl;
      }
    }

    // Adds a control definition to the dialog.
    addControlDefinition(ctrl) {
      if (!this._controls.has(ctrl.id)) {
        this._controls.set(ctrl.id, ctrl);
      } else {
        throw new Error('Control exists already.');
      }
    }

    // Updates the id of a control.
    updateControlId(currentId, id) {
      let ctrl = this._controls.get(currentId);
      if (ctrl) {
        ctrl.id = id;
        // Also, change the control map to associate the new id with the control.
        this._controls.set(id, ctrl);
        this._controls.delete(currentId);
      }
    }
  }

  ///////////////////

  // Control information read from the dialogs's resource.
  class ControlDefinition {
    constructor(type, id) {
      if (!type || !id) {
        throw new Error('Invalid arguments. Control must have a type and an identifier.');
      }
      // Map that associates property labels with property definition objects.
      this._properties = new Map();
      // When editing fields, also edit the copy function below!

      // Add properties for the given type and id.
      this.addLabeledProperty(
        cred.spec.propertyLabel.ctrlType,
        makePropertyDefinition(
          cred.spec.propertyLabel.ctrlType,
          cred.spec.physicalPropertyType.identifier,
          type
        )
      );
      this.addLabeledProperty(
        cred.spec.propertyLabel.id,
        makePropertyDefinition(
          cred.spec.propertyLabel.id,
          cred.spec.physicalPropertyType.identifier,
          id
        )
      );
    }

    // Returns a deep copy of the control definition.
    copy() {
      let copy = new ControlDefinition(this.type, this.id);
      for (let [label, property] of this._properties) {
        copy._properties.set(label, property.copy());
      }
      return copy;
    }

    get type() {
      return this._properties.get(cred.spec.propertyLabel.ctrlType).value;
    }

    // Polymorphic function to return the control's identifier.
    get id() {
      return this.property(cred.spec.propertyLabel.id).value;
    }

    // Polymorphic function to set the definition's identifier.
    set id(value) {
      return (this.property(cred.spec.propertyLabel.id).value = value);
    }

    // Polymorphic function to check if this definition is for a dialog.
    isDialog() {
      return false;
    }

    // Polymorphic function to check if a dialog property exists.
    haveProperty(label) {
      return this._properties.has(label);
    }

    // Polymorphic function to return a control property with a given label.
    property(label) {
      return this._properties.get(label);
    }

    // Polymorphic function to set a control property.
    // Sets the property straight without considering any policies.
    setProperty(label, property) {
      this._properties.set(label, property);
    }

    *properties() {
      for (let prop of this._properties.values()) {
        yield prop;
      }
    }

    // Polymorphic function that adds a positional property for the control.
    // Uses policy to resolve situations where a property is added multiple times.
    addPositionalProperty(pos, property) {
      addPositionalProperty(pos, property, this);
    }

    // Polymorphic function that adds a labeled property for the control.
    // Uses policy to resolve situations where a property is added multiple times.
    addLabeledProperty(label, property) {
      addLabeledProperty(label, property, this);
    }

    // Polymorphic function that adds a serialized property for the control.
    // Uses policy to resolve situations where a property is added multiple times.
    addSerializedProperty(label, property) {
      addSerializedProperty(label, property, this);
    }
  }

  // Checks whether a given object is a control or dialog.
  function isDialogOrControl(item) {
    if (typeof item === 'undefined') {
      return false;
    }
    // Dialog and control objects have a polymorphic 'isDialog' property.
    return typeof Object.getOwnPropertyDescriptor(item, 'isDialog') !== 'undefined';
  }

  // Checks whether two given dialog or control objects are equal.
  function isEqualDialogOrControl(a, b) {
    if (!a || !b) {
      return false;
    }
    if (!isDialogOrControl(a) || !isDialogOrControl(b)) {
      return false;
    }
    return a.isDialog() === b.isDialog() && a.id === b.id;
  }

  ///////////////////

  // A dialog or control property read from the dialogs's resource.
  class PropertyDefinition {
    constructor(label, physicalType, value) {
      this._label = label;
      // The type of the property as defined by cred.spec.physicalPropertyType.
      this._physicalType = physicalType;
      this.value = value;
      // When editing properties, also edit the copy function below!
    }

    get label() {
      return this._label;
    }

    get type() {
      return this._physicalType;
    }

    // Polymorphic function that returns the value as string.
    valueAsString() {
      return `${this.value}`;
    }
  }

  // Defintion for a number property.
  class NumberPropertyDefinition extends PropertyDefinition {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property definition.
    copy() {
      return new NumberPropertyDefinition(this.label, this.type, this.value);
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return typeof this.value !== 'undefined';
    }
  }

  // Defintion for a string property.
  class StringPropertyDefinition extends PropertyDefinition {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property definition.
    copy() {
      return new StringPropertyDefinition(this.label, this.type, this.value);
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return !(typeof this.value === 'undefined' || this.value === '');
    }

    // Polymorphic function that returns the value as string.
    valueAsString() {
      return `"${this.value}"`;
    }
  }

  // Defintion for an identifier property.
  class IdentifierPropertyDefinition extends PropertyDefinition {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property definition.
    copy() {
      return new IdentifierPropertyDefinition(this.label, this.type, this.value);
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return !(typeof this.value === 'undefined' || this.value === '');
    }
  }

  // Defintion for a property that consists of bit flags. The value field represents
  // the total value of the flags.
  class FlagsPropertyDefinition extends PropertyDefinition {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
      // Array of strings for the flags.
      this._flags = [];

      if (typeof this.value !== 'number') {
        this.value = 0;
      }
      // When editing properties, also edit the copy function below!
    }

    // Polymorthic function that returns a deep copy of the property definition.
    copy() {
      let copy = new FlagsPropertyDefinition(this.label, this.type, this.value);
      copy._flags = util.copyArrayShallow(this._flags);
      return copy;
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return this.value !== 0 || this._flags.length > 0;
    }

    // Polymorphic function that returns the value as string.
    valueAsString() {
      let str = '';
      for (const flag of this._flags) {
        str += flag + ' | ';
      }
      str += this.value;
      return str;
    }

    // Adds a flag string.
    // The bit value defaults to zero because it might not be provided.
    addFlag(flag, bitValue = 0) {
      if (!this.isSet(flag)) {
        this._flags.push(flag);
        if (bitValue > 0) {
          this.value |= bitValue;
        }
      }
    }

    // Removes a flag string.
    // The bit value defaults to zero because it might not be provided.
    removeFlag(flag, bitValue = 0) {
      let idx = this._flags.indexOf(flag);
      if (idx !== -1) {
        this._flags.splice(idx, 1);
        if (bitValue > 0) {
          this.value &= ~bitValue;
        }
      }
    }

    // Tests whether a given flag is set.
    isSet(flag) {
      return this._flags.indexOf(flag) !== -1;
    }
  }

  // Factory function for property definition objects.
  function makePropertyDefinition(label, type, value) {
    switch (type) {
      case cred.spec.physicalPropertyType.number: {
        return new NumberPropertyDefinition(label, type, value);
      }
      case cred.spec.physicalPropertyType.string: {
        return new StringPropertyDefinition(label, type, value);
      }
      case cred.spec.physicalPropertyType.identifier: {
        return new IdentifierPropertyDefinition(label, type, value);
      }
      case cred.spec.physicalPropertyType.flags: {
        return new FlagsPropertyDefinition(label, type, value);
      }
      default: {
        throw new Error('Unexpected physical property type.');
      }
    }
  }

  ///////////////////

  // There are three ways of how properties might be defined in the resource file:
  // - Positional properties: Properties that are identified by their position in the
  //                          target object's resource definition.
  // - Labeled properties:    Properties that are defined through specific keywords
  //                          as label-value pairs in the target object's resource.
  //                          They are identfied by their label.
  // - Serialized properties: Properties that are serialized as label-value pairs
  //                          into a string representation in the target object's
  //                          resource.
  // Individual properties can be defined multiple times in different ways within the
  // same resource.

  // Policy function that adds a positional property to a target object.
  // The target object has to provide a polymorphic function.
  function addPositionalProperty(label, property, target) {
    // Overwrite any existing property with that label because positional
    // properties have priority over labeled properties and the same priority
    // as serialized properties.
    target.setProperty(label, property);
  }

  // Policy function that adds a labeled property to a target object.
  // The target object has to provide a polymorphic function.
  function addLabeledProperty(label, property, target) {
    // Only add the property if it doesn't exist yet because labeled properties have
    // lower priority than positional properties.
    if (!target.haveProperty(label)) {
      target.setProperty(label, property);
    }
  }

  // Policy function that adds a serialized property to a target object.
  // The target object has to provide a polymorphic function.
  function addSerializedProperty(label, property, target) {
    // Overwrite any existing property with that label because serialized properties
    // have priority over labeled properties and the same priority as positional
    // properties.
    target.setProperty(label, property);
  }

  ///////////////////

  // Definition of a layer in a dialog resource.
  class LayerDefinition {
    constructor(name, numbers) {
      this._name = name;
      // Array of integer numbers.
      this._numbers = numbers || [];
    }

    // Returns a deep copy of the object.
    copy() {
      let copy = new LayerDefinition(this._name);
      // Since array is only holding primitive values we can make a shallow copy of
      // it.
      copy._numbers = util.copyArrayShallow(this._numbers);
      return copy;
    }

    get name() {
      return this._name;
    }

    countNumbers() {
      return this._numbers.length;
    }

    // Generator function for the numbers of the layer.
    *numbers() {
      for (const num of this._numbers) {
        yield num;
      }
    }

    hasNumber(num) {
      return this._numbers.includes(num);
    }

    addNumber(num) {
      if (!this._numbers.includes(num)) {
        this._numbers.push(num);
      }
    }
  }

  ///////////////////

  // Verifies the definition of a dialog against a dialog specification.
  class DialogVerifier {
    constructor(dlgDefinition) {
      this._dlgDefinition = dlgDefinition;
      this._dlgSpec = cred.spec.makeDialogSpec();
      // Log of detected issues.
      this._log = [];
    }

    // Starts the verification process and returns the log of collected issues.
    verify() {
      this._verifyDialogProperties();
      this._verifyControlProperties();
      return this._log;
    }

    // Verifies the properties of the dialog.
    _verifyDialogProperties() {
      this._verifyDefinedDialogProperties();
      this._verifySpecifiedDialogProperties();
    }

    // Verifies that the properties defined in the dialog resource follow the
    // dialog specification.
    _verifyDefinedDialogProperties() {
      for (let prop of this._dlgDefinition.properties()) {
        this._verifyDefinedProperty(
          prop,
          this._dlgSpec.propertySpec(prop.label),
          'dialog',
          prop.label
        );
      }
    }

    // Verifies that the properties specified for the dialog are matched by
    // the actually defined properties.
    _verifySpecifiedDialogProperties() {
      for (let propSpec of this._dlgSpec.propertySpecs()) {
        const label = propSpec.label;
        this._verifySpecifiedProperty(
          this._dlgDefinition.property(label),
          propSpec,
          'dialog',
          label
        );
      }
    }

    // Verifies the properties of each of the dialog's controls.
    _verifyControlProperties() {
      for (let ctrl of this._dlgDefinition.controls()) {
        let ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
        this._verifyDefinedControlProperties(ctrl, ctrlSpec);
        this._verifySpecifiedControlProperties(ctrl, ctrlSpec);
      }
    }

    // Verifies that the properties defined in a control definition follow the
    // control's specification.
    _verifyDefinedControlProperties(ctrl, ctrlSpec) {
      for (let prop of ctrl.properties()) {
        this._verifyDefinedProperty(
          prop,
          ctrlSpec.propertySpec(prop.label),
          'control',
          prop.label
        );
      }
    }

    // Verifies that the properties specified for a control are matched by
    // the actual defined properties.
    _verifySpecifiedControlProperties(ctrl, ctrlSpec) {
      for (let propSpec of ctrlSpec.propertySpecs()) {
        const label = propSpec.label;
        this._verifySpecifiedProperty(ctrl.property(label), propSpec, 'control', label);
      }
    }

    // Verifies that a defined property follows its specification.
    _verifyDefinedProperty(property, propSpec, parentDescription, propLabel) {
      if (!propSpec) {
        this._reportWarning(
          `Defined ${parentDescription} property '${propLabel}': No spec found.`
        );
        // Cannot continue without spec.
        return;
      }
      if (!propSpec.isNullable() && !property.hasValue()) {
        this._reportError(
          `Defined ${parentDescription} property '${propLabel}': Non-nullable property has no value.`
        );
      }
    }

    // Verifies that a specified property is matched by the actual defined property.
    _verifySpecifiedProperty(property, propSpec, parentDescription, propLabel) {
      if (!property && propSpec.isRequired()) {
        this._reportError(
          `Specified ${parentDescription} property '${propLabel}': Required property is not defined.`
        );
      }
      // Cannot continue without property to check.
      if (!property) {
        return;
      }
      // Add more tests here.
    }

    _reportError(text) {
      this._log.push('[Error] - ' + text);
    }

    _reportWarning(text) {
      this._log.push('[Warning] - ' + text);
    }
  }

  // Verifies a given dialog definition and returns a log of issues.
  function verifyDialog(dlgDefinition) {
    let verifier = new DialogVerifier(dlgDefinition);
    return verifier.verify();
  }

  ///////////////////

  // Exports
  return {
    ControlDefinition: ControlDefinition,
    DialogDefinition: DialogDefinition,
    DialogResource: DialogResource,
    DialogResourceSet: DialogResourceSet,
    LayerDefinition: LayerDefinition,
    makePropertyDefinition: makePropertyDefinition,
    ResourceManager: ResourceManager,
    StringMap: StringMap,
    verifyDialog: verifyDialog
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.resource;
