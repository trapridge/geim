var createPoint = require('./Point');
var createVector = require('./Vector');

var createCharacter = function (spec) {
  'use strict';

  // INIT
  var defaults = {
    position: createPoint(),
    movementDirection: createVector(),
    movement: createVector(),
    mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                         new THREE.MeshNormalMaterial()),
    health: 100,
    visible: true,
    rotating: false,
    velocity: 0 // units/ms
  };
  spec = spec || defaults;
  var character = {};


  // FIELDS
  character.position = spec.position || defaults.position;
  character.movementDirection = spec.movementDirection || defaults.movementDirection;
  character.movement = spec.movement || defaults.movement;
  character.mesh = spec.mesh || defaults.mesh;
  character.health = spec.health || defaults.health;
  character.visible = spec.visible || defaults.visible;
  character.rotating = spec.rotating || defaults.rotating;
  character.velocity = spec.velocity || defaults.velocity;


  // METHODS
  character.update = function(delta) {
    // move character by adding to current position
    character.movement = character.movementDirection;
    character.position.addVector(character.movement.scale(character.velocity));

    // update mesh to new position
    updateMeshPosition(character.position, character.mesh);
  };

  character.draw = function(delta, renderer) {
    // mesh drawn as part of scene in Game.js
  };


  // HELPERS
  function updateMeshPosition(point, mesh) {
    mesh.position.x = point.x;
    mesh.position.y = point.y;
    mesh.position.z = point.z;
  }


  return character;
}

module.exports = createCharacter;