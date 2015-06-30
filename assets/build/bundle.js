(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/geim/Game.js":[function(require,module,exports){
var createCharacter = require('./Character');
var createPlayer = require('./Player');
var createPoint = require('./Point');

var player = createPlayer({
  position: createPoint({x: 0, y: 0, z: 0}),
  mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                       new THREE.MeshNormalMaterial())
});

var ramdomSeedSize = 400;
var characters = [
  player,
  createCharacter({
    position: createPoint({
      x: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1),
      z: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1)
    })
  }),
  createCharacter({
    position: createPoint({
      x: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1),
      z: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1)
    })
  }),
  createCharacter({
    position: createPoint({
      x: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1),
      z: Math.random() * ramdomSeedSize - (ramdomSeedSize >> 1)
    })
  })
];

var container, camera, scene, renderer;

init();
gameLoop();

function init() {

  camera = new THREE.PerspectiveCamera(70,
                                       window.innerWidth / window.innerHeight,
                                       1, 1000);
  camera.position.y = 50;

  scene = new THREE.Scene();

  characters.forEach(function(char) {
    scene.add(char.mesh);
  });

  var lineMaterial = new THREE.LineBasicMaterial( { color: 0x303030 } ),
  geometry = new THREE.Geometry(),
  floor = -50, step = 25;

  for ( var i = 0; i <= 40; i ++ ) {

    geometry.vertices.push( new THREE.Vector3( - 500, floor, i * step - 500 ) );
    geometry.vertices.push( new THREE.Vector3(   500, floor, i * step - 500 ) );

    geometry.vertices.push( new THREE.Vector3( i * step - 500, floor, -500 ) );
    geometry.vertices.push( new THREE.Vector3( i * step - 500, floor,  500 ) );

  }

  var grid = new THREE.Line( geometry, lineMaterial, THREE.LinePieces );
  scene.add(grid);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  container = document.getElementById('container');
  container.appendChild(renderer.domElement);
}

var start, delta = 0;
function gameLoop() {
  start = Date.now();
  update(delta);
  draw(delta);
  delta = Date.now() - start;
  if(delta < 10) delta = 10;
  requestAnimationFrame(gameLoop);
}

function update(delta) {
  var v = player.viewAngle.toVector().scale(150);
  //v.log();
  var p = player.position.clone();
  //p.log();
  var i = p.addVector(v);
  camera.position.z = i.z + 200;
  camera.position.x = i.x;
  camera.position.y = i.y + 50;

  //console.log(camera.position.x);

  camera.lookAt(player.mesh.position);

  characters.forEach(function(char) {
    char.update(delta);
  });
}

function draw(delta) {
  //characters.forEach(function(char) {
  //  char.draw(delta, renderer);
  //});

  renderer.render(scene, camera);
}


var mouseSensitivity = 0.01, lastX = 0, lastY = 0;
document.addEventListener('mousemove', function(event) {
  if(lastX > 0 && lastY > 0) {
    var movedX = event.screenX - lastX;
    var movedY = event.screenY - lastY;

    //player.mesh.rotation.x += movedX * mouseSensitivity;

    //camera.position.y -= movedY;
    //camera.lookAt(player.mesh.position);
    //player.mesh.rotation.y -= movedX * mouseSensitivity;

    player.viewAngle.pitch += movedY * mouseSensitivity;
    player.viewAngle.yaw += movedX * mouseSensitivity;


    console.log('angles', player.viewAngle.pitch * (180/Math.PI), player.viewAngle.yaw * (180/Math.PI));
  }
  lastX = event.screenX;
  lastY = event.screenY;
}, false);
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./Player":"/Users/jansaharju/Code/geim/js/geim/Player.js","./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js"}],"/Users/jansaharju/Code/geim/js/geim/Character.js":[function(require,module,exports){
var createPoint = require('./Point');
var createVector = require('./Vector');

