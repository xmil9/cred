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
var cred = tryRequire('./types') || cred || {};
cred.spec = tryRequire('./spec') || cred.spec || {};
var util = tryRequire('./util') || util || {};
var web = tryRequire('./web') || web || {};

///////////////////

// Resource module.
cred.resource = (function() {
  ///////////////////

  // Handles interactions between the resource model and other parts of the app.
  class ResourceManager {
    constructor() {
      this._resourceSet = undefined;
      this._controller = undefined;
      this._undos = new Undos();
    }

    setup() {
      // Nothing to do.
    }

    // Inject controller.
    set controller(value) {
      this._controller = value;
    }

    // Inject resource set. For testing only.
    set resourceSet(value) {
      this._resourceSet = value;
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

    lookupString(stringId, language) {
      return this._resourceSet.lookupString(stringId, language);
    }

    // Notifications

    onCreateDialogNotification(dlgId) {
      this._createDialog(dlgId);
    }

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

    onAddControlNotification(resourceId, ctrlType, bounds) {
      this._addControl(this._controller.currentLocale, resourceId, ctrlType, bounds);
    }

    onRemoveControlNotification(uniqueId) {
      this._removeControl(this._controller.currentLocale, uniqueId);
    }

    onStoreUndoNotification() {
      this._storeUndo();
    }

    onUndoNotification() {
      this._undo();
    }

    onRedoNotification() {
      this._redo();
    }

    // Resets the resoure managers internal state to hold a new dialog.
    _createDialog(dlgId) {
      const dlgTitleText = '';
      const dlgTitleTextStrId = 'kTitleStrId';

      const builder = new cred.resource.DialogResourceSetBuilder();
      builder.addResource(
        makeMinimalDialogResource(cred.locale.any, dlgId, dlgTitleTextStrId)
      );
      for (const lang of cred.language) {
        const strMap = new StringMap();
        strMap.add(dlgTitleTextStrId, dlgTitleText, lang);
        builder.addStrings(lang, strMap);
      }

      this._resourceSet = builder.build();
      this._storeUndo();
      this._controller.notifyDialogCreated(this, this._resourceSet);
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
          self._storeUndo();
          self._controller.notifyDialogLoaded(this, resourceSet);
        })
        .catch(err => {
          self._controller.notifyErrorOccurred(
            this,
            `Unable to open file ${fileSet.dialogId}.\n${err}`
          );
        });
    }

    // Stores the current dialog resources.
    _storeDialog() {
      if (this._resourceSet) {
        let writer = new cred.io.Writer(this._resourceSet, this._writeTextFile);
        writer.write();
      }
    }

    // Write given text to a file with a given name.
    _writeTextFile(fileName, text) {
      web.saveTextFile(fileName, text, $('#save-download-link')[0]);
    }

    // Updates the id of a given layout item.
    _updateItemId(layoutItem, id) {
      // An item's id is shared among all locale resources, so we have to change
      // all of them. Also, control ids are used as keys in some dialog data
      // structures and need special treatment there.
      if (layoutItem.isDialog()) {
        this._resourceSet.updateDialogId(id);
      } else {
        this._resourceSet.updateControlId(layoutItem.uniqueId, id);
      }
    }

    // Updates the bounds stored in the resource of a given layout item.
    _updateItemBounds(layoutItem, bounds) {
      // The bounds of an item are specific to that item and can be different
      // for each locale, so only the item's resource needs to be changed,
      // the other locales remain untouched (in case they are linked the
      // item resource will be the same!).
      let resource = layoutItem.resource();
      this._setResourceBounds(resource, bounds);
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

    // Adds a control with given resource id, type, and bounds.
    _addControl(locale, resourceId, ctrlType, bounds) {
      const ctrlResource = this._resourceSet.addControl(locale, ctrlType, resourceId);
      ctrlResource.generatePropertiesWithDefaults();
      if (typeof bounds !== 'undefined') {
        this._setResourceBounds(ctrlResource, bounds);
      }
    }

    // Removes a control with given id.
    _removeControl(locale, uniqueId) {
      if (this._resourceSet.removeControl(locale, uniqueId)) {
        this._controller.notifyControlRemoved(this, uniqueId);
      }
    }

    // Sets the properties that contain bounds information of a given resource.
    _setResourceBounds(resource, bounds) {
      if (resource) {
        const propLabel = cred.spec.propertyLabel;
        resource.setPropertyValue(propLabel.left, bounds.left);
        resource.setPropertyValue(propLabel.top, bounds.top);
        resource.setPropertyValue(propLabel.width, bounds.width);
        resource.setPropertyValue(propLabel.height, bounds.height);
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

    // Stores the current resource state in the undo sequence.
    _storeUndo() {
      this._undos.addNewState(this._resourceSet.copy());
    }

    // Applies a given undo state as new resource state.
    _applyUndo(undoState) {
      if (typeof undoState !== 'undefined') {
        this._resourceSet = undoState.copy();
        this._controller.notifyUndoApplied(this, this._resourceSet);
      }
    }

    // Performs undo.
    _undo() {
      this._applyUndo(this._undos.undo());
    }

    // Performs redo.
    _redo() {
      this._applyUndo(this._undos.redo());
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

  // Keeps track of the undo/redo state of the resources.
  class Undos {
    constructor() {
      // Array of resource sets each representing an undo state.
      this._undoStates = [];
      this._pos = -1;
    }

    addNewState(resourceSet) {
      // Discard all states past the current one.
      this._undoStates = this._undoStates.slice(0, this._pos + 1);
      this._undoStates.push(resourceSet);
      this._pos = this._undoStates.length - 1;
    }

    undo() {
      if (this._pos > 0) {
        --this._pos;
        return this._undoStates[this._pos];
      }
      return undefined;
    }

    redo() {
      if (this._pos < this._undoStates.length - 1) {
        ++this._pos;
        return this._undoStates[this._pos];
      }
      return undefined;
    }
  }

  ///////////////////

  // Holds all data contained in a set of dialog resource files.
  class DialogResourceSet {
    constructor(resourcesMap, stringMap, importLogMap) {
      // Map of unlinked resources that associates locales with their resources.
      // Linked resources are not contained in the map.
      this._resources = resourcesMap;
      // Data structure that maps string identifiers to strings for each language.
      this._stringMap = stringMap;
      // Maps that associates locales with a log of collected issues when
      // importing the dialog.
      this._importLogs = importLogMap || new Map();
      for (const locale of cred.locale) {
        if (!this._importLogs.has(locale)) {
          this._importLogs.set(locale, []);
        }
      }
      // Crypto API that supports a getRandomValues() function with the same semantics as
      // window.crypto.getRandomValues.
      // Can be injected by calling setCrypto().
      this._crypto = window.crypto;
    }

    // Returns a deep copy of the resource set.
    copy() {
      const copiedResources = new Map();
      for (const [locale, dlgRes] of this._resources) {
        copiedResources.set(locale, dlgRes.copy());
      }
      const copiedImportLogs = new Map();
      for (const [locale, log] of this._importLogs) {
        copiedImportLogs.set(locale, util.copyArrayShallow(log));
      }

      const copiedSet = new DialogResourceSet(
        copiedResources,
        this._stringMap.copy(),
        copiedImportLogs
      );
      copiedSet.setCrypto(this._crypto);
      return copiedSet;
    }

    // Inject a custom crypto API.
    setCrypto(crypto) {
      if (typeof crypto !== 'undefined') {
        this._crypto = crypto;
      }
    }

    // Returns the file name of the master resource file.
    get masterFileName() {
      const dlgId = this.dialogId;
      if (dlgId.length > 0) {
        return cred.dialogFileName(this.dialogId, cred.locale.any);
      }
      return '';
    }

    // Returns the name of the dialog file for a given language.
    languageDialogFileName(language) {
      return cred.dialogFileName(this.dialogId, cred.localeFromLanguage(language));
    }

    // Returns the name of the string file for a given language. Returns empty string if
    // there is no resource for the given language.
    languageStringFileName(language) {
      return cred.stringFileName(this.dialogId, cred.localeFromLanguage(language));
    }

    get dialogId() {
      // The dialog name is the same for all locales. Use the English resource.
      const resource = this.dialogResource(cred.locale.english);
      return resource.dialogId;
    }

    // Returns the dialog resource for a given locale or undefined if the resource does
    // not exist.
    dialogResource(locale) {
      // Resolve the link, if any.
      const resolvedLocale = this.isLinkedToMaster(locale) ? cred.locale.any : locale;
      return this._resources.get(resolvedLocale);
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

    // Link a given locale to the master resource.
    linkToMaster(locale) {
      if (locale === cred.locale.any) {
        // Cannot link master to master.
        return;
      }

      // If all resources are unlinked, we have to re-create the master resource
      // as a copy of the linked resource before we can clear the linked resource.
      if (this.areAllLanguagesUnlinked()) {
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
      if (this.areAllLanguagesUnlinked()) {
        this._resources.delete(cred.locale.any);
      }
    }

    // Checks if the resources of all languages are unlinked from the master resource.
    areAllLanguagesUnlinked() {
      for (let lang of cred.language) {
        if (this.isLinkedToMaster(cred.localeFromLanguage(lang))) {
          return false;
        }
      }
      return true;
    }

    // Checks if the resources of all languages are linked to the master resource.
    areAllLanguagesLinked() {
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

    importLog(locale) {
      return this._importLogs.get(locale);
    }

    lookupString(id, language) {
      return this._stringMap.text(id, language);
    }

    // Adds a id-string pair for a given language.
    addString(id, text, language) {
      this._stringMap.add(id, text, language);
    }

    // Returns a generator function for the strings of a given language.
    languageStrings(language) {
      return this._stringMap.languageStrings(language);
    }

    // Returns the source encoding of a given language.
    sourceStringEncoding(language) {
      return this._stringMap.sourceEncoding(language);
    }

    // Adds a control with a given type and resource id to the dialog resource
    // for a given locale.
    // Returns the control resource.
    addControl(locale, ctrlType, resourceId) {
      return this.dialogResource(locale).addControl(ctrlType, resourceId);
    }

    // Removes a control with a given id from the dialog resource for a given locale.
    // Returns true/false as success status.
    removeControl(locale, uniqueId) {
      return this.dialogResource(locale).removeControl(uniqueId);
    }

    // Updates the dialog's id in all dialog resources.
    updateDialogId(id) {
      for (const dlgResource of this._resources.values()) {
        dlgResource.updateDialogId(id);
      }
    }

    // Updates a control's resource id in all dialog resources.
    updateControlId(ctrlId, newResourceId) {
      for (const dlgResource of this._resources.values()) {
        dlgResource.updateControlId(ctrlId, newResourceId);
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
      let normalization = new LocalizedStringNormalization(
        this,
        this._stringMap,
        this._crypto
      );
      this._stringMap = normalization.normalize();
    }

    // Denormalizes localized string properties to store a string identifier when the
    // string's text is non-empty or the string directly when the text is empty.
    // String identifiers will be re-generated to be suitable for export.
    denormalizeLocalizedStrings() {
      let denormalization = new LocalizedStringDenormalization(this, this._stringMap);
      this._stringMap = denormalization.denormalize();
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

    // Returns a property of a given layout item for a given locale.
    _resourceProperty(layoutItem, propLabel, locale) {
      let resource = this._resource(layoutItem, locale);
      return resource.property(propLabel);
    }

    // Returns the resource of a given layout item for a given locale.
    _resource(layoutItem, locale) {
      let resource = this.dialogResource(locale);
      if (layoutItem.isDialog()) {
        return resource.dialog;
      }
      return resource.control(layoutItem.uniqueId);
    }
  }

  ///////////////////

  // Builds a dialog resource set object after collecting all required data. Verifies
  // invariants for valid dialog resource sets.
  class DialogResourceSetBuilder {
    constructor() {
      // Array of arrays each holding a resource and its import log.
      this._resources = [];
      // Array of arrays each holding a language, its string map, and encoding. Note that
      // the strings for each language are kept in a string map data structure which
      // supports multiple language. This is done purely for convenience, not because the
      // multi-language capability is needed. The string maps for each language will be
      // combined into one string map for the resource set.
      this._strings = [];
      // Crypto API that supports a getRandomValues() function with the same sematics as
      // window.crypto.getRandomValues.
      this._crypto = undefined;
    }

    addResource(resource, importLog) {
      this._resources.push([resource, importLog]);
    }

    addStrings(language, stringMap, encoding) {
      this._strings.push([language, stringMap, encoding]);
    }

    setCrypto(crypto) {
      this._crypto = crypto;
    }

    // Builds a DialogResourceSet object from the collected data.
    build() {
      const resourceMap = new Map();
      const importLogs = new Map();
      for (let [resource, log] of this._resources) {
        resourceMap.set(resource.locale, resource);
        importLogs.set(resource.locale, log || []);
      }

      const stringMap = new StringMap();
      for (const [lang, langStrMap, encoding] of this._strings) {
        // Integrate the string map
        for (const entry of langStrMap) {
          if (entry.length > 0) {
            stringMap.add(...entry);
          }
        }
        stringMap.setSourceEncoding(lang, encoding);
      }

      DialogResourceSetBuilder._verifyInvariants(resourceMap, stringMap, importLogs);
      const resSet = new DialogResourceSet(resourceMap, stringMap, importLogs);

      if (typeof this._crypto !== 'undefined') {
        resSet.setCrypto(this._crypto);
      }
      return resSet;
    }

    // Verifies that the dioalog resource set invariants are valid.
    static _verifyInvariants(resourceMap, stringMap, importLogs) {
      DialogResourceSetBuilder._verifyResourceInvariants(resourceMap);
      DialogResourceSetBuilder._verifyStringInvariants(stringMap);
      DialogResourceSetBuilder._verifyImportLogInvariants(importLogs);
    }

    static _verifyResourceInvariants(resourceMap) {
      DialogResourceSetBuilder._verifyLinking(resourceMap);
      DialogResourceSetBuilder._verifyDialogId(resourceMap);
    }

    static _verifyLinking(resourceMap) {
      const numSupportedLangs = Array.from(cred.language).length;
      const numResources = resourceMap.size;

      if (resourceMap.has(cred.locale.any)) {
        const numLangResources = numResources - 1;
        const hasLinkedLanguageResources = numLangResources < numSupportedLangs;
        if (!hasLinkedLanguageResources) {
          throw new Error(
            'DialogResourceSet with all languages unlinked should not have a master resource.'
          );
        }
      } else {
        const hasLinkedLanguageResources = numResources < numSupportedLangs;
        if (hasLinkedLanguageResources) {
          throw new Error(
            'DialogResourceSet with linked languages has to have a master resource.'
          );
        }
      }
    }

    static _verifyDialogId(resourceMap) {
      let dlgId = undefined;
      for (const resource of resourceMap.values()) {
        if (typeof dlgId === 'undefined' || dlgId.length === 0) {
          dlgId = resource.dialogId;
        } else if (resource.dialogId !== dlgId) {
          throw Error(
            'DialogResourceSet cannot contain resources with different dialog names.'
          );
        }
      }
    }

    static _verifyStringInvariants(/*stringMap*/) {
      // Nothing.
    }

    static _verifyImportLogInvariants(/*importLogs*/) {
      // Nothing.
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
          return elem.resourceId;
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
    constructor(dlgResourceSet, stringMap, crypto) {
      this._dlgResourceSet = dlgResourceSet;
      // String map with the imported strings.
      this._stringMap = stringMap;
      // Crypto API that needs to support a getRandomValues function with the semantics
      // as window.crypto.getRandomValues().
      this._crypto = crypto;
      // String map with the normalized strings.
      this._normalizedMap = undefined;
      // Mapping from imported to normalized ids.
      this._idLookup = undefined;
      // Repository that provides string ids for strings of properties that before
      // normalization held strings directly.
      this._newIdRepos = new StringIdRepository(() => generateInternalStringId(crypto));
    }

    // Starts the normalization.
    normalize() {
      this._normalizeStrings();
      this._normalizeProperties();
      return this._normalizedMap;
    }

    // Creates a copy of the string map with normalized strings ids.
    _normalizeStrings() {
      const self = this;
      [this._normalizedMap, this._idLookup] = this._stringMap.copyWithRegeneratedIds(() =>
        generateInternalStringId(self._crypto)
      );
    }

    // Updates the string ids in the dialog and control properties. Normalizes strings
    // stored directly in properties.
    _normalizeProperties() {
      const dlgSpec = cred.spec.makeDialogSpec();

      for (let dlgRes of this._dlgResourceSet.unlinkedDialogResources()) {
        let dlg = dlgRes.dialog;
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

          let normedProp = new IdentifierProperty(
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

          let normedProp = new IdentifierProperty(
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
        generatePersistentStringId(this._dlgResourceSet.dialogId)
      );
    }

    _denormalizeProperties() {
      const dlgSpec = cred.spec.makeDialogSpec();

      for (let dlgRes of this._dlgResourceSet.unlinkedDialogResources()) {
        let dlg = dlgRes.dialog;

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
        let stringProp = new StringProperty(
          prop.label,
          cred.spec.physicalPropertyType.string,
          ''
        );
        item.setProperty(prop.label, stringProp);
        // Remove the string from the string map.
        this._denormalizedMap.remove(denormedStrId);
      } else {
        // Replace the id with a persistent id.
        let denormedProp = new IdentifierProperty(
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
  function generateInternalStringId(crypto) {
    return util.makeUuidV4(crypto) + internalStringIdMarker;
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
      this._map = StringMap._makeTopLevelMap();
      // Map that associates languages with the encoding of their
      // string resource file.
      this._srcEncoding = new Map();
    }

    // Returns a deep copy of the string map.
    copy() {
      let duplicate = new StringMap();
      for (let [lang, encoding] of this._srcEncoding) {
        duplicate.setSourceEncoding(lang, encoding);
      }
      for (let [id, text, lang] of this) {
        duplicate.add(id, text, lang);
      }
      return duplicate;
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

    // Creates the top level map object that associates languages with their string maps.
    // Initializes each inner string map to be empty.
    static _makeTopLevelMap() {
      const topMap = new Map();
      for (const lang of cred.language) {
        topMap.set(lang, new Map());
      }
      return topMap;
    }
  }

  ///////////////////

  // Holds data read from a dialog resource file.
  class DialogResource {
    constructor(locale) {
      // The locale that this resource applies to.
      this._locale = locale;
      // Version of the resource format.
      this.version = '';
      // Array of included header files.
      this._includedHeaders = [];
      // Map that associates languages with a string file.
      this._stringFiles = new Map();
      // Definition of the dialog.
      this._dlg = new Dialog();
      // Array of layers. A layer has a name and an array of layer values.
      this._layers = [];

      // When editing properties, also edit the copy function below!
    }

    // Returns a deep copy of the dialog resource.
    copy() {
      return this.copyAs(this.locale);
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
      copy._dlg = this._dlg.copy();
      copy._layers = [];
      for (const layer of this._layers) {
        copy._layers.push(layer.copy());
      }
      return copy;
    }

    // Returns the locale of the resource.
    // Note that for linked resources this will be the locale that is linked to.
    get locale() {
      return this._locale;
    }

    get dialogId() {
      const id = this.dialogPropertyValue(cred.spec.propertyLabel.id);
      if (typeof id === 'undefined') {
        return '';
      }
      return id;
    }

    // Returns the file name of the dialog string file for language resources or
    // undefined for the master resource.
    stringFileName() {
      if (this._locale !== cred.locale.any) {
        return cred.stringFileName(this.dialogId, cred.languageFromLocale(this._locale));
      }
      return undefined;
    }

    // Adds a string file for a given language.
    addStringFile(language, fileName) {
      this._stringFiles.set(language, fileName);
    }

    get dialog() {
      return this._dlg;
    }

    // Returns the value of a property with a given label.
    dialogPropertyValue(label) {
      const prop = this._dlg.property(label);
      if (prop) {
        return prop.value;
      }
      return undefined;
    }

    // Polymorphic function that adds a positional property to the dialog.
    addPositionalProperty(label, property) {
      this._dlg.addPositionalProperty(label, property);
    }

    // Polymorphic function that adds a labeled property to the dialog.
    addLabeledProperty(label, property) {
      this._dlg.addLabeledProperty(label, property);
    }

    // Polymorphic function that adds a serialized property to the dialog.
    addSerializedProperty(label, property) {
      this._dlg.addSerializedProperty(label, property);
    }

    // Returns the control with a given unique control id.
    control(uniqueId) {
      return this._dlg.control(uniqueId);
    }

    // Returns the control with a given resource id and sequence order.
    controlByResourceId(resourceId, sequenceIdx) {
      return this._dlg.controlByResourceId(resourceId, sequenceIdx);
    }

    *controls() {
      yield* this._dlg.controls();
    }

    // Adds a control with a given type and resource id to the dialog.
    // Returns the added control.
    addControl(ctrlType, resourceId) {
      return this._dlg.addControl(ctrlType, resourceId);
    }

    // Removes a control with a given id from the dialog.
    // Returns true/false as success status.
    removeControl(uniqueId) {
      return this._dlg.removeControl(uniqueId);
    }

    // Generates a control resource id that has a given prefix and does not exist yet.
    generateUnusedControlResourceId(prefix) {
      return this._dlg.generateUnusedControlResourceId(prefix);
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
      for (const layer of this._layers) {
        yield layer;
      }
    }

    // Adds a layer to the dialog resource.
    addLayer(layer) {
      this._layers.push(layer);
    }

    // Updates the dialog's id.
    updateDialogId(id) {
      this._dlg.resourceId = id;
    }

    // Updates a control's resource id.
    updateControlId(ctrlId, newResourceId) {
      this._dlg.updateControlId(ctrlId, newResourceId);
    }
  }

  // Makes a dialog resource instance that contains nothing but the minimally
  // needed properties.
  function makeMinimalDialogResource(locale, dlgId, titleStrId) {
    const propLabel = cred.spec.propertyLabel;
    const propType = cred.spec.physicalPropertyType;
    const propDescriptions = [
      [propLabel.id, propType.identifier, dlgId],
      [propLabel.left, propType.number, 0],
      [propLabel.top, propType.number, 0],
      [propLabel.width, propType.number, 100],
      [propLabel.height, propType.number, 100],
      [propLabel.text, propType.identifier, `${titleStrId}`],
      [propLabel.resourceClass, propType.string, 'Dialog'],
      [propLabel.font, propType.string, ''],
      [propLabel.fontSize, propType.number, 0],
      [propLabel.killPopup, propType.number, 0],
      [propLabel.paddingType, propType.number, 0],
      [propLabel.styleFlags, propType.flags, 31]
    ];

    const dlgRes = new DialogResource(locale);
    for (const descr of propDescriptions) {
      dlgRes.addLabeledProperty(descr[0], makeProperty(descr[0], descr[1], descr[2]));
    }
    return dlgRes;
  }

  ///////////////////

  // Dialog information read from the dialogs's resource for a particular locale.
  class Dialog {
    constructor() {
      // Map that associates property labels with properties.
      this._properties = new Map();
      // Generator for control ids that are unique within the dialog.
      this._ctrlIdGen = new UniqueResourceIdGenerator();
      // Map that associates unique control ids with controls.
      this._controls = new Map();
      // When editing properties, also edit the copy function below!
    }

    // Returns a deep copy of the dialog.
    copy() {
      let copy = new Dialog();
      for (let [label, property] of this._properties) {
        copy._properties.set(label, property.copy());
      }
      copy._ctrlIdGen = this._ctrlIdGen.copy();
      for (let [id, control] of this._controls) {
        copy._controls.set(id, control.copy());
      }
      return copy;
    }

    // Polymorphic function to returns a unique identifier for the dialog/control.
    get uniqueId() {
      // Only one dialog at a time is supported, so hardcode the unique id until
      // we need something better.
      return UniqueResourceIdGenerator.generateId('dlg', 0);
    }

    // Polymorphic function to return the item's identifier.
    get resourceId() {
      if (!this._properties.has(cred.spec.propertyLabel.id)) {
        throw new Error('Dialog id accessed before being defined.');
      }
      return this.property(cred.spec.propertyLabel.id).value;
    }

    // Polymorphic function to set the item's identifier.
    set resourceId(value) {
      let idProp = this.property(cred.spec.propertyLabel.id);
      if (idProp) {
        idProp.value = value;
      } else {
        // Create a property for the id.
        this.setProperty(
          cred.spec.propertyLabel.id,
          cred.resource.makeProperty(
            cred.spec.propertyLabel.id,
            cred.spec.physicalPropertyType.identifier,
            value
          )
        );
      }
    }

    // Polymorphic function to check if this item is for a dialog.
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

    // Polymorphic function to set a dialog property's value.
    setPropertyValue(label, value) {
      if (!this.haveProperty(label)) {
        throw new Error(
          `Attempting to set value of non-existing dialog property '${label}'.`
        );
      }
      this.property(label).value = value;
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

    // Returns the control with a given unique control id.
    control(uniqueId) {
      return this._controls.get(uniqueId.hash());
    }

    // Returns the control with a given resource id and sequence order.
    controlByResourceId(resourceId, sequenceIdx) {
      const ctrlId = UniqueResourceIdGenerator.generateId(resourceId, sequenceIdx);
      return this.control(ctrlId);
    }

    *controls() {
      for (let ctrl of this._controls.values()) {
        yield ctrl;
      }
    }

    // Adds a control with a given type and resource id to the dialog.
    // Returns the added control.
    addControl(ctrlType, resourceId) {
      // Create control object with a unique id.
      const ctrl = new Control(
        this._ctrlIdGen.generateNextId(resourceId),
        ctrlType,
        resourceId
      );
      this._controls.set(ctrl.uniqueId.hash(), ctrl);
      return ctrl;
    }

    // Removes a control with a given id from the dialog.
    // Returns true/false as success status.
    removeControl(uniqueId) {
      if (this._controls.has(uniqueId.hash())) {
        this._controls.delete(uniqueId.hash());
        return true;
      }
      return false;
    }

    // Updates the resource id of a control.
    updateControlId(ctrlId, newResourceId) {
      let ctrl = this.control(ctrlId);
      if (ctrl) {
        ctrl.resourceId = newResourceId;
      }
    }

    // Generates a control resource id that has a given prefix and does not exist yet.
    generateUnusedControlResourceId(prefix) {
      // Initially try the prefix without any sequence number. If that fails start
      // trying with sequence numbers from 2 going up until we find an unused resource
      // id.
      let seqNum = 1;
      // Use default when no prefix is given.
      let resId = prefix || '_';
      resId += seqNum;
      while (this._ctrlIdGen.count(resId) > 0) {
        ++seqNum;
        resId = prefix + seqNum;
      }
      return resId;
    }
  }

  ///////////////////

  // Control information read from the dialogs's resource.
  class Control {
    constructor(ctrlId, type, resourceId) {
      if (!ctrlId || typeof type === 'undefined' || typeof resourceId === 'undefined') {
        throw new Error('Invalid arguments for creating a Control object.');
      }
      // Unique id for control within its dialog.
      this._ctrlId = ctrlId;
      // Map that associates property labels with property objects.
      this._properties = new Map();
      // When editing fields, also edit the copy function below!

      // Set up the properties for the control type and resource id.
      this.setProperty(
        cred.spec.propertyLabel.ctrlType,
        makeProperty(
          cred.spec.propertyLabel.ctrlType,
          cred.spec.physicalPropertyType.identifier,
          type
        )
      );
      this.setProperty(
        cred.spec.propertyLabel.id,
        makeProperty(
          cred.spec.propertyLabel.id,
          util.isNumber(resourceId)
            ? cred.spec.physicalPropertyType.number
            : cred.spec.physicalPropertyType.identifier,
          resourceId
        )
      );
    }

    // Returns a deep copy of the control.
    copy() {
      const ctrlIdCopy = new UniqueResourceId(
        this._ctrlId.resourceId,
        this._ctrlId.sequenceIdx
      );
      const copy = new Control(ctrlIdCopy, this.type, this.resourceId);
      for (const [label, property] of this._properties) {
        copy._properties.set(label, property.copy());
      }
      return copy;
    }

    // Generates all control properties specified in the spec.
    generatePropertiesWithDefaults() {
      const ctrlSpec = cred.spec.makeControlSpec(this.type);
      for (const propSpec of ctrlSpec.propertySpecs()) {
        if (!this.haveProperty(propSpec.label)) {
          this.setProperty(
            propSpec.label,
            makeProperty(
              propSpec.label,
              cred.spec.physicalFromLogicalPropertyType(propSpec.logicalType),
              propSpec.defaultValue
            )
          );
        }
      }
    }

    // Polymorphic function to returns a unique identifier for the control/dialog.
    get uniqueId() {
      return this._ctrlId;
    }

    // Polymorphic function to return the control's resource identifier.
    get resourceId() {
      return this.property(cred.spec.propertyLabel.id).value;
    }

    // Polymorphic function to set the item's resource identifier.
    set resourceId(value) {
      const propType = cred.spec.physicalPropertyTypeOfValue(value.toString());
      this.setProperty(
        cred.spec.propertyLabel.id,
        cred.resource.makeProperty(
          cred.spec.propertyLabel.id,
          propType,
          cred.spec.convertToPhysicalPropertyTypeValue(value.toString(), propType)
        )
      );
    }

    get type() {
      return this._properties.get(cred.spec.propertyLabel.ctrlType).value;
    }

    // Polymorphic function to check if this item is for a dialog.
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

    // Polymorphic function to set a dialog property's value.
    setPropertyValue(label, value) {
      if (!this.haveProperty(label)) {
        throw new Error(
          `Attempting to set value of non-existing property '${label}' for control '${this._ctrlId}'.`
        );
      }
      this.property(label).value = value;
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
    return a.isDialog() === b.isDialog() && a.uniqueId === b.uniqueId;
  }

  ///////////////////

  // Defines a unique id from a given resource id and sequence index.
  // This allows to support multiple controls with the same resource
  // id. The resource id might not be unique but together with a sequence index that
  // represents the n-th occurrance of the resource id, it defines a unique id.
  class UniqueResourceId {
    constructor(resourceId, sequenceIdx) {
      if (typeof resourceId === 'undefined' || typeof sequenceIdx === 'undefined') {
        throw new Error('ControlIds must have a resource id and sequence index.');
      }
      // The id that is defined for the control in the resource.
      this._resId = resourceId;
      // An index representing how often the resource id has occurred so far.
      this._seqIdx = sequenceIdx;
    }

    get resourceId() {
      return this._resId;
    }

    get sequenceIdx() {
      return this._seqIdx;
    }

    // Returns a hash for the control id.
    hash() {
      return 'uniqueid_resid_' + this.resourceId + '_seqidx_' + this.sequenceIdx;
    }
  }

  // Checks whether two unique resource ids are equal.
  function areUniqueResourceIdsEqual(a, b) {
    return a.hash() === b.hash();
  }

  // Generator for unique resources ids.
  // Keeps track of how often each resource id occurrs.
  // The generated ids must be deterministic, i.e. different generator instances must
  // generate the same unique id for the n-th occurrance of a resource id. This is
  // necessary in order to match control declarations and definitions in the resource
  // correctly.
  class UniqueResourceIdGenerator {
    constructor() {
      this._idCounts = new Map();
      // When editing fields, also edit the copy function below!
    }

    // Returns a deep copy of the generator.
    copy() {
      let copy = new UniqueResourceIdGenerator();
      for (let [resId, seqIdx] of this._idCounts) {
        copy._idCounts.set(resId, seqIdx);
      }
      return copy;
    }

    // Counts the number of occurrances of a given resource id.
    count(resourceId) {
      if (this._idCounts.has(resourceId)) {
        return this._idCounts.get(resourceId) + 1;
      }
      return 0;
    }

    // Generates the next unique control id for a given resource id.
    generateNextId(resourceId) {
      let seqIdx = 0;
      if (this._idCounts.has(resourceId)) {
        seqIdx = this._idCounts.get(resourceId) + 1;
      }
      this._idCounts.set(resourceId, seqIdx);
      return new UniqueResourceId(resourceId, seqIdx);
    }

    // Deterministically generates the unique control id for the n-th occurrance of a
    // resource id.
    static generateId(resourceId, sequenceIdx) {
      return new UniqueResourceId(resourceId, sequenceIdx);
    }
  }

  ///////////////////

  // A dialog or control property read from the dialogs's resource.
  class Property {
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
  class NumberProperty extends Property {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property.
    copy() {
      return new NumberProperty(this.label, this.type, this.value);
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return typeof this.value !== 'undefined';
    }

    // Polymorphic function that returns the value as string.
    valueAsString() {
      if (typeof value === 'number' && !this.value.isInteger()) {
        // Floating point.
        const NumDecimals = 4;
        return this.value.toFixed(NumDecimals);
      }
      return `${this.value}`;
    }
  }

  // Defintion for a string property.
  class StringProperty extends Property {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property.
    copy() {
      return new StringProperty(this.label, this.type, this.value);
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
  class IdentifierProperty extends Property {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
    }

    // Polymorthic function that returns a deep copy of the property.
    copy() {
      return new IdentifierProperty(this.label, this.type, this.value);
    }

    // Polymorphic function to check if the property has a non-empty value.
    hasValue() {
      return !(typeof this.value === 'undefined' || this.value === '');
    }
  }

  // Defintion for a property that consists of bit flags. The value field represents
  // the total value of the flags.
  class FlagsProperty extends Property {
    constructor(label, physicalType, value) {
      super(label, physicalType, value);
      // Array of strings for the flags.
      this._flags = [];

      if (typeof this.value !== 'number') {
        this.value = 0;
      }
      // When editing properties, also edit the copy function below!
    }

    // Polymorthic function that returns a deep copy of the property.
    copy() {
      let copy = new FlagsProperty(this.label, this.type, this.value);
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

  // Factory function for property objects.
  function makeProperty(label, type, value) {
    switch (type) {
      case cred.spec.physicalPropertyType.number: {
        return new NumberProperty(label, type, value);
      }
      case cred.spec.physicalPropertyType.string: {
        return new StringProperty(label, type, value);
      }
      case cred.spec.physicalPropertyType.identifier: {
        return new IdentifierProperty(label, type, value);
      }
      case cred.spec.physicalPropertyType.flags: {
        return new FlagsProperty(label, type, value);
      }
      default: {
        throw new Error('Unexpected physical property type.');
      }
    }
  }

  ///////////////////

  // There are three ways of how properties might be defined in the resource file:
  // - Positional properties: Properties that are identified by their position in the
  //                          target object's resource.
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
  class Layer {
    constructor(name, numbers) {
      this._name = name;
      // Array of integer numbers.
      this._numbers = numbers || [];
    }

    // Returns a deep copy of the object.
    copy() {
      let copy = new Layer(this._name);
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
    constructor(dlg) {
      this._dlg = dlg;
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
      for (let prop of this._dlg.properties()) {
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
          this._dlg.property(label),
          propSpec,
          'dialog',
          label
        );
      }
    }

    // Verifies the properties of each of the dialog's controls.
    _verifyControlProperties() {
      for (let ctrl of this._dlg.controls()) {
        let ctrlSpec = cred.spec.makeControlSpec(ctrl.type);
        this._verifyDefinedControlProperties(ctrl, ctrlSpec);
        this._verifySpecifiedControlProperties(ctrl, ctrlSpec);
      }
    }

    // Verifies that the properties defined in a control follow the control's specification.
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

  // Verifies a given dialog and returns a log of issues.
  function verifyDialog(dlg) {
    let verifier = new DialogVerifier(dlg);
    return verifier.verify();
  }

  ///////////////////

  // Exports
  return {
    areUniqueResourceIdsEqual: areUniqueResourceIdsEqual,
    Control: Control,
    UniqueResourceIdGenerator: UniqueResourceIdGenerator,
    Dialog: Dialog,
    DialogResource: DialogResource,
    DialogResourceSetBuilder: DialogResourceSetBuilder,
    Layer: Layer,
    makeProperty: makeProperty,
    ResourceManager: ResourceManager,
    StringMap: StringMap,
    verifyDialog: verifyDialog
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = cred.resource;
