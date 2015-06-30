// TODO: this is not needed as Euler angles are calculated in THREE

var createVector = require('./Vector');

var createEulerAngle = function(spec) {
  'use strict';

  // INIT
  var defaults =  { pitch: 0, yaw: 0, roll: 0 };
  spec = spec || defaults;
  var eulerAngle = {};


  // FIELDS
  eulerAngle.pitch = spec.pitch || defaults.pitch;
  eulerAngle.yaw = spec.yaw || defaults.yaw;
  eulerAngle.roll = spec.roll || defaults.roll;


  // METHODS
  eulerAngle.toVector = function() {
    return createVector({
      x: Math.cos(eulerAngle.yaw) * Math.cos(eulerAngle.pitch),
      y: Math.sin(eulerAngle.pitch),
      z: Math.sin(eulerAngle.yaw) * Math.cos(eulerAngle.pitch)
    });
  };

  /*
  eulerAngle.normalize = function() {
  };
  */


  return eulerAngle;
}

module.exports = createEulerAngle;