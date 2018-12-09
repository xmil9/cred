//
// Tests for geometry functionality.
//
'use strict';

const geom = require('../geom');

///////////////////

test('geom.Rect left, top, width, height for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.left).toEqual(1);
  expect(r.top).toEqual(2);
  expect(r.width).toEqual(10);
  expect(r.height).toEqual(20);
});

test('geom.Rect left, top, width, height for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.left).toEqual(-1);
  expect(r.top).toEqual(-2);
  expect(r.width).toEqual(10);
  expect(r.height).toEqual(20);
});

test('geom.Rect left, top, width, height for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.left).toEqual(0);
  expect(r.top).toEqual(0);
  expect(r.width).toEqual(0);
  expect(r.height).toEqual(0);
});

test('geom.Rect negative width, height', () => {
  expect(() => new geom.Rect(1, 1, -1, 10)).toThrow();
  expect(() => new geom.Rect(1, 1, 10, -10)).toThrow();
});

test('geom.Rect right, bottom for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.right).toEqual(11);
  expect(r.bottom).toEqual(22);
});

test('geom.Rect right, bottom for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.right).toEqual(9);
  expect(r.bottom).toEqual(18);
});

test('geom.Rect right, bottom for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.right).toEqual(0);
  expect(r.bottom).toEqual(0);
});

test('geom.Rect.size for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.size()).toEqual(new geom.Size(10, 20));
});

test('geom.Rect.size for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.size()).toEqual(new geom.Size(10, 20));
});

test('geom.Rect.size for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.size()).toEqual(new geom.Size(0, 0));
});

test('geom.Rect.leftTop for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.leftTop()).toEqual(new geom.Point(1, 2));
});

test('geom.Rect.leftTop for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.leftTop()).toEqual(new geom.Point(-1, -2));
});

test('geom.Rect.leftTop for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.leftTop()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.centerTop for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.centerTop()).toEqual(new geom.Point(6, 2));
});

test('geom.Rect.centerTop for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.centerTop()).toEqual(new geom.Point(4, -2));
});

test('geom.Rect.centerTop for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.centerTop()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.rightTop for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.rightTop()).toEqual(new geom.Point(11, 2));
});

test('geom.Rect.rightTop for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.rightTop()).toEqual(new geom.Point(9, -2));
});

test('geom.Rect.rightTop for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.rightTop()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.rightCenter for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.rightCenter()).toEqual(new geom.Point(11, 12));
});

test('geom.Rect.rightCenter for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.rightCenter()).toEqual(new geom.Point(9, 8));
});

test('geom.Rect.rightCenter for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.rightCenter()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.rightBottom for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.rightBottom()).toEqual(new geom.Point(11, 22));
});

test('geom.Rect.rightBottom for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.rightBottom()).toEqual(new geom.Point(9, 18));
});

test('geom.Rect.rightBottom for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.rightBottom()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.centerBottom for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.centerBottom()).toEqual(new geom.Point(6, 22));
});

test('geom.Rect.centerBottom for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.centerBottom()).toEqual(new geom.Point(4, 18));
});

test('geom.Rect.centerBottom for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.centerBottom()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.leftBottom for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.leftBottom()).toEqual(new geom.Point(1, 22));
});

test('geom.Rect.leftBottom for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.leftBottom()).toEqual(new geom.Point(-1, 18));
});

test('geom.Rect.leftBottom for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.leftBottom()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.leftCenter for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.leftCenter()).toEqual(new geom.Point(1, 12));
});

test('geom.Rect.leftCenter for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.leftCenter()).toEqual(new geom.Point(-1, 8));
});

test('geom.Rect.leftCenter for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.leftCenter()).toEqual(new geom.Point(0, 0));
});

test('geom.Rect.center for positive coordinates', () => {
  const r = new geom.Rect(1, 2, 10, 20);
  expect(r.center()).toEqual(new geom.Point(6, 12));
});

test('geom.Rect.center for negative coordinates', () => {
  const r = new geom.Rect(-1, -2, 10, 20);
  expect(r.center()).toEqual(new geom.Point(4, 8));
});

test('geom.Rect.center for empty rectangle', () => {
  const r = new geom.Rect(0, 0, 0, 0);
  expect(r.center()).toEqual(new geom.Point(0, 0));
});

///////////////////

test('geom.Point x, y for positive coordinates', () => {
  const p = new geom.Point(1, 2);
  expect(p.x).toEqual(1);
  expect(p.y).toEqual(2);
});

