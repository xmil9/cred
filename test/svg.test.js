//
// Tests for SVG functionality.
//
'use strict';

const svg = require('../svg');

///////////////////

test('svg.create with attributes', () => {
  document.body.innerHTML =
    '<div id="svg-display">                                   ' +
    '</div>                                                   ';
  const displayElem = document.getElementById('svg-display');

  const createdElem = svg.create('svg', displayElem, {
    id: 'svg-elem',
    width: '100',
    height: '50'
  });
  expect(createdElem).toBeDefined();
  expect(createdElem.id).toEqual('svg-elem');
  expect(createdElem.getAttribute('width')).toEqual('100');
  expect(createdElem.getAttribute('height')).toEqual('50');

  const selectedElem = document.querySelector('svg');
  expect(selectedElem).toBeDefined();
  expect(selectedElem.id).toEqual('svg-elem');
});

test('svg.create without attributes', () => {
  document.body.innerHTML =
    '<div id="svg-display">                                   ' +
    '</div>                                                   ';
  const displayElem = document.getElementById('svg-display');

  const createdElem = svg.create('svg', displayElem);
  expect(createdElem).toBeDefined();

  const selectedElem = document.querySelector('svg');
  expect(selectedElem).toBeDefined();
});

test('svg.create for nested elements', () => {
  document.body.innerHTML =
    '<div id="svg-display">                                   ' +
    '</div>                                                   ';
  const displayElem = document.getElementById('svg-display');

  const svgElem = svg.create('svg', displayElem);
  expect(svgElem).toBeDefined();
  expect(document.querySelector('svg')).toBeDefined();

  const rectElem = svg.create('rect', svgElem, { id: 'r' });
  expect(rectElem).toBeDefined();
  expect(rectElem.id).toEqual('r');
  expect(document.querySelector('rect')).toBeDefined();
});

///////////////////

test('screenFromSvgPoint', () => {
  // Need to mock Web API calls in screenFromSvgPoint.
});

///////////////////

test('svgFromScreenPoint', () => {
  // Need to mock Web API calls in svgFromScreenPoint.
});
