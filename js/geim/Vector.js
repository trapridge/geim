// TODO: transition to THREE.Vector3 at some point

var createVector = function(spec) {
  'use strict';

  // INIT
  var defaults = { x: 0, y: 0, z: 0 };
  spec = spec || defaults;
  var vector = {};


  // FIELDS
  vector.x = spec.x || defaults.x;
  vector.y = spec.y || defaults.y;
  vector.z = spec.z || defaults.z;


  // METHODS
  vector.magnitude = function() {
    return Math.sqrt(vector.magnitudeSquared());
  };

  vector.magnitudeSquared = function() {
    return vector.x * vector.x +
           vector.y * vector.y +
           vector.z * vector.z;
  };

  vector.addVector = function(otherVector) {
    vector.x += otherVector.x,
    vector.y += otherVector.y,
    vector.z += otherVector.z
    return vector;
  };

  vector.substractVector = function(otherVector) {
    vector.x -= otherVector.x,
    vector.y -= otherVector.y,
    vector.z -= otherVector.z
    return vector;
  };

  vector.scale = function(scalar) {
    vector.x *= scalar;
    vector.y *= scalar;
    vector.z *= scalar;
    return vector;
  };

  vector.reverse = function() {
    vector.x *= -1;
    vector.y *= -1;
    vector.z *= -1;
    return vector;
  }

  vector.dotProduct = function(otherVector) {
    return vector.x * otherVector.x +
            vector.y * otherVector.y +
            vector.z * otherVector.z;
  };

  vector.longerThan = function(otherVector) {
    return vector.magnitudeSquared() > otherVector.magnitudeSquared();
  };

  vector.zero = function() {
    vector.x = 0;
    vector.y = 0;
    vector.z = 0;
    return vector;
  }

  vector.log = function() {
    console.log('x', vector.x);
    console.log('y', vector.y);
    console.log('z', vector.z);
  };

  vector.createNormalized = function() {
    var magnitude = vector.magnitude();
    return createVector({
      x: vector.x / magnitude,
      y: vector.y / magnitude,
      z: vector.z / magnitude
    });
  };

  vector.createCrossProduct = function(otherVector) {
    return createVector({
      x: vector.y * otherVector.z - vector.z * otherVector.y,
      y: vector.z * otherVector.x - vector.x * otherVector.z,
      z: vector.x * otherVector.y - vector.y * otherVector.x
    });
  };


  return vector;
}

module.exports = createVector;