test('geom.Point x, y for negative coordinates', () => {
  const p = new geom.Point(-1, -2);
  expect(p.x).toEqual(-1);
  expect(p.y).toEqual(-2);
});

test('geom.Point x, y for zero point', () => {
  const p = new geom.Point(0, 0);
  expect(p.x).toEqual(0);
  expect(p.y).toEqual(0);
});

test('geom.Point.equals with other point', () => {
  const p1 = new geom.Point(2.1, 10.5);
  const p2 = new geom.Point(2.1, 10.5);
  const p3 = new geom.Point(2.11, 10.5);
  const p4 = new geom.Point(2.1, 0);
  expect(p1.equals(p2)).toBeTruthy();
  expect(p1.equals(p3)).toBeFalsy();
  expect(p1.equals(p4)).toBeFalsy();
});

test('geom.Point.equals with other object', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.equals({ x: 2.1, y: 10.5 })).toBeTruthy();
  expect(p.equals({ x: 2.1, y: 10.5, z: 100.0 })).toBeTruthy();
  expect(p.equals({ x: 2.11, y: 10.5 })).toBeFalsy();
  expect(p.equals({ x: 2.1, y: 10.4 })).toBeFalsy();
  expect(p.equals({ x: 2.1 })).toBeFalsy();
  expect(p.equals({ z: 2.1, y: 10.5 })).toBeFalsy();
});

test('geom.Point.scale with one factor', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.scale(2)).toEqual(new geom.Point(4.2, 21.0));
  expect(p.scale(-2)).toEqual(new geom.Point(-4.2, -21.0));
  expect(p.scale(0.5)).toEqual(new geom.Point(1.05, 5.25));
  expect(p.scale(1)).toEqual(p);
  expect(p.scale(0)).toEqual(new geom.Point(0, 0));
});

test('geom.Point.scale with x and y factors', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.scale(2, 3)).toEqual(new geom.Point(4.2, 31.5));
  expect(p.scale(-2, -3)).toEqual(new geom.Point(-4.2, -31.5));
  expect(p.scale(0.5, 0.1)).toEqual(new geom.Point(1.05, 1.05));
  expect(p.scale(1, 0)).toEqual(new geom.Point(2.1, 0));
  expect(p.scale(0, 1)).toEqual(new geom.Point(0, 10.5));
});

test('geom.Point.add number', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.add(2)).toEqual(new geom.Point(4.1, 12.5));
  expect(p.add(-1)).toEqual(new geom.Point(1.1, 9.5));
  expect(p.add(0)).toEqual(p);
});

test('geom.Point.add Point', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.add(new geom.Point(1.0, 2))).toEqual(new geom.Point(3.1, 12.5));
  expect(p.add(new geom.Point(-1.0, -2))).toEqual(new geom.Point(1.1, 8.5));
  expect(p.add(new geom.Point(0, 0))).toEqual(p);
});

test('geom.Point.add Size', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.add(new geom.Size(1, 2))).toEqual(new geom.Point(3.1, 12.5));
  expect(p.add(new geom.Size(-1.0, -2))).toEqual(new geom.Point(1.1, 8.5));
  expect(p.add(new geom.Size(0, 0))).toEqual(p);
});

test('geom.Point.add object', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.add({ x: 1, y: 2 })).toEqual(new geom.Point(3.1, 12.5));
  expect(p.add({ w: 1, h: 2 })).toEqual(new geom.Point(3.1, 12.5));
  // X and y have priority over w and h.
  expect(p.add({ x: 1, y: 2, w: 3, h: 4 })).toEqual(new geom.Point(3.1, 12.5));
});

test('geom.Point.add x and y numbers', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.add(2, 5)).toEqual(new geom.Point(4.1, 15.5));
  expect(p.add(-1, -3)).toEqual(new geom.Point(1.1, 7.5));
  expect(p.add(0, 0)).toEqual(p);
});

test('geom.Point.add needs number or object', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(() => p.add('2')).toThrow();
  expect(() => p.add()).toThrow();
});

test('geom.Point.add object parameter must have expected properties', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(() => p.add({})).toThrow();
  expect(() => p.add({ a: 1, b: 2 })).toThrow();
});

test('geom.Point.subtract number', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.subtract(1)).toEqual(new geom.Point(1.1, 9.5));
  expect(p.subtract(-1)).toEqual(new geom.Point(3.1, 11.5));
  expect(p.subtract(0)).toEqual(p);
});

test('geom.Point.subtract Point', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.subtract(new geom.Point(1.0, 2))).toEqual(new geom.Point(1.1, 8.5));
  expect(p.subtract(new geom.Point(-1.0, -2))).toEqual(new geom.Point(3.1, 12.5));
  expect(p.subtract(new geom.Point(0, 0))).toEqual(p);
});

test('geom.Point.subtract Size', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.subtract(new geom.Size(1, 2))).toEqual(new geom.Point(1.1, 8.5));
  expect(p.subtract(new geom.Size(-1.0, -2))).toEqual(new geom.Point(3.1, 12.5));
  expect(p.subtract(new geom.Size(0, 0))).toEqual(p);
});

test('geom.Point.subtract object', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.subtract({ x: 1, y: 2 })).toEqual(new geom.Point(1.1, 8.5));
  expect(p.subtract({ w: 1, h: 2 })).toEqual(new geom.Point(1.1, 8.5));
  // X and y have priority over w and h.
  expect(p.subtract({ x: 1, y: 2, w: 3, h: 4 })).toEqual(new geom.Point(1.1, 8.5));
});

test('geom.Point.subtract x and y numbers', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(p.subtract(1, 5)).toEqual(new geom.Point(1.1, 5.5));
  expect(p.subtract(-1.0, -3)).toEqual(new geom.Point(3.1, 13.5));
  expect(p.subtract(0, 0)).toEqual(p);
});

test('geom.Point.subtract needs number or object', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(() => p.subtract('2')).toThrow();
  expect(() => p.subtract()).toThrow();
});

test('geom.Point.subtract object parameter must have expected properties', () => {
  const p = new geom.Point(2.1, 10.5);
  expect(() => p.subtract({})).toThrow();
  expect(() => p.subtract({ a: 1, b: 2 })).toThrow();
});

test('geom.Point.round', () => {
  expect(new geom.Point(1.0, 2).round()).toEqual(new geom.Point(1, 2));
  expect(new geom.Point(1.1, 2.4).round()).toEqual(new geom.Point(1, 2));
  expect(new geom.Point(1.5, 2.7).round()).toEqual(new geom.Point(2, 3));
  expect(new geom.Point(-1.0, -2).round()).toEqual(new geom.Point(-1, -2));
  expect(new geom.Point(-1.1, -2.4).round()).toEqual(new geom.Point(-1, -2));
  expect(new geom.Point(-1.5, -2.7).round()).toEqual(new geom.Point(-1, -3));
});

///////////////////

test('geom.Size w, h for positive coordinates', () => {
  const s = new geom.Size(1, 2);
  expect(s.w).toEqual(1);
  expect(s.h).toEqual(2);
});

test('geom.Size w, h for negative coordinates', () => {
  const s = new geom.Size(-1, -2);
  expect(s.w).toEqual(-1);
  expect(s.h).toEqual(-2);
});

test('geom.Size w, h for zero point', () => {
  const s = new geom.Size(0, 0);
  expect(s.w).toEqual(0);
  expect(s.h).toEqual(0);
});

test('geom.Size.equals with other Size', () => {
  const s1 = new geom.Size(2.1, 10.5);
  const s2 = new geom.Size(2.1, 10.5);
  const s3 = new geom.Size(2.11, 10.5);
  const s4 = new geom.Size(2.1, 0);
  expect(s1.equals(s2)).toBeTruthy();
  expect(s1.equals(s3)).toBeFalsy();
  expect(s1.equals(s4)).toBeFalsy();
});

test('geom.Size.equals with other object', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.equals({ w: 2.1, h: 10.5 })).toBeTruthy();
  expect(s.equals({ w: 2.1, h: 10.5, z: 100.0 })).toBeTruthy();
  expect(s.equals({ w: 2.11, h: 10.5 })).toBeFalsy();
  expect(s.equals({ w: 2.1, h: 10.4 })).toBeFalsy();
  expect(s.equals({ w: 2.1 })).toBeFalsy();
  expect(s.equals({ z: 2.1, h: 10.5 })).toBeFalsy();
});

test('geom.Size.scale with one factor', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.scale(2)).toEqual(new geom.Size(4.2, 21.0));
  expect(s.scale(-2)).toEqual(new geom.Size(-4.2, -21.0));
  expect(s.scale(0.5)).toEqual(new geom.Size(1.05, 5.25));
  expect(s.scale(1)).toEqual(s);
  expect(s.scale(0)).toEqual(new geom.Size(0, 0));
});

