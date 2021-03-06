//
// Tests for HTML utility functionality.
//
'use strict';

const $ = require('jquery');
const html = require('../html');

///////////////////

test('makeDivElement with class name', () => {
  const $div = html.makeDivElement('test');
  expect($div).toBeDefined();
  expect($div[0].className).toBe('test');
});

test('makeDivElement without class name', () => {
  const $div = html.makeDivElement();
  expect($div).toBeDefined();
  expect($div.is('div')).toBeTruthy();
});

///////////////////

test('makeLabelElement with for-tag', () => {
  const $label = html.makeLabelElement('my label', 'labeled');
  expect($label).toBeDefined();
  expect($label.is('label')).toBeTruthy();
  expect($label.text()).toBe('my label');
  expect($label.attr('for')).toBe('labeled');
});

test('makeDivElement without for-tag', () => {
  const $label = html.makeLabelElement('my label');
  expect($label).toBeDefined();
  expect($label.is('label')).toBeTruthy();
  expect($label.text()).toBe('my label');
});

///////////////////

test('makeInputElement for text input with value', () => {
  const $input = html.makeInputElement('text', 'myid', false, 'hello');
  expect($input).toBeDefined();
  expect($input.is('input')).toBeTruthy();
  expect($input.attr('type')).toBe('text');
  expect($input.attr('id')).toBe('myid');
  expect($input.attr('disabled')).toBeFalsy();
  expect($input.attr('value')).toBe('hello');
});

test('makeInputElement for text input without value', () => {
  const $input = html.makeInputElement('text', 'myid', false);
  expect($input).toBeDefined();
  expect($input.is('input')).toBeTruthy();
  expect($input.attr('type')).toBe('text');
  expect($input.attr('id')).toBe('myid');
  expect($input.attr('disabled')).toBeFalsy();
  expect($input.attr('value')).toBeUndefined();
});

test('makeInputElement for disabled text input', () => {
  const $input = html.makeInputElement('text', 'myid', true);
  expect($input).toBeDefined();
  expect($input.is('input')).toBeTruthy();
  expect($input.attr('type')).toBe('text');
  expect($input.attr('id')).toBe('myid');
  expect($input.attr('disabled')).toBeTruthy();
});

test('makeInputElement for other input types', () => {
  for (const type of ['submit', 'radio', 'checkbox', 'button', 'color', 'date']) {
    const $input = html.makeInputElement(type, 'myid', false, 'hello');
    expect($input).toBeDefined();
    expect($input.is('input')).toBeTruthy();
    expect($input.attr('type')).toBe(type);
  }
});

///////////////////

test('makeSelectElement enabled', () => {
  const $select = html.makeSelectElement('myid', false);
  expect($select).toBeDefined();
  expect($select.attr('id')).toBe('myid');
  expect($select.attr('disabled')).toBeFalsy();
});

test('makeSelectElement disabled', () => {
  const $select = html.makeSelectElement('myid', true);
  expect($select).toBeDefined();
  expect($select.attr('id')).toBe('myid');
  expect($select.attr('disabled')).toBeTruthy();
});

///////////////////

test('makeOptionElement with numeric value', () => {
  const $opt = html.makeOptionElement('opt1', 1);
  expect($opt).toBeDefined();
  expect($opt.text()).toBe('opt1');
  expect($opt.attr('value')).toBe('1');
});

test('makeOptionElement with string value', () => {
  const $opt = html.makeOptionElement('opt1', '1');
  expect($opt).toBeDefined();
  expect($opt.text()).toBe('opt1');
  expect($opt.attr('value')).toBe('1');
});

///////////////////

test('makeFieldsetElement enabled with id', () => {
  const $fieldset = html.makeFieldsetElement(false, 'myid');
  expect($fieldset).toBeDefined();
  expect($fieldset.attr('id')).toBe('myid');
  expect($fieldset.attr('disabled')).toBeFalsy();
});

test('makeFieldsetElement disabled without id', () => {
  const $fieldset = html.makeFieldsetElement(true);
  expect($fieldset).toBeDefined();
  expect($fieldset.attr('id')).toBeUndefined();
  expect($fieldset.attr('disabled')).toBeTruthy();
});

///////////////////

test('makeSpanElement with text', () => {
  const $span = html.makeSpanElement('some text');
  expect($span).toBeDefined();
  expect($span.text()).toBe('some text');
});

test('makeSpanElement without text', () => {
  const $span = html.makeSpanElement();
  expect($span).toBeDefined();
  expect($span.text()).toBe('');
});

///////////////////

test('makeLinkElement with text', () => {
  const $link = html.makeLinkElement('some text');
  expect($link).toBeDefined();
  expect($link.text()).toBe('some text');
});

test('makeLinkElement without text', () => {
  const $link = html.makeLinkElement();
  expect($link).toBeDefined();
  expect($link.text()).toBe('');
});

///////////////////

test('addClasses for one class', () => {
  document.body.innerHTML =
    '<div id="myelem">                                        ' +
    '</div>                                                   ';
  const $elem = $('#myelem');
  html.addClasses($elem, ['myclass']);

  const classes = document.getElementById('myelem').className.split(/\s+/);
  expect(classes.length).toBe(1);
  expect(classes.includes('myclass')).toBeTruthy();
});

test('addClasses for multiple class', () => {
  document.body.innerHTML =
    '<div id="myelem">                                        ' +
    '</div>                                                   ';
  const $elem = $('#myelem');
  html.addClasses($elem, ['class1', 'class2', 'class3']);

  const classes = document.getElementById('myelem').className.split(/\s+/);
  expect(classes.length).toBe(3);
  expect(classes.includes('class1')).toBeTruthy();
  expect(classes.includes('class2')).toBeTruthy();
  expect(classes.includes('class3')).toBeTruthy();
});

test('addClasses for no class', () => {
  document.body.innerHTML =
    '<div id="myelem">                                        ' +
    '</div>                                                   ';
  const $elem = $('#myelem');
  html.addClasses($elem, []);

  expect(document.getElementById('myelem').className).toBe('');
});

test('addClasses for adding to existing classes', () => {
  document.body.innerHTML =
    '<div id="myelem" class="A B">                          ' +
    '</div>                                                   ';
  const $elem = $('#myelem');
  html.addClasses($elem, ['class1', 'class2']);

  const classes = document.getElementById('myelem').className.split(/\s+/);
  expect(classes.length).toBe(4);
  expect(classes.includes('A')).toBeTruthy();
  expect(classes.includes('B')).toBeTruthy();
  expect(classes.includes('class1')).toBeTruthy();
  expect(classes.includes('class2')).toBeTruthy();
});
