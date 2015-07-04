// TODO: this is not needed as Euler angles are calculated in THREE

var createVector = require('./Vector');

var createEulerAngles = function(spec) {
  'use strict';

  // INIT
  var defaults =  { pitch: 0, yaw: 0, roll: 0 };
  spec = spec || defaults;
  var eulerAngles = {};


  // FIELDS
  eulerAngles.pitch = spec.pitch || defaults.pitch;
  eulerAngles.yaw = spec.yaw || defaults.yaw;
  eulerAngles.roll = spec.roll || defaults.roll;


  // METHODS
  eulerAngles.toVector = function() {
    return createVector({
      //x: Math.cos(eulerAngles.yaw) * Math.cos(eulerAngles.pitch),
      //y: Math.sin(eulerAngles.pitch),
      //z: Math.sin(eulerAngles.yaw) * Math.cos(eulerAngles.pitch)
      // note x and z switched as we rotation to be neutral along z axis by default
      x: Math.sin(eulerAngles.yaw) * Math.cos(eulerAngles.pitch),
      y: Math.sin(eulerAngles.pitch),
      z: Math.cos(eulerAngles.yaw) * Math.cos(eulerAngles.pitch)
    });
  };

  eulerAngles.restrict = function() {
    if(eulerAngles.pitch > Math.PI / 2/* - 0.1*/) {
      eulerAngles.pitch = Math.PI / 2/* - 0.1*/;
    }
    else if(eulerAngles.pitch < -Math.PI / 2/* + 0.1*/) {
      eulerAngles.pitch = -Math.PI / 2/* + 0.1*/;
    }

    while(eulerAngles.yaw < -Math.PI) {
      eulerAngles.yaw += Math.PI * 2;
    }
    while(eulerAngles.yaw > Math.PI) {
      eulerAngles.yaw -= Math.PI * 2;
    }
    return eulerAngles;
  };

  eulerAngles.log = function() {
    console.log('pitch', eulerAngles.pitch * 180/Math.PI);
    console.log('yaw', eulerAngles.yaw * 180/Math.PI);
    console.log('roll', eulerAngles.roll * 180/Math.PI);
  };

  eulerAngles.clone = function() {
    return createEulerAngles({
      pitch: eulerAngles.pitch,
      yaw: eulerAngles.yaw,
      roll: eulerAngles.roll
    });
  };

  return eulerAngles;
}

module.exports = createEulerAngles;