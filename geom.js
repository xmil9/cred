//
// Geometry functionality.
//
'use strict';

///////////////////

// Geometry module.
var geom = (function() {
  ///////////////////

  // Represents a rectangle.
  // Rect instances are immutable.
  class Rect {
    constructor(left = 0, top = 0, width = 0, height = 0) {
      if (width < 0 || height < 0) {
        throw new Error('Negative Rect dimensions are not valid.');
      }
      this._left = left;
      this._top = top;
      this._width = width;
      this._height = height;
    }

    get left() {
      return this._left;
    }

    get top() {
      return this._top;
    }

    get right() {
      return this.left + this.width;
    }

    get bottom() {
      return this.top + this.height;
    }

    get width() {
      return this._width;
    }

    get height() {
      return this._height;
    }

    size() {
      return new Size(this.width, this.height);
    }

    leftTop() {
      return new Point(this._left, this._top);
    }

    centerTop() {
      return new Point(this._horzCenter(), this._top);
    }

    rightTop() {
      return new Point(this.right, this._top);
    }

    rightCenter() {
      return new Point(this.right, this._vertCenter());
    }

    rightBottom() {
      return new Point(this.right, this.bottom);
    }

    centerBottom() {
      return new Point(this._horzCenter(), this.bottom);
    }

    leftBottom() {
      return new Point(this._left, this.bottom);
    }

    leftCenter() {
      return new Point(this._left, this._vertCenter());
    }

    center() {
      return new Point(this._horzCenter(), this._vertCenter());
    }

    _horzCenter() {
      return this._left + this._width / 2;
    }

    _vertCenter() {
      return this._top + this._height / 2;
    }
  }

  ///////////////////

  // Represents a point.
  // Point instances are immutable.
  class Point {
    constructor(x = 0, y = 0) {
      this._x = x;
      this._y = y;
    }

    get x() {
      return this._x;
    }

    get y() {
      return this._y;
    }

    equals(other) {
      if (typeof other.x === 'undefined' || typeof other.y === 'undefined') {
        return false;
      }
      return this.x === other.x && this.y === other.y;
    }

    scale(xFactor, yFactor = xFactor) {
      return new Point(this._x * xFactor, this._y * yFactor);
    }

    add(val, yVal) {
      const [x, y] = resolveHVArgs(val, yVal, ['x', 'w'], ['y', 'h']);
      return new Point(this._x + x, this._y + y);
    }

    subtract(val, yVal) {
      const [x, y] = resolveHVArgs(val, yVal, ['x', 'w'], ['y', 'h']);
      return new Point(this._x - x, this._y - y);
    }

    round() {
      return new Point(Math.round(this._x), Math.round(this._y));
    }
  }

  ///////////////////

  // Represents a size.
  // Size instances are immutable.
  class Size {
    constructor(width = 0, height = 0) {
      this._w = width;
      this._h = height;
    }

    get w() {
      return this._w;
    }

    get h() {
      return this._h;
    }

    equals(other) {
      return this.w === other.w && this.h === other.h;
    }

    scale(wFactor, hFactor = wFactor) {
      return new Size(this._w * wFactor, this._h * hFactor);
    }

    add(val, hVal) {
      const [w, h] = resolveHVArgs(val, hVal, ['w'], ['h']);
      return new Size(this._w + w, this._h + h);
    }

    subtract(val, hVal) {
      const [w, h] = resolveHVArgs(val, hVal, ['w'], ['h']);
      return new Size(this._w - w, this._h - h);
    }

    round() {
      return new Size(Math.round(this._w), Math.round(this._h));
    }
  }

  ///////////////////

  // Resolves the different combination of arguments that are permitted for
  // specifying horizontal and vertical values.
  // The horizontal argument is required. The vertical argument is optional.
  // Each can either be a numeric value or an object with a given, ordered list
  // of property names to access the values to use.
  // Returns array with the resolved horizontal argument as first element and
  // the vertical argument as second.
  function resolveHVArgs(horzArg, vertArg, horzProperties, vertProperties) {
    // Copy the horizontal argument, if the vertical argument is not provided.
    if (typeof vertArg === 'undefined') {
      vertArg = horzArg;
    }

    let horz = undefined;
    if (typeof horzArg === 'number') {
      horz = horzArg;
    } else if (typeof horzArg === 'object') {
      horz = firstValueOf(horzArg, horzProperties);
    }
    if (typeof horz === 'undefined') {
      throw new Error('Invalid argument.');
    }

    let vert = undefined;
    if (typeof vertArg === 'number') {
      vert = vertArg;
    } else if (typeof vertArg === 'object') {
      vert = firstValueOf(vertArg, vertProperties);
    }
    if (typeof vert === 'undefined') {
      throw new Error('Invalid argument.');
    }

    return [horz, vert];
  }

  // Returns the value of the object property first found from an ordered array
  // of properties to look for.
  // Returns 'undefined' if none found.
  function firstValueOf(obj, properties) {
    for (let i = 0; i < properties.length; ++i) {
      const property = properties[i];
      if (typeof obj[property] !== 'undefined') {
        return obj[property];
      }
    }
    return undefined;
  }

  ///////////////////

  // Exports
  return {
    Point: Point,
    Rect: Rect,
    Size: Size
  };
})();

// Exports for CommonJS environments.
var module = module || {};
module.exports = geom;
