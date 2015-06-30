var getVector = require('./Vector');

var getPoint = function(spec) {
  'use strict';

  var defaults =  { x: 0, y: 0, z: 0 };

  spec = spec || defaults;

  var point = {};
  (function init() {
    point.x = spec.x || defaults.x;
    point.y = spec.y || defaults.y;
    point.z = spec.z || defaults.z;
  })();

  // METHODS
  point.addVector = function(vector) {
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
  };

  point.getVectorToPoint = function(fromPoint) {
    return getVector({
      x: point.x -= fromPoint.x,
      y: point.y -= fromPoint.y,
      z: point.z -= fromPoint.z
    });
  };

  point.getVectorFromPoint = function(toPoint) {
    return getVector({
      x: toPoint.x -= point.x,
      y: toPoint.y -= point.y,
      z: toPoint.z -= point.z
    });
  };

  point.log = function() {
    console.log('x', point.x);
    console.log('y', point.y);
    console.log('z', point.z);
  };

  return point;
}

module.exports = getPoint;