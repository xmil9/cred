//
// SVG functionality.
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
var geom = tryRequire('./geom') || geom || {};

///////////////////

// SVG module.
var svg = (function() {
  ///////////////////

  // XML namespace for SVG
  const NS = 'http://www.w3.org/2000/svg';

  // Creates a SVG DOM element with a given element tag, parent element, and attributes.
  function create(tag, parent, attribs) {
    const elem = document.createElementNS(NS, tag);
    for (const key in attribs) {
      elem.setAttributeNS(null, key, attribs[key]);
    }
    parent.appendChild(elem);
    return elem;
  }

  // Converts a point in SVG coordinates to a point in screen coordinates for a given
  // SVG element and SVG root element.
  function screenFromSvgPoint(pt, svgHtmlElement, svgRootHtmlElement) {
    let svgPt = svgRootHtmlElement.createSVGPoint();
    svgPt.x = pt.x;
    svgPt.y = pt.y;
    const transformedSvgPt = svgPt.matrixTransform(svgHtmlElement.getScreenCTM());
    return new geom.Point(transformedSvgPt.x, transformedSvgPt.y);
  }

  // Converts a point in screen coordinates to a point in SVG coordinates for a given
  // SVG element and SVG root element.
  function svgFromScreenPoint(pt, svgHtmlElement, svgRootHtmlElement) {
    let svgPt = svgRootHtmlElement.createSVGPoint();
    svgPt.x = pt.x;
    svgPt.y = pt.y;
    const transformedSvgPt = svgPt.matrixTransform(
      svgHtmlElement.getScreenCTM().inverse()
    );
    return new geom.Point(transformedSvgPt.x, transformedSvgPt.y);
  }

  // Converts a rect in SVG coordinates to a rect in screen coordinates for a given
  // SVG element and SVG root element.
  function screenFromSvgRect(rect, svgHtmlElement, svgRootHtmlElement) {
    const leftTop = screenFromSvgPoint(
      rect.leftTop(),
      svgHtmlElement,
      svgRootHtmlElement
    );
    return new geom.Rect(leftTop.x, leftTop.y, rect.width, rect.height);
  }

  // Converts a rect in screen coordinates to a rect in SVG coordinates for a given
  // SVG element and SVG root element.
  function svgFromScreenRect(rect, svgHtmlElement, svgRootHtmlElement) {
    const leftTop = svgFromScreenPoint(
      rect.leftTop(),
      svgHtmlElement,
      svgRootHtmlElement
    );
    return new geom.Rect(leftTop.x, leftTop.y, rect.width, rect.height);
  }

  ///////////////////

  // Exports for util module.
  return {
    create: create,
    screenFromSvgPoint: screenFromSvgPoint,
    screenFromSvgRect: screenFromSvgRect,
    svgFromScreenPoint: svgFromScreenPoint,
    svgFromScreenRect: svgFromScreenRect
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = svg;