var createCharacter = function (spec) {
  'use strict';

  // INIT
  var defaults = {
    position: createPoint(),
    movement: createVector(),
    mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                         new THREE.MeshNormalMaterial()),
    health: 100,
    visible: true,
    rotating: false
  };
  spec = spec || defaults;
  var character = {};


  // FIELDS
  character.position = spec.position || defaults.position;
  character.movement = spec.movement || defaults.movement;
  character.mesh = spec.mesh || defaults.mesh;
  character.health = spec.health || defaults.health;
  character.visible = spec.visible || defaults.visible;
  character.rotating = spec.rotating || defaults.rotating;


  // METHODS
  character.update = function(delta) {
    // move character
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

module.exports = createCharacter;
},{"./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/EulerAngle.js":[function(require,module,exports){
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
},{"./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js":[function(require,module,exports){
var movementSensitivity = 3;

var createKeyHandler = function(player) {

  document.addEventListener('keydown', function(event) {
    switch(event.keyCode) {
      case 87: // w
        player.movement.z = -movementSensitivity;
        break;
      case 65: // a
        player.movement.x = -movementSensitivity;
        break;
      case 83: // s
        player.movement.z = movementSensitivity;
        break;
      case 68: // d
        player.movement.x = movementSensitivity;
        break;
    }

    //if(event.keyCode === 87 || event.keyCode === 65 ||
    //   event.keyCode === 83 || event.keyCode === 68) {
    //
    //  player.setRotate(false);
    //}

  }, false);

  document.addEventListener('keyup', function(event) {
    switch(event.keyCode) {
      case 87: // w
        if(player.movement.z === -movementSensitivity)
          player.movement.z = 0;
        break;
      case 65: // a
        if(player.movement.x === -movementSensitivity)
          player.movement.x = 0;
        break;
      case 83: // s
        if(player.movement.z === movementSensitivity)
          player.movement.z = 0;
        break;
      case 68: // d
        if(player.movement.x === movementSensitivity)
          player.movement.x = 0;
        break;
    }

    //if(player.movement.x === 0 && player.movement.z === 0) {
    //  player.setRotate(true);
    //}

  }, false);

}

module.exports = createKeyHandler;
},{}],"/Users/jansaharju/Code/geim/js/geim/Player.js":[function(require,module,exports){
var createCharacter = require('./Character');
var createEulerAngle = require('./EulerAngle');
var playerKeyHandler = require('./KeyHandler');

var singletonPlayer;
var createPlayer = function (spec) {
  'use strict';

  if(singletonPlayer) {
    return singletonPlayer;
  }

  // INIT
  var player = createCharacter(spec);
  var defaults = {
    points: 0,
    viewAngle: createEulerAngle()
  };
  player.points = spec && spec.points ? spec.points : defaults.points;
  player.viewAngle = spec && spec.points ? spec.viewAngle : defaults.viewAngle;
  playerKeyHandler(player);

  // METHODS
  var superUpdate = player.update;
  player.update = function(delta) {
    superUpdate(delta);
  };

  var superDraw = player.draw;
  player.draw = function(delta, renderer) {
    superDraw(delta, renderer);
    // mesh drawn as part of scene in Game.js
  };


  return singletonPlayer = player;
}

module.exports = createPlayer;
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./EulerAngle":"/Users/jansaharju/Code/geim/js/geim/EulerAngle.js","./KeyHandler":"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js"}],"/Users/jansaharju/Code/geim/js/geim/Point.js":[function(require,module,exports){
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
},{"./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Vector.js":[function(require,module,exports){
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
    return x * x + y * y + z * z;
  };

  vector.addToVector = function(otherVector) {
    vector.x += otherVector.x,
    vector.y += otherVector.y,
    vector.z += otherVector.z
    return vector;
  };

  vector.substractFromVector = function(otherVector) {
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

},{}]},{},["./js/geim/Game.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL2dlaW0vR2FtZS5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0V1bGVyQW5nbGUuanMiLCIvVXNlcnMvamFuc2FoYXJqdS9Db2RlL2dlaW0vanMvZ2VpbS9LZXlIYW5kbGVyLmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vUGxheWVyLmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vUG9pbnQuanMiLCIvVXNlcnMvamFuc2FoYXJqdS9Db2RlL2dlaW0vanMvZ2VpbS9WZWN0b3IuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGNyZWF0ZUNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG52YXIgY3JlYXRlUGxheWVyID0gcmVxdWlyZSgnLi9QbGF5ZXInKTtcbnZhciBjcmVhdGVQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcblxudmFyIHBsYXllciA9IGNyZWF0ZVBsYXllcih7XG4gIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7eDogMCwgeTogMCwgejogMH0pLFxuICBtZXNoOiBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNTAsIDEwMCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICBuZXcgVEhSRUUuTWVzaE5vcm1hbE1hdGVyaWFsKCkpXG59KTtcblxudmFyIHJhbWRvbVNlZWRTaXplID0gNDAwO1xudmFyIGNoYXJhY3RlcnMgPSBbXG4gIHBsYXllcixcbiAgY3JlYXRlQ2hhcmFjdGVyKHtcbiAgICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe1xuICAgICAgeDogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpLFxuICAgICAgejogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpXG4gICAgfSlcbiAgfSksXG4gIGNyZWF0ZUNoYXJhY3Rlcih7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KHtcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKSxcbiAgICAgIHo6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKVxuICAgIH0pXG4gIH0pLFxuICBjcmVhdGVDaGFyYWN0ZXIoe1xuICAgIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7XG4gICAgICB4OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSksXG4gICAgICB6OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSlcbiAgICB9KVxuICB9KVxuXTtcblxudmFyIGNvbnRhaW5lciwgY2FtZXJhLCBzY2VuZSwgcmVuZGVyZXI7XG5cbmluaXQoKTtcbmdhbWVMb29wKCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDcwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLCAxMDAwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSA1MDtcblxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIGNoYXJhY3RlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFyKSB7XG4gICAgc2NlbmUuYWRkKGNoYXIubWVzaCk7XG4gIH0pO1xuXG4gIHZhciBsaW5lTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MzAzMDMwIH0gKSxcbiAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKSxcbiAgZmxvb3IgPSAtNTAsIHN0ZXAgPSAyNTtcblxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPD0gNDA7IGkgKysgKSB7XG5cbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggLSA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoICAgNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgLTUwMCApICk7XG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgIDUwMCApICk7XG5cbiAgfVxuXG4gIHZhciBncmlkID0gbmV3IFRIUkVFLkxpbmUoIGdlb21ldHJ5LCBsaW5lTWF0ZXJpYWwsIFRIUkVFLkxpbmVQaWVjZXMgKTtcbiAgc2NlbmUuYWRkKGdyaWQpO1xuXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cblxudmFyIHN0YXJ0LCBkZWx0YSA9IDA7XG5mdW5jdGlvbiBnYW1lTG9vcCgpIHtcbiAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICB1cGRhdGUoZGVsdGEpO1xuICBkcmF3KGRlbHRhKTtcbiAgZGVsdGEgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gIGlmKGRlbHRhIDwgMTApIGRlbHRhID0gMTA7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZShkZWx0YSkge1xuICB2YXIgdiA9IHBsYXllci52aWV3QW5nbGUudG9WZWN0b3IoKS5zY2FsZSgxNTApO1xuICAvL3YubG9nKCk7XG4gIHZhciBwID0gcGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XG4gIC8vcC5sb2coKTtcbiAgdmFyIGkgPSBwLmFkZFZlY3Rvcih2KTtcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSBpLnogKyAyMDA7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gaS54O1xuICBjYW1lcmEucG9zaXRpb24ueSA9IGkueSArIDUwO1xuXG4gIC8vY29uc29sZS5sb2coY2FtZXJhLnBvc2l0aW9uLngpO1xuXG4gIGNhbWVyYS5sb29rQXQocGxheWVyLm1lc2gucG9zaXRpb24pO1xuXG4gIGNoYXJhY3RlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFyKSB7XG4gICAgY2hhci51cGRhdGUoZGVsdGEpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gZHJhdyhkZWx0YSkge1xuICAvL2NoYXJhY3RlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFyKSB7XG4gIC8vICBjaGFyLmRyYXcoZGVsdGEsIHJlbmRlcmVyKTtcbiAgLy99KTtcblxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5cblxudmFyIG1vdXNlU2Vuc2l0aXZpdHkgPSAwLjAxLCBsYXN0WCA9IDAsIGxhc3RZID0gMDtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGlmKGxhc3RYID4gMCAmJiBsYXN0WSA+IDApIHtcbiAgICB2YXIgbW92ZWRYID0gZXZlbnQuc2NyZWVuWCAtIGxhc3RYO1xuICAgIHZhciBtb3ZlZFkgPSBldmVudC5zY3JlZW5ZIC0gbGFzdFk7XG5cbiAgICAvL3BsYXllci5tZXNoLnJvdGF0aW9uLnggKz0gbW92ZWRYICogbW91c2VTZW5zaXRpdml0eTtcblxuICAgIC8vY2FtZXJhLnBvc2l0aW9uLnkgLT0gbW92ZWRZO1xuICAgIC8vY2FtZXJhLmxvb2tBdChwbGF5ZXIubWVzaC5wb3NpdGlvbik7XG4gICAgLy9wbGF5ZXIubWVzaC5yb3RhdGlvbi55IC09IG1vdmVkWCAqIG1vdXNlU2Vuc2l0aXZpdHk7XG5cbiAgICBwbGF5ZXIudmlld0FuZ2xlLnBpdGNoICs9IG1vdmVkWSAqIG1vdXNlU2Vuc2l0aXZpdHk7XG4gICAgcGxheWVyLnZpZXdBbmdsZS55YXcgKz0gbW92ZWRYICogbW91c2VTZW5zaXRpdml0eTtcblxuXG4gICAgY29uc29sZS5sb2coJ2FuZ2xlcycsIHBsYXllci52aWV3QW5nbGUucGl0Y2ggKiAoMTgwL01hdGguUEkpLCBwbGF5ZXIudmlld0FuZ2xlLnlhdyAqICgxODAvTWF0aC5QSSkpO1xuICB9XG4gIGxhc3RYID0gZXZlbnQuc2NyZWVuWDtcbiAgbGFzdFkgPSBldmVudC5zY3JlZW5ZO1xufSwgZmFsc2UpOyIsInZhciBjcmVhdGVQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlQ2hhcmFjdGVyID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIElOSVRcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHBvc2l0aW9uOiBjcmVhdGVQb2ludCgpLFxuICAgIG1vdmVtZW50OiBjcmVhdGVWZWN0b3IoKSxcbiAgICBtZXNoOiBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNTAsIDEwMCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoTm9ybWFsTWF0ZXJpYWwoKSksXG4gICAgaGVhbHRoOiAxMDAsXG4gICAgdmlzaWJsZTogdHJ1ZSxcbiAgICByb3RhdGluZzogZmFsc2VcbiAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBjaGFyYWN0ZXIgPSB7fTtcblxuXG4gIC8vIEZJRUxEU1xuICBjaGFyYWN0ZXIucG9zaXRpb24gPSBzcGVjLnBvc2l0aW9uIHx8IGRlZmF1bHRzLnBvc2l0aW9uO1xuICBjaGFyYWN0ZXIubW92ZW1lbnQgPSBzcGVjLm1vdmVtZW50IHx8IGRlZmF1bHRzLm1vdmVtZW50O1xuICBjaGFyYWN0ZXIubWVzaCA9IHNwZWMubWVzaCB8fCBkZWZhdWx0cy5tZXNoO1xuICBjaGFyYWN0ZXIuaGVhbHRoID0gc3BlYy5oZWFsdGggfHwgZGVmYXVsdHMuaGVhbHRoO1xuICBjaGFyYWN0ZXIudmlzaWJsZSA9IHNwZWMudmlzaWJsZSB8fCBkZWZhdWx0cy52aXNpYmxlO1xuICBjaGFyYWN0ZXIucm90YXRpbmcgPSBzcGVjLnJvdGF0aW5nIHx8IGRlZmF1bHRzLnJvdGF0aW5nO1xuXG5cbiAgLy8gTUVUSE9EU1xuICBjaGFyYWN0ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICAvLyBtb3ZlIGNoYXJhY3RlclxuICAgIHVwZGF0ZU1lc2hQb3NpdGlvbihjaGFyYWN0ZXIucG9zaXRpb24uYWRkVmVjdG9yKGNoYXJhY3Rlci5tb3ZlbWVudCksXG4gICAgICAgICAgICAgICAgICAgICAgIGNoYXJhY3Rlci5tZXNoKTtcblxuICAgIGlmKGNoYXJhY3Rlci5yb3RhdGluZykge1xuICAgICAgY2hhcmFjdGVyLm1lc2gucm90YXRpb24ueSArPSAwLjAyMjU7XG4gICAgfVxuICB9O1xuXG4gIGNoYXJhY3Rlci5kcmF3ID0gZnVuY3Rpb24oZGVsdGEsIHJlbmRlcmVyKSB7XG4gICAgLy8gbWVzaCBkcmF3biBhcyBwYXJ0IG9mIHNjZW5lIGluIEdhbWUuanNcbiAgfTtcblxuICBjaGFyYWN0ZXIuc2V0Um90YXRlID0gZnVuY3Rpb24ocm90YXRlKSB7XG4gICAgY2hhcmFjdGVyLnJvdGF0aW5nID0gcm90YXRlO1xuICB9O1xuXG5cbiAgLy8gSEVMUEVSU1xuICBmdW5jdGlvbiB1cGRhdGVNZXNoUG9zaXRpb24ocG9pbnQsIG1lc2gpIHtcbiAgICBtZXNoLnBvc2l0aW9uLnggPSBwb2ludC54O1xuICAgIG1lc2gucG9zaXRpb24ueSA9IHBvaW50Lnk7XG4gICAgbWVzaC5wb3NpdGlvbi56ID0gcG9pbnQuejtcbiAgfVxuXG5cbiAgcmV0dXJuIGNoYXJhY3Rlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDaGFyYWN0ZXI7IiwiLy8gVE9ETzogdGhpcyBpcyBub3QgbmVlZGVkIGFzIEV1bGVyIGFuZ2xlcyBhcmUgY2FsY3VsYXRlZCBpbiBUSFJFRVxuXG52YXIgY3JlYXRlVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcblxudmFyIGNyZWF0ZUV1bGVyQW5nbGUgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHBpdGNoOiAwLCB5YXc6IDAsIHJvbGw6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBldWxlckFuZ2xlID0ge307XG5cblxuICAvLyBGSUVMRFNcbiAgZXVsZXJBbmdsZS5waXRjaCA9IHNwZWMucGl0Y2ggfHwgZGVmYXVsdHMucGl0Y2g7XG4gIGV1bGVyQW5nbGUueWF3ID0gc3BlYy55YXcgfHwgZGVmYXVsdHMueWF3O1xuICBldWxlckFuZ2xlLnJvbGwgPSBzcGVjLnJvbGwgfHwgZGVmYXVsdHMucm9sbDtcblxuXG4gIC8vIE1FVEhPRFNcbiAgZXVsZXJBbmdsZS50b1ZlY3RvciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogTWF0aC5jb3MoZXVsZXJBbmdsZS55YXcpICogTWF0aC5jb3MoZXVsZXJBbmdsZS5waXRjaCksXG4gICAgICB5OiBNYXRoLnNpbihldWxlckFuZ2xlLnBpdGNoKSxcbiAgICAgIHo6IE1hdGguc2luKGV1bGVyQW5nbGUueWF3KSAqIE1hdGguY29zKGV1bGVyQW5nbGUucGl0Y2gpXG4gICAgfSk7XG4gIH07XG5cbiAgLypcbiAgZXVsZXJBbmdsZS5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgfTtcbiAgKi9cblxuXG4gIHJldHVybiBldWxlckFuZ2xlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUV1bGVyQW5nbGU7IiwidmFyIG1vdmVtZW50U2Vuc2l0aXZpdHkgPSAzO1xuXG52YXIgY3JlYXRlS2V5SGFuZGxlciA9IGZ1bmN0aW9uKHBsYXllcikge1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICAgIHN3aXRjaChldmVudC5rZXlDb2RlKSB7XG4gICAgICBjYXNlIDg3OiAvLyB3XG4gICAgICAgIHBsYXllci5tb3ZlbWVudC56ID0gLW1vdmVtZW50U2Vuc2l0aXZpdHk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2NTogLy8gYVxuICAgICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IC1tb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgODM6IC8vIHNcbiAgICAgICAgcGxheWVyLm1vdmVtZW50LnogPSBtb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjg6IC8vIGRcbiAgICAgICAgcGxheWVyLm1vdmVtZW50LnggPSBtb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvL2lmKGV2ZW50LmtleUNvZGUgPT09IDg3IHx8IGV2ZW50LmtleUNvZGUgPT09IDY1IHx8XG4gICAgLy8gICBldmVudC5rZXlDb2RlID09PSA4MyB8fCBldmVudC5rZXlDb2RlID09PSA2OCkge1xuICAgIC8vXG4gICAgLy8gIHBsYXllci5zZXRSb3RhdGUoZmFsc2UpO1xuICAgIC8vfVxuXG4gIH0sIGZhbHNlKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgODc6IC8vIHdcbiAgICAgICAgaWYocGxheWVyLm1vdmVtZW50LnogPT09IC1tb3ZlbWVudFNlbnNpdGl2aXR5KVxuICAgICAgICAgIHBsYXllci5tb3ZlbWVudC56ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY1OiAvLyBhXG4gICAgICAgIGlmKHBsYXllci5tb3ZlbWVudC54ID09PSAtbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4MzogLy8gc1xuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnQueiA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnQueiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2ODogLy8gZFxuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnQueCA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIC8vaWYocGxheWVyLm1vdmVtZW50LnggPT09IDAgJiYgcGxheWVyLm1vdmVtZW50LnogPT09IDApIHtcbiAgICAvLyAgcGxheWVyLnNldFJvdGF0ZSh0cnVlKTtcbiAgICAvL31cblxuICB9LCBmYWxzZSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVLZXlIYW5kbGVyOyIsInZhciBjcmVhdGVDaGFyYWN0ZXIgPSByZXF1aXJlKCcuL0NoYXJhY3RlcicpO1xudmFyIGNyZWF0ZUV1bGVyQW5nbGUgPSByZXF1aXJlKCcuL0V1bGVyQW5nbGUnKTtcbnZhciBwbGF5ZXJLZXlIYW5kbGVyID0gcmVxdWlyZSgnLi9LZXlIYW5kbGVyJyk7XG5cbnZhciBzaW5nbGV0b25QbGF5ZXI7XG52YXIgY3JlYXRlUGxheWVyID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmKHNpbmdsZXRvblBsYXllcikge1xuICAgIHJldHVybiBzaW5nbGV0b25QbGF5ZXI7XG4gIH1cblxuICAvLyBJTklUXG4gIHZhciBwbGF5ZXIgPSBjcmVhdGVDaGFyYWN0ZXIoc3BlYyk7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBwb2ludHM6IDAsXG4gICAgdmlld0FuZ2xlOiBjcmVhdGVFdWxlckFuZ2xlKClcbiAgfTtcbiAgcGxheWVyLnBvaW50cyA9IHNwZWMgJiYgc3BlYy5wb2ludHMgPyBzcGVjLnBvaW50cyA6IGRlZmF1bHRzLnBvaW50cztcbiAgcGxheWVyLnZpZXdBbmdsZSA9IHNwZWMgJiYgc3BlYy5wb2ludHMgPyBzcGVjLnZpZXdBbmdsZSA6IGRlZmF1bHRzLnZpZXdBbmdsZTtcbiAgcGxheWVyS2V5SGFuZGxlcihwbGF5ZXIpO1xuXG4gIC8vIE1FVEhPRFNcbiAgdmFyIHN1cGVyVXBkYXRlID0gcGxheWVyLnVwZGF0ZTtcbiAgcGxheWVyLnVwZGF0ZSA9IGZ1bmN0aW9uKGRlbHRhKSB7XG4gICAgc3VwZXJVcGRhdGUoZGVsdGEpO1xuICB9O1xuXG4gIHZhciBzdXBlckRyYXcgPSBwbGF5ZXIuZHJhdztcbiAgcGxheWVyLmRyYXcgPSBmdW5jdGlvbihkZWx0YSwgcmVuZGVyZXIpIHtcbiAgICBzdXBlckRyYXcoZGVsdGEsIHJlbmRlcmVyKTtcbiAgICAvLyBtZXNoIGRyYXduIGFzIHBhcnQgb2Ygc2NlbmUgaW4gR2FtZS5qc1xuICB9O1xuXG5cbiAgcmV0dXJuIHNpbmdsZXRvblBsYXllciA9IHBsYXllcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVQbGF5ZXI7IiwiLy8gVE9ETzogY29uc2lkZXIgdXNpbmcgVEhSRUUuVmVjdG9yMyBhdCBzb21lIHBvaW50XG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlUG9pbnQgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBwb2ludCA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIHBvaW50LnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgcG9pbnQueSA9IHNwZWMueSB8fCBkZWZhdWx0cy55O1xuICBwb2ludC56ID0gc3BlYy56IHx8IGRlZmF1bHRzLno7XG5cblxuICAvLyBNRVRIT0RTXG4gIHBvaW50LmFkZFZlY3RvciA9IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgIHBvaW50LnggKz0gdmVjdG9yLng7XG4gICAgcG9pbnQueSArPSB2ZWN0b3IueTtcbiAgICBwb2ludC56ICs9IHZlY3Rvci56O1xuICAgIHJldHVybiBwb2ludDtcbiAgfTtcblxuICBwb2ludC5zdWJzdHJhY3RWZWN0b3IgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICBwb2ludC54IC09IHZlY3Rvci54O1xuICAgIHBvaW50LnkgLT0gdmVjdG9yLnk7XG4gICAgcG9pbnQueiAtPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yVG9Qb2ludCA9IGZ1bmN0aW9uKGZyb21Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogcG9pbnQueCAtPSBmcm9tUG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnkgLT0gZnJvbVBvaW50LnksXG4gICAgICB6OiBwb2ludC56IC09IGZyb21Qb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yRnJvbVBvaW50ID0gZnVuY3Rpb24odG9Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdG9Qb2ludC54IC09IHBvaW50LngsXG4gICAgICB5OiB0b1BvaW50LnkgLT0gcG9pbnQueSxcbiAgICAgIHo6IHRvUG9pbnQueiAtPSBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlUG9pbnQoe1xuICAgICAgeDogcG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnksXG4gICAgICB6OiBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCBwb2ludC54KTtcbiAgICBjb25zb2xlLmxvZygneScsIHBvaW50LnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgcG9pbnQueik7XG4gIH07XG5cblxuICByZXR1cm4gcG9pbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUG9pbnQ7IiwiLy8gVE9ETzogdHJhbnNpdGlvbiB0byBUSFJFRS5WZWN0b3IzIGF0IHNvbWUgcG9pbnRcblxudmFyIGNyZWF0ZVZlY3RvciA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIElOSVRcbiAgdmFyIGRlZmF1bHRzID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gIHNwZWMgPSBzcGVjIHx8IGRlZmF1bHRzO1xuICB2YXIgdmVjdG9yID0ge307XG5cblxuICAvLyBGSUVMRFNcbiAgdmVjdG9yLnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgdmVjdG9yLnkgPSBzcGVjLnkgfHwgZGVmYXVsdHMueTtcbiAgdmVjdG9yLnogPSBzcGVjLnogfHwgZGVmYXVsdHMuejtcblxuXG4gIC8vIE1FVEhPRFNcbiAgdmVjdG9yLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSk7XG4gIH07XG5cbiAgdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xuICB9O1xuXG4gIHZlY3Rvci5hZGRUb1ZlY3RvciA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgdmVjdG9yLnggKz0gb3RoZXJWZWN0b3IueCxcbiAgICB2ZWN0b3IueSArPSBvdGhlclZlY3Rvci55LFxuICAgIHZlY3Rvci56ICs9IG90aGVyVmVjdG9yLnpcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9O1xuXG4gIHZlY3Rvci5zdWJzdHJhY3RGcm9tVmVjdG9yID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICB2ZWN0b3IueCAtPSBvdGhlclZlY3Rvci54LFxuICAgIHZlY3Rvci55IC09IG90aGVyVmVjdG9yLnksXG4gICAgdmVjdG9yLnogLT0gb3RoZXJWZWN0b3IuelxuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnNjYWxlID0gZnVuY3Rpb24oc2NhbGFyKSB7XG4gICAgdmVjdG9yLnggKj0gc2NhbGFyO1xuICAgIHZlY3Rvci55ICo9IHNjYWxhcjtcbiAgICB2ZWN0b3IueiAqPSBzY2FsYXI7XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3IucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ICo9IC0xO1xuICAgIHZlY3Rvci55ICo9IC0xO1xuICAgIHZlY3Rvci56ICo9IC0xO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IuZG90UHJvZHVjdCA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIHZlY3Rvci54ICogb3RoZXJWZWN0b3IueCArXG4gICAgICAgICAgICB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnkgK1xuICAgICAgICAgICAgdmVjdG9yLnogKiBvdGhlclZlY3Rvci56O1xuICB9O1xuXG4gIHZlY3Rvci5sb25nZXJUaGFuID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICByZXR1cm4gdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSA+IG90aGVyVmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfTtcblxuICB2ZWN0b3IuemVybyA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ID0gMDtcbiAgICB2ZWN0b3IueSA9IDA7XG4gICAgdmVjdG9yLnogPSAwO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCB2ZWN0b3IueCk7XG4gICAgY29uc29sZS5sb2coJ3knLCB2ZWN0b3IueSk7XG4gICAgY29uc29sZS5sb2coJ3onLCB2ZWN0b3Iueik7XG4gIH07XG5cbiAgdmVjdG9yLmNyZWF0ZU5vcm1hbGl6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFnbml0dWRlID0gdmVjdG9yLm1hZ25pdHVkZSgpO1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdmVjdG9yLnggLyBtYWduaXR1ZGUsXG4gICAgICB5OiB2ZWN0b3IueSAvIG1hZ25pdHVkZSxcbiAgICAgIHo6IHZlY3Rvci56IC8gbWFnbml0dWRlXG4gICAgfSk7XG4gIH07XG5cbiAgdmVjdG9yLmNyZWF0ZUNyb3NzUHJvZHVjdCA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICB4OiB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnogLSB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnksXG4gICAgICB5OiB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnggLSB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnosXG4gICAgICB6OiB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnkgLSB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnhcbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB2ZWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlVmVjdG9yO1xuIl19
