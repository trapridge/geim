// TODO: consider using THREE.Vector3 at some point

var createVector = require('./Vector');

var createPoint = function(spec) {
  'use strict';

  // INIT
  var defaults =  { x: 0, y: 0, z: 0 };
  spec = spec || defaults;
  var point = {};


  // FIELDS
  point.x = spec.x || defaults.x;
  point.y = spec.y || defaults.y;
  point.z = spec.z || defaults.z;


  // METHODS
  point.addVector = function(vector) {
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
  };

  point.substractVector = function(vector) {
    point.x -= vector.x;
    point.y -= vector.y;
    point.z -= vector.z;
    return point;
  };

  point.createVectorToPoint = function(fromPoint) {
    return createVector({
      x: point.x -= fromPoint.x,
      y: point.y -= fromPoint.y,
      z: point.z -= fromPoint.z
    });
  };

  point.createVectorFromPoint = function(toPoint) {
    return createVector({
      x: toPoint.x -= point.x,
      y: toPoint.y -= point.y,
      z: toPoint.z -= point.z
    });
  };

  point.clone = function() {
    return createPoint({
      x: point.x,
      y: point.y,
      z: point.z
    });
  };

  point.log = function() {
    console.log('x', point.x);
    console.log('y', point.y);
    console.log('z', point.z);
  };


  return point;
}

module.exports = createPoint;