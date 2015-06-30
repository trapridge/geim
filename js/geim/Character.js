var getPoint = require('./Point');
var getVector = require('./Vector');

var getCharacter = function (spec) {
  'use strict';

  var defaults = {
    position: getPoint(),
    movement: getVector(),
    mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 50, 50),
                         new THREE.MeshNormalMaterial()),
    health: 100,
    visible: true,
    rotating: false
  };
  spec = spec || defaults;

  var character = {};
  (function init() {
    character.position = spec.position || defaults.position;
    character.movement = spec.movement || defaults.movement;
    character.mesh = spec.mesh || defaults.mesh;
    character.health = spec.health || defaults.health;
    character.visible = spec.visible || defaults.visible;
    character.rotating = spec.rotating || defaults.rotating;
    updateMeshPosition(character.position, character.mesh);
  })();

  // METHODS
  character.update = function(delta) {
    updateMeshPosition(character.position.addVector(character.movement),
                       character.mesh);

    if(character.rotating) {
      character.mesh.rotation.y += 0.0225;
    }
  };

  character.draw = function(delta, renderer) {
    // mesh drawn as part of scene in Game.js
  };

  character.setRotate = function(rotate) {
    character.rotating = rotate;
  };

  // HELPERS
  function updateMeshPosition(point, mesh) {
    mesh.position.x = point.x;
    mesh.position.y = point.y;
    mesh.position.z = point.z;
  }

  return character;
}

module.exports = getCharacter;