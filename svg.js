//
// SVG functionality.
//
'use strict';

///////////////////

// Imports
// These are provided through (ordered!) script tags in the HTML file.
var svg = svg || {};
var geom = geom || {};

///////////////////

// SVG module.
svg = (function() {
  ///////////////////

  // XML namespace for SVG
  const NS = 'http://www.w3.org/2000/svg';

  // Creates a SVG DOM element with a given element tag, parent element, and attributes.
  function create(tag, parent, attribs) {
    let elem = document.createElementNS(NS, tag);
    for (let key in attribs) {
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

  ///////////////////

  // Exports
  return {
    create: create,
    screenFromSvgPoint: screenFromSvgPoint,
    svgFromScreenPoint: svgFromScreenPoint
  };
})();