test('geom.Size.scale with x and y factors', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.scale(2, 3)).toEqual(new geom.Size(4.2, 31.5));
  expect(s.scale(-2, -3)).toEqual(new geom.Size(-4.2, -31.5));
  expect(s.scale(0.5, 0.1)).toEqual(new geom.Size(1.05, 1.05));
  expect(s.scale(1, 0)).toEqual(new geom.Size(2.1, 0));
  expect(s.scale(0, 1)).toEqual(new geom.Size(0, 10.5));
});

test('geom.Size.add number', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.add(2)).toEqual(new geom.Size(4.1, 12.5));
  expect(s.add(-1)).toEqual(new geom.Size(1.1, 9.5));
  expect(s.add(0)).toEqual(s);
});

test('geom.Size.add Size', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.add(new geom.Size(1.0, 2))).toEqual(new geom.Size(3.1, 12.5));
  expect(s.add(new geom.Size(-1.0, -2))).toEqual(new geom.Size(1.1, 8.5));
  expect(s.add(new geom.Size(0, 0))).toEqual(s);
});

test('geom.Size.add Point', () => {
  const s = new geom.Size(2.1, 10.5);
  // Point does not have w or h properties.
  expect(() => s.add(new geom.Point(1, 2))).toThrow();
});

test('geom.Size.add object', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.add({ w: 1, h: 2 })).toEqual(new geom.Size(3.1, 12.5));
});

test('geom.Size.add w and h numbers', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.add(2, 5)).toEqual(new geom.Size(4.1, 15.5));
  expect(s.add(-1, -3)).toEqual(new geom.Size(1.1, 7.5));
  expect(s.add(0, 0)).toEqual(s);
});

test('geom.Size.add needs number or object', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(() => s.add('2')).toThrow();
  expect(() => s.add()).toThrow();
});

test('geom.Size.add object parameter must have expected properties', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(() => s.add({})).toThrow();
  expect(() => s.add({ a: 1, b: 2 })).toThrow();
  expect(() => s.add({ x: 1, y: 2 })).toThrow();
});

test('geom.Size.subtract number', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.subtract(1)).toEqual(new geom.Size(1.1, 9.5));
  expect(s.subtract(-1)).toEqual(new geom.Size(3.1, 11.5));
  expect(s.subtract(0)).toEqual(s);
});

test('geom.Size.subtract Size', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.subtract(new geom.Size(1.0, 2))).toEqual(new geom.Size(1.1, 8.5));
  expect(s.subtract(new geom.Size(-1.0, -2))).toEqual(new geom.Size(3.1, 12.5));
  expect(s.subtract(new geom.Size(0, 0))).toEqual(s);
});

test('geom.Size.subtract Point', () => {
  const s = new geom.Size(2.1, 10.5);
  // Point does not have w or h properties.
  expect(() => s.subtract(new geom.Point(1, 2))).toThrow();
});

test('geom.Size.subtract object', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.subtract({ w: 1, h: 2 })).toEqual(new geom.Size(1.1, 8.5));
});

test('geom.Size.subtract x and y numbers', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(s.subtract(1, 5)).toEqual(new geom.Size(1.1, 5.5));
  expect(s.subtract(-1.0, -3)).toEqual(new geom.Size(3.1, 13.5));
  expect(s.subtract(0, 0)).toEqual(s);
});

test('geom.Size.subtract needs number or object', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(() => s.subtract('2')).toThrow();
  expect(() => s.subtract()).toThrow();
});

test('geom.Size.subtract object parameter must have expected properties', () => {
  const s = new geom.Size(2.1, 10.5);
  expect(() => s.subtract({})).toThrow();
  expect(() => s.subtract({ a: 1, b: 2 })).toThrow();
});

test('geom.Size.round', () => {
  expect(new geom.Size(1.0, 2).round()).toEqual(new geom.Size(1, 2));
  expect(new geom.Size(1.1, 2.4).round()).toEqual(new geom.Size(1, 2));
  expect(new geom.Size(1.5, 2.7).round()).toEqual(new geom.Size(2, 3));
  expect(new geom.Size(-1.0, -2).round()).toEqual(new geom.Size(-1, -2));
  expect(new geom.Size(-1.1, -2.4).round()).toEqual(new geom.Size(-1, -2));
  expect(new geom.Size(-1.5, -2.7).round()).toEqual(new geom.Size(-1, -3));
});
