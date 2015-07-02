(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/geim/Game.js":[function(require,module,exports){
var createCharacter = require('./Character');
var createPlayer = require('./Player');
var createVector = require('./Vector');
var createPoint = require('./Point');

var player = createPlayer({
  position: createPoint({x: 0, y: 0, z: 0}),
  mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                       new THREE.MeshBasicMaterial({ wireframe: true }))
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

var container, camera, scene, renderer, line;

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

  var material = new THREE.LineBasicMaterial({
    color: 0x0000ff
  });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(0, 25, 0),
    new THREE.Vector3(0, 25, -50)
  );
  line = new THREE.Line( geometry, material );
  line.frustumCulled = false;
  scene.add( line );

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

  // TODO: add axis

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
  // position camera
  // Separate game logic to its own file
  var v = player.viewAngle.toVector().scale(150);
  var p = player.position.clone();
  var i = p.addVector(v);
  camera.position.z = i.z + 100;
  camera.position.x = i.x;
  camera.position.y = i.y + 50;
  camera.lookAt(player.mesh.position);

  // update nose
  // TODO: move to Player and update position indirectly
  var v = v.normalize().scale(500);
  v.y = 0;
  line.geometry.vertices[0].x = player.position.x;
  line.geometry.vertices[0].y = player.position.y;
  line.geometry.vertices[0].z = player.position.z;
  line.geometry.vertices[1].x = player.position.x - v.x;
  line.geometry.vertices[1].y = player.position.y - v.y;
  line.geometry.vertices[1].z = player.position.z - v.z;
  line.geometry.verticesNeedUpdate = true;

  // update characters
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

// move to MouseHandler
var mouseSensitivity = 0.02, lastX = 0, lastY = 0;
document.addEventListener('mousemove', function(event) {
  if(lastX > 0 && lastY > 0 && mouseDown) {
    var movedX = event.screenX - lastX;
    var movedY = event.screenY - lastY;

    // update player's view angle
    player.viewAngle.pitch += movedY * mouseSensitivity;
    player.viewAngle.yaw += movedX * mouseSensitivity;
    player.viewAngle.restrict();

    //console.log('angles', player.viewAngle.pitch * (180/Math.PI), player.viewAngle.yaw * (180/Math.PI));
  }
  lastX = event.screenX;
  lastY = event.screenY;
}, false);

var mouseDown = false;
document.addEventListener('mousedown', function(event) {
  mouseDown = true;
}, false);

document.addEventListener('mouseup', function(event) {
  mouseDown = false;
}, false);
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./Player":"/Users/jansaharju/Code/geim/js/geim/Player.js","./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Character.js":[function(require,module,exports){
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
    // move character by adding the movement vector to current position
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
},{"./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/EulerAngles.js":[function(require,module,exports){
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
      x: Math.cos(eulerAngles.yaw) * Math.cos(eulerAngles.pitch),
      y: Math.sin(eulerAngles.pitch),
      z: Math.sin(eulerAngles.yaw) * Math.cos(eulerAngles.pitch)
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

  return eulerAngles;
}

module.exports = createEulerAngles;
},{"./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js":[function(require,module,exports){
var movementSensitivity = 3;

var createKeyHandler = function(player) {

  document.addEventListener('keydown', function(event) {

    switch(event.keyCode) {
      case 87: // w
        player.movementDirection.z = -movementSensitivity;
        break;
      case 65: // a
        player.movementDirection.x = -movementSensitivity;
        break;
      case 83: // s
        player.movementDirection.z = movementSensitivity;
        break;
      case 68: // d
        player.movementDirection.x = movementSensitivity;
        break;
    }

  }, false);

  document.addEventListener('keyup', function(event) {
    switch(event.keyCode) {
      case 87: // w
        if(player.movementDirection.z === -movementSensitivity)
          player.movementDirection.z = 0;
        break;
      case 65: // a
        if(player.movementDirection.x === -movementSensitivity)
          player.movementDirection.x = 0;
        break;
      case 83: // s
        if(player.movementDirection.z === movementSensitivity)
          player.movementDirection.z = 0;
        break;
      case 68: // d
        if(player.movementDirection.x === movementSensitivity)
          player.movementDirection.x = 0;
        break;
    }

  }, false);

}

module.exports = createKeyHandler;
},{}],"/Users/jansaharju/Code/geim/js/geim/Player.js":[function(require,module,exports){
var createVector = require('./Vector');
var createCharacter = require('./Character');
var createEulerAngles = require('./EulerAngles');
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
    velocity: 1, // override
    points: 0,
    viewAngle: createEulerAngles()
  };
  player.points = spec && spec.points ? spec.points : defaults.points;
  player.viewAngle = spec && spec.points ? spec.viewAngle : defaults.viewAngle;
  player.velocity = spec && spec.velocity ? spec.velocity : defaults.velocity;
  playerKeyHandler(player);


  // METHODS
  var superUpdate = player.update;
  player.update = function(delta) {

    // move player according to:
    //   keyboard (movementDirection), and
    //   mouse (viewAngle)
    var forwardVector = player.viewAngle.toVector();
    forwardVector.y = 0;

    var upVector = createVector({ x: 0, y: 1, z: 0 });
    var rightVector = upVector.crossProductVector(forwardVector);

    // TODO: scale movement by dT

    var a = forwardVector.normalize().scale(player.movementDirection.z);
    var b = rightVector.normalize().scale(player.movementDirection.x);

    player.movement = a.addVector(b);

    // rotate player according to viewAngle
    player.mesh.rotation.y = -player.viewAngle.yaw;

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
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./EulerAngles":"/Users/jansaharju/Code/geim/js/geim/EulerAngles.js","./KeyHandler":"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Point.js":[function(require,module,exports){
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

  vector.normalize = function() {
    var magnitude = vector.magnitude();
    vector.x / magnitude;
    vector.y / magnitude;
    vector.z / magnitude;
    return vector;
  };

  vector.crossProductVector = function(otherVector) {
    return createVector({
      x: vector.y * otherVector.z - vector.z * otherVector.y,
      y: vector.z * otherVector.x - vector.x * otherVector.z,
      z: vector.x * otherVector.y - vector.y * otherVector.x
    });
  };

  vector.clone = function() {
    return createVector({
      x: vector.x,
      y: vector.y,
      z: vector.z
    });
  }

  return vector;
}

module.exports = createVector;

},{}]},{},["./js/geim/Game.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL2dlaW0vR2FtZS5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0V1bGVyQW5nbGVzLmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vS2V5SGFuZGxlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BsYXllci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BvaW50LmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vVmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjcmVhdGVDaGFyYWN0ZXIgPSByZXF1aXJlKCcuL0NoYXJhY3RlcicpO1xudmFyIGNyZWF0ZVBsYXllciA9IHJlcXVpcmUoJy4vUGxheWVyJyk7XG52YXIgY3JlYXRlVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcbnZhciBjcmVhdGVQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcblxudmFyIHBsYXllciA9IGNyZWF0ZVBsYXllcih7XG4gIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7eDogMCwgeTogMCwgejogMH0pLFxuICBtZXNoOiBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNTAsIDEwMCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyB3aXJlZnJhbWU6IHRydWUgfSkpXG59KTtcblxudmFyIHJhbWRvbVNlZWRTaXplID0gNDAwO1xudmFyIGNoYXJhY3RlcnMgPSBbXG4gIHBsYXllcixcbiAgY3JlYXRlQ2hhcmFjdGVyKHtcbiAgICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe1xuICAgICAgeDogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpLFxuICAgICAgejogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpXG4gICAgfSlcbiAgfSksXG4gIGNyZWF0ZUNoYXJhY3Rlcih7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KHtcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKSxcbiAgICAgIHo6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKVxuICAgIH0pXG4gIH0pLFxuICBjcmVhdGVDaGFyYWN0ZXIoe1xuICAgIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7XG4gICAgICB4OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSksXG4gICAgICB6OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSlcbiAgICB9KVxuICB9KVxuXTtcblxudmFyIGNvbnRhaW5lciwgY2FtZXJhLCBzY2VuZSwgcmVuZGVyZXIsIGxpbmU7XG5cbmluaXQoKTtcbmdhbWVMb29wKCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG5cbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDcwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxLCAxMDAwKTtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSA1MDtcblxuICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gIGNoYXJhY3RlcnMuZm9yRWFjaChmdW5jdGlvbihjaGFyKSB7XG4gICAgc2NlbmUuYWRkKGNoYXIubWVzaCk7XG4gIH0pO1xuXG4gIHZhciBtYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7XG4gICAgY29sb3I6IDB4MDAwMGZmXG4gIH0pO1xuXG4gIHZhciBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpO1xuICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKFxuICAgIG5ldyBUSFJFRS5WZWN0b3IzKDAsIDI1LCAwKSxcbiAgICBuZXcgVEhSRUUuVmVjdG9yMygwLCAyNSwgLTUwKVxuICApO1xuICBsaW5lID0gbmV3IFRIUkVFLkxpbmUoIGdlb21ldHJ5LCBtYXRlcmlhbCApO1xuICBsaW5lLmZydXN0dW1DdWxsZWQgPSBmYWxzZTtcbiAgc2NlbmUuYWRkKCBsaW5lICk7XG5cbiAgdmFyIGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMDMwMzAgfSApLFxuICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpLFxuICBmbG9vciA9IC01MCwgc3RlcCA9IDI1O1xuXG4gIGZvciAoIHZhciBpID0gMDsgaSA8PSA0MDsgaSArKyApIHtcblxuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAtIDUwMCwgZmxvb3IsIGkgKiBzdGVwIC0gNTAwICkgKTtcbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggICA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAtNTAwICkgKTtcbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAgNTAwICkgKTtcblxuICB9XG5cbiAgdmFyIGdyaWQgPSBuZXcgVEhSRUUuTGluZSggZ2VvbWV0cnksIGxpbmVNYXRlcmlhbCwgVEhSRUUuTGluZVBpZWNlcyApO1xuICBzY2VuZS5hZGQoZ3JpZCk7XG5cbiAgLy8gVE9ETzogYWRkIGF4aXNcblxuICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCk7XG4gIHJlbmRlcmVyLnNldFNpemUod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRhaW5lcicpO1xuICBjb250YWluZXIuYXBwZW5kQ2hpbGQocmVuZGVyZXIuZG9tRWxlbWVudCk7XG59XG5cbnZhciBzdGFydCwgZGVsdGEgPSAwO1xuZnVuY3Rpb24gZ2FtZUxvb3AoKSB7XG4gIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgdXBkYXRlKGRlbHRhKTtcbiAgZHJhdyhkZWx0YSk7XG4gIGRlbHRhID0gRGF0ZS5ub3coKSAtIHN0YXJ0O1xuICBpZihkZWx0YSA8IDEwKSBkZWx0YSA9IDEwO1xuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZ2FtZUxvb3ApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUoZGVsdGEpIHtcbiAgLy8gcG9zaXRpb24gY2FtZXJhXG4gIC8vIFNlcGFyYXRlIGdhbWUgbG9naWMgdG8gaXRzIG93biBmaWxlXG4gIHZhciB2ID0gcGxheWVyLnZpZXdBbmdsZS50b1ZlY3RvcigpLnNjYWxlKDE1MCk7XG4gIHZhciBwID0gcGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XG4gIHZhciBpID0gcC5hZGRWZWN0b3Iodik7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gaS56ICsgMTAwO1xuICBjYW1lcmEucG9zaXRpb24ueCA9IGkueDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSBpLnkgKyA1MDtcbiAgY2FtZXJhLmxvb2tBdChwbGF5ZXIubWVzaC5wb3NpdGlvbik7XG5cbiAgLy8gdXBkYXRlIG5vc2VcbiAgLy8gVE9ETzogbW92ZSB0byBQbGF5ZXIgYW5kIHVwZGF0ZSBwb3NpdGlvbiBpbmRpcmVjdGx5XG4gIHZhciB2ID0gdi5ub3JtYWxpemUoKS5zY2FsZSg1MDApO1xuICB2LnkgPSAwO1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzBdLnggPSBwbGF5ZXIucG9zaXRpb24ueDtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1swXS55ID0gcGxheWVyLnBvc2l0aW9uLnk7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMF0ueiA9IHBsYXllci5wb3NpdGlvbi56O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnggPSBwbGF5ZXIucG9zaXRpb24ueCAtIHYueDtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1sxXS55ID0gcGxheWVyLnBvc2l0aW9uLnkgLSB2Lnk7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMV0ueiA9IHBsYXllci5wb3NpdGlvbi56IC0gdi56O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cbiAgLy8gdXBkYXRlIGNoYXJhY3RlcnNcbiAgY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBjaGFyLnVwZGF0ZShkZWx0YSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3KGRlbHRhKSB7XG4gIC8vY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgLy8gIGNoYXIuZHJhdyhkZWx0YSwgcmVuZGVyZXIpO1xuICAvL30pO1xuXG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuLy8gbW92ZSB0byBNb3VzZUhhbmRsZXJcbnZhciBtb3VzZVNlbnNpdGl2aXR5ID0gMC4wMiwgbGFzdFggPSAwLCBsYXN0WSA9IDA7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICBpZihsYXN0WCA+IDAgJiYgbGFzdFkgPiAwICYmIG1vdXNlRG93bikge1xuICAgIHZhciBtb3ZlZFggPSBldmVudC5zY3JlZW5YIC0gbGFzdFg7XG4gICAgdmFyIG1vdmVkWSA9IGV2ZW50LnNjcmVlblkgLSBsYXN0WTtcblxuICAgIC8vIHVwZGF0ZSBwbGF5ZXIncyB2aWV3IGFuZ2xlXG4gICAgcGxheWVyLnZpZXdBbmdsZS5waXRjaCArPSBtb3ZlZFkgKiBtb3VzZVNlbnNpdGl2aXR5O1xuICAgIHBsYXllci52aWV3QW5nbGUueWF3ICs9IG1vdmVkWCAqIG1vdXNlU2Vuc2l0aXZpdHk7XG4gICAgcGxheWVyLnZpZXdBbmdsZS5yZXN0cmljdCgpO1xuXG4gICAgLy9jb25zb2xlLmxvZygnYW5nbGVzJywgcGxheWVyLnZpZXdBbmdsZS5waXRjaCAqICgxODAvTWF0aC5QSSksIHBsYXllci52aWV3QW5nbGUueWF3ICogKDE4MC9NYXRoLlBJKSk7XG4gIH1cbiAgbGFzdFggPSBldmVudC5zY3JlZW5YO1xuICBsYXN0WSA9IGV2ZW50LnNjcmVlblk7XG59LCBmYWxzZSk7XG5cbnZhciBtb3VzZURvd24gPSBmYWxzZTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIG1vdXNlRG93biA9IHRydWU7XG59LCBmYWxzZSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihldmVudCkge1xuICBtb3VzZURvd24gPSBmYWxzZTtcbn0sIGZhbHNlKTsiLCJ2YXIgY3JlYXRlUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG52YXIgY3JlYXRlVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcblxudmFyIGNyZWF0ZUNoYXJhY3RlciA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoKSxcbiAgICBtb3ZlbWVudERpcmVjdGlvbjogY3JlYXRlVmVjdG9yKCksXG4gICAgbW92ZW1lbnQ6IGNyZWF0ZVZlY3RvcigpLFxuICAgIG1lc2g6IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSg1MCwgMTAwLCA1MCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpKSxcbiAgICBoZWFsdGg6IDEwMCxcbiAgICB2aXNpYmxlOiB0cnVlLFxuICAgIHJvdGF0aW5nOiBmYWxzZSxcbiAgICB2ZWxvY2l0eTogMCAvLyB1bml0cy9tc1xuICB9O1xuICBzcGVjID0gc3BlYyB8fCBkZWZhdWx0cztcbiAgdmFyIGNoYXJhY3RlciA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIGNoYXJhY3Rlci5wb3NpdGlvbiA9IHNwZWMucG9zaXRpb24gfHwgZGVmYXVsdHMucG9zaXRpb247XG4gIGNoYXJhY3Rlci5tb3ZlbWVudERpcmVjdGlvbiA9IHNwZWMubW92ZW1lbnREaXJlY3Rpb24gfHwgZGVmYXVsdHMubW92ZW1lbnREaXJlY3Rpb247XG4gIGNoYXJhY3Rlci5tb3ZlbWVudCA9IHNwZWMubW92ZW1lbnQgfHwgZGVmYXVsdHMubW92ZW1lbnQ7XG4gIGNoYXJhY3Rlci5tZXNoID0gc3BlYy5tZXNoIHx8IGRlZmF1bHRzLm1lc2g7XG4gIGNoYXJhY3Rlci5oZWFsdGggPSBzcGVjLmhlYWx0aCB8fCBkZWZhdWx0cy5oZWFsdGg7XG4gIGNoYXJhY3Rlci52aXNpYmxlID0gc3BlYy52aXNpYmxlIHx8IGRlZmF1bHRzLnZpc2libGU7XG4gIGNoYXJhY3Rlci5yb3RhdGluZyA9IHNwZWMucm90YXRpbmcgfHwgZGVmYXVsdHMucm90YXRpbmc7XG4gIGNoYXJhY3Rlci52ZWxvY2l0eSA9IHNwZWMudmVsb2NpdHkgfHwgZGVmYXVsdHMudmVsb2NpdHk7XG5cblxuICAvLyBNRVRIT0RTXG4gIGNoYXJhY3Rlci51cGRhdGUgPSBmdW5jdGlvbihkZWx0YSkge1xuICAgIC8vIG1vdmUgY2hhcmFjdGVyIGJ5IGFkZGluZyB0aGUgbW92ZW1lbnQgdmVjdG9yIHRvIGN1cnJlbnQgcG9zaXRpb25cbiAgICBjaGFyYWN0ZXIucG9zaXRpb24uYWRkVmVjdG9yKGNoYXJhY3Rlci5tb3ZlbWVudC5zY2FsZShjaGFyYWN0ZXIudmVsb2NpdHkpKTtcblxuICAgIC8vIHVwZGF0ZSBtZXNoIHRvIG5ldyBwb3NpdGlvblxuICAgIHVwZGF0ZU1lc2hQb3NpdGlvbihjaGFyYWN0ZXIucG9zaXRpb24sIGNoYXJhY3Rlci5tZXNoKTtcbiAgfTtcblxuICBjaGFyYWN0ZXIuZHJhdyA9IGZ1bmN0aW9uKGRlbHRhLCByZW5kZXJlcikge1xuICAgIC8vIG1lc2ggZHJhd24gYXMgcGFydCBvZiBzY2VuZSBpbiBHYW1lLmpzXG4gIH07XG5cblxuICAvLyBIRUxQRVJTXG4gIGZ1bmN0aW9uIHVwZGF0ZU1lc2hQb3NpdGlvbihwb2ludCwgbWVzaCkge1xuICAgIG1lc2gucG9zaXRpb24ueCA9IHBvaW50Lng7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gcG9pbnQueTtcbiAgICBtZXNoLnBvc2l0aW9uLnogPSBwb2ludC56O1xuICB9XG5cblxuICByZXR1cm4gY2hhcmFjdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNoYXJhY3RlcjsiLCIvLyBUT0RPOiB0aGlzIGlzIG5vdCBuZWVkZWQgYXMgRXVsZXIgYW5nbGVzIGFyZSBjYWxjdWxhdGVkIGluIFRIUkVFXG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHBpdGNoOiAwLCB5YXc6IDAsIHJvbGw6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBldWxlckFuZ2xlcyA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIGV1bGVyQW5nbGVzLnBpdGNoID0gc3BlYy5waXRjaCB8fCBkZWZhdWx0cy5waXRjaDtcbiAgZXVsZXJBbmdsZXMueWF3ID0gc3BlYy55YXcgfHwgZGVmYXVsdHMueWF3O1xuICBldWxlckFuZ2xlcy5yb2xsID0gc3BlYy5yb2xsIHx8IGRlZmF1bHRzLnJvbGw7XG5cblxuICAvLyBNRVRIT0RTXG4gIGV1bGVyQW5nbGVzLnRvVmVjdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICB4OiBNYXRoLmNvcyhldWxlckFuZ2xlcy55YXcpICogTWF0aC5jb3MoZXVsZXJBbmdsZXMucGl0Y2gpLFxuICAgICAgeTogTWF0aC5zaW4oZXVsZXJBbmdsZXMucGl0Y2gpLFxuICAgICAgejogTWF0aC5zaW4oZXVsZXJBbmdsZXMueWF3KSAqIE1hdGguY29zKGV1bGVyQW5nbGVzLnBpdGNoKVxuICAgIH0pO1xuICB9O1xuXG4gIGV1bGVyQW5nbGVzLnJlc3RyaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoZXVsZXJBbmdsZXMucGl0Y2ggPiBNYXRoLlBJIC8gMi8qIC0gMC4xKi8pIHtcbiAgICAgIGV1bGVyQW5nbGVzLnBpdGNoID0gTWF0aC5QSSAvIDIvKiAtIDAuMSovO1xuICAgIH1cbiAgICBlbHNlIGlmKGV1bGVyQW5nbGVzLnBpdGNoIDwgLU1hdGguUEkgLyAyLyogKyAwLjEqLykge1xuICAgICAgZXVsZXJBbmdsZXMucGl0Y2ggPSAtTWF0aC5QSSAvIDIvKiArIDAuMSovO1xuICAgIH1cblxuICAgIHdoaWxlKGV1bGVyQW5nbGVzLnlhdyA8IC1NYXRoLlBJKSB7XG4gICAgICBldWxlckFuZ2xlcy55YXcgKz0gTWF0aC5QSSAqIDI7XG4gICAgfVxuICAgIHdoaWxlKGV1bGVyQW5nbGVzLnlhdyA+IE1hdGguUEkpIHtcbiAgICAgIGV1bGVyQW5nbGVzLnlhdyAtPSBNYXRoLlBJICogMjtcbiAgICB9XG4gICAgcmV0dXJuIGV1bGVyQW5nbGVzO1xuICB9O1xuXG4gIGV1bGVyQW5nbGVzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdwaXRjaCcsIGV1bGVyQW5nbGVzLnBpdGNoICogMTgwL01hdGguUEkpO1xuICAgIGNvbnNvbGUubG9nKCd5YXcnLCBldWxlckFuZ2xlcy55YXcgKiAxODAvTWF0aC5QSSk7XG4gICAgY29uc29sZS5sb2coJ3JvbGwnLCBldWxlckFuZ2xlcy5yb2xsICogMTgwL01hdGguUEkpO1xuICB9O1xuXG4gIHJldHVybiBldWxlckFuZ2xlcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFdWxlckFuZ2xlczsiLCJ2YXIgbW92ZW1lbnRTZW5zaXRpdml0eSA9IDM7XG5cbnZhciBjcmVhdGVLZXlIYW5kbGVyID0gZnVuY3Rpb24ocGxheWVyKSB7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSA4NzogLy8gd1xuICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IC1tb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjU6IC8vIGFcbiAgICAgICAgcGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnggPSAtbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDgzOiAvLyBzXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY4OiAvLyBkXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH0sIGZhbHNlKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgODc6IC8vIHdcbiAgICAgICAgaWYocGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnogPT09IC1tb3ZlbWVudFNlbnNpdGl2aXR5KVxuICAgICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY1OiAvLyBhXG4gICAgICAgIGlmKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID09PSAtbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4MzogLy8gc1xuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2ODogLy8gZFxuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9LCBmYWxzZSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVLZXlIYW5kbGVyOyIsInZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xudmFyIGNyZWF0ZUNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSByZXF1aXJlKCcuL0V1bGVyQW5nbGVzJyk7XG52YXIgcGxheWVyS2V5SGFuZGxlciA9IHJlcXVpcmUoJy4vS2V5SGFuZGxlcicpO1xuXG52YXIgc2luZ2xldG9uUGxheWVyO1xudmFyIGNyZWF0ZVBsYXllciA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZihzaW5nbGV0b25QbGF5ZXIpIHtcbiAgICByZXR1cm4gc2luZ2xldG9uUGxheWVyO1xuICB9XG5cblxuICAvLyBJTklUXG4gIHZhciBwbGF5ZXIgPSBjcmVhdGVDaGFyYWN0ZXIoc3BlYyk7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB2ZWxvY2l0eTogMSwgLy8gb3ZlcnJpZGVcbiAgICBwb2ludHM6IDAsXG4gICAgdmlld0FuZ2xlOiBjcmVhdGVFdWxlckFuZ2xlcygpXG4gIH07XG4gIHBsYXllci5wb2ludHMgPSBzcGVjICYmIHNwZWMucG9pbnRzID8gc3BlYy5wb2ludHMgOiBkZWZhdWx0cy5wb2ludHM7XG4gIHBsYXllci52aWV3QW5nbGUgPSBzcGVjICYmIHNwZWMucG9pbnRzID8gc3BlYy52aWV3QW5nbGUgOiBkZWZhdWx0cy52aWV3QW5nbGU7XG4gIHBsYXllci52ZWxvY2l0eSA9IHNwZWMgJiYgc3BlYy52ZWxvY2l0eSA/IHNwZWMudmVsb2NpdHkgOiBkZWZhdWx0cy52ZWxvY2l0eTtcbiAgcGxheWVyS2V5SGFuZGxlcihwbGF5ZXIpO1xuXG5cbiAgLy8gTUVUSE9EU1xuICB2YXIgc3VwZXJVcGRhdGUgPSBwbGF5ZXIudXBkYXRlO1xuICBwbGF5ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcblxuICAgIC8vIG1vdmUgcGxheWVyIGFjY29yZGluZyB0bzpcbiAgICAvLyAgIGtleWJvYXJkIChtb3ZlbWVudERpcmVjdGlvbiksIGFuZFxuICAgIC8vICAgbW91c2UgKHZpZXdBbmdsZSlcbiAgICB2YXIgZm9yd2FyZFZlY3RvciA9IHBsYXllci52aWV3QW5nbGUudG9WZWN0b3IoKTtcbiAgICBmb3J3YXJkVmVjdG9yLnkgPSAwO1xuXG4gICAgdmFyIHVwVmVjdG9yID0gY3JlYXRlVmVjdG9yKHsgeDogMCwgeTogMSwgejogMCB9KTtcbiAgICB2YXIgcmlnaHRWZWN0b3IgPSB1cFZlY3Rvci5jcm9zc1Byb2R1Y3RWZWN0b3IoZm9yd2FyZFZlY3Rvcik7XG5cbiAgICAvLyBUT0RPOiBzY2FsZSBtb3ZlbWVudCBieSBkVFxuXG4gICAgdmFyIGEgPSBmb3J3YXJkVmVjdG9yLm5vcm1hbGl6ZSgpLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56KTtcbiAgICB2YXIgYiA9IHJpZ2h0VmVjdG9yLm5vcm1hbGl6ZSgpLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54KTtcblxuICAgIHBsYXllci5tb3ZlbWVudCA9IGEuYWRkVmVjdG9yKGIpO1xuXG4gICAgLy8gcm90YXRlIHBsYXllciBhY2NvcmRpbmcgdG8gdmlld0FuZ2xlXG4gICAgcGxheWVyLm1lc2gucm90YXRpb24ueSA9IC1wbGF5ZXIudmlld0FuZ2xlLnlhdztcblxuICAgIHN1cGVyVXBkYXRlKGRlbHRhKTtcbiAgfTtcblxuICB2YXIgc3VwZXJEcmF3ID0gcGxheWVyLmRyYXc7XG4gIHBsYXllci5kcmF3ID0gZnVuY3Rpb24oZGVsdGEsIHJlbmRlcmVyKSB7XG4gICAgc3VwZXJEcmF3KGRlbHRhLCByZW5kZXJlcik7XG4gICAgLy8gbWVzaCBkcmF3biBhcyBwYXJ0IG9mIHNjZW5lIGluIEdhbWUuanNcbiAgfTtcblxuXG4gIHJldHVybiBzaW5nbGV0b25QbGF5ZXIgPSBwbGF5ZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUGxheWVyOyIsIi8vIFRPRE86IGNvbnNpZGVyIHVzaW5nIFRIUkVFLlZlY3RvcjMgYXQgc29tZSBwb2ludFxuXG52YXIgY3JlYXRlVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcblxudmFyIGNyZWF0ZVBvaW50ID0gZnVuY3Rpb24oc3BlYykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gSU5JVFxuICB2YXIgZGVmYXVsdHMgPSAgeyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gIHNwZWMgPSBzcGVjIHx8IGRlZmF1bHRzO1xuICB2YXIgcG9pbnQgPSB7fTtcblxuXG4gIC8vIEZJRUxEU1xuICBwb2ludC54ID0gc3BlYy54IHx8IGRlZmF1bHRzLng7XG4gIHBvaW50LnkgPSBzcGVjLnkgfHwgZGVmYXVsdHMueTtcbiAgcG9pbnQueiA9IHNwZWMueiB8fCBkZWZhdWx0cy56O1xuXG5cbiAgLy8gTUVUSE9EU1xuICBwb2ludC5hZGRWZWN0b3IgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICBwb2ludC54ICs9IHZlY3Rvci54O1xuICAgIHBvaW50LnkgKz0gdmVjdG9yLnk7XG4gICAgcG9pbnQueiArPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH07XG5cbiAgcG9pbnQuc3Vic3RyYWN0VmVjdG9yID0gZnVuY3Rpb24odmVjdG9yKSB7XG4gICAgcG9pbnQueCAtPSB2ZWN0b3IueDtcbiAgICBwb2ludC55IC09IHZlY3Rvci55O1xuICAgIHBvaW50LnogLT0gdmVjdG9yLno7XG4gICAgcmV0dXJuIHBvaW50O1xuICB9O1xuXG4gIHBvaW50LmNyZWF0ZVZlY3RvclRvUG9pbnQgPSBmdW5jdGlvbihmcm9tUG9pbnQpIHtcbiAgICByZXR1cm4gY3JlYXRlVmVjdG9yKHtcbiAgICAgIHg6IHBvaW50LnggLT0gZnJvbVBvaW50LngsXG4gICAgICB5OiBwb2ludC55IC09IGZyb21Qb2ludC55LFxuICAgICAgejogcG9pbnQueiAtPSBmcm9tUG9pbnQuelxuICAgIH0pO1xuICB9O1xuXG4gIHBvaW50LmNyZWF0ZVZlY3RvckZyb21Qb2ludCA9IGZ1bmN0aW9uKHRvUG9pbnQpIHtcbiAgICByZXR1cm4gY3JlYXRlVmVjdG9yKHtcbiAgICAgIHg6IHRvUG9pbnQueCAtPSBwb2ludC54LFxuICAgICAgeTogdG9Qb2ludC55IC09IHBvaW50LnksXG4gICAgICB6OiB0b1BvaW50LnogLT0gcG9pbnQuelxuICAgIH0pO1xuICB9O1xuXG4gIHBvaW50LmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVBvaW50KHtcbiAgICAgIHg6IHBvaW50LngsXG4gICAgICB5OiBwb2ludC55LFxuICAgICAgejogcG9pbnQuelxuICAgIH0pO1xuICB9O1xuXG4gIHBvaW50LmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCd4JywgcG9pbnQueCk7XG4gICAgY29uc29sZS5sb2coJ3knLCBwb2ludC55KTtcbiAgICBjb25zb2xlLmxvZygneicsIHBvaW50LnopO1xuICB9O1xuXG5cbiAgcmV0dXJuIHBvaW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVBvaW50OyIsIi8vIFRPRE86IHRyYW5zaXRpb24gdG8gVEhSRUUuVmVjdG9yMyBhdCBzb21lIHBvaW50XG5cbnZhciBjcmVhdGVWZWN0b3IgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9IHsgeDogMCwgeTogMCwgejogMCB9O1xuICBzcGVjID0gc3BlYyB8fCBkZWZhdWx0cztcbiAgdmFyIHZlY3RvciA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIHZlY3Rvci54ID0gc3BlYy54IHx8IGRlZmF1bHRzLng7XG4gIHZlY3Rvci55ID0gc3BlYy55IHx8IGRlZmF1bHRzLnk7XG4gIHZlY3Rvci56ID0gc3BlYy56IHx8IGRlZmF1bHRzLno7XG5cblxuICAvLyBNRVRIT0RTXG4gIHZlY3Rvci5tYWduaXR1ZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCkpO1xuICB9O1xuXG4gIHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHZlY3Rvci54ICogdmVjdG9yLnggK1xuICAgICAgICAgICB2ZWN0b3IueSAqIHZlY3Rvci55ICtcbiAgICAgICAgICAgdmVjdG9yLnogKiB2ZWN0b3IuejtcbiAgfTtcblxuICB2ZWN0b3IuYWRkVmVjdG9yID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICB2ZWN0b3IueCArPSBvdGhlclZlY3Rvci54LFxuICAgIHZlY3Rvci55ICs9IG90aGVyVmVjdG9yLnksXG4gICAgdmVjdG9yLnogKz0gb3RoZXJWZWN0b3IuelxuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnN1YnN0cmFjdFZlY3RvciA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgdmVjdG9yLnggLT0gb3RoZXJWZWN0b3IueCxcbiAgICB2ZWN0b3IueSAtPSBvdGhlclZlY3Rvci55LFxuICAgIHZlY3Rvci56IC09IG90aGVyVmVjdG9yLnpcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9O1xuXG4gIHZlY3Rvci5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxhcikge1xuICAgIHZlY3Rvci54ICo9IHNjYWxhcjtcbiAgICB2ZWN0b3IueSAqPSBzY2FsYXI7XG4gICAgdmVjdG9yLnogKj0gc2NhbGFyO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnJldmVyc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2ZWN0b3IueCAqPSAtMTtcbiAgICB2ZWN0b3IueSAqPSAtMTtcbiAgICB2ZWN0b3IueiAqPSAtMTtcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9XG5cbiAgdmVjdG9yLmRvdFByb2R1Y3QgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHJldHVybiB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnggK1xuICAgICAgICAgICAgdmVjdG9yLnkgKiBvdGhlclZlY3Rvci55ICtcbiAgICAgICAgICAgIHZlY3Rvci56ICogb3RoZXJWZWN0b3IuejtcbiAgfTtcblxuICB2ZWN0b3IubG9uZ2VyVGhhbiA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCkgPiBvdGhlclZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCk7XG4gIH07XG5cbiAgdmVjdG9yLnplcm8gPSBmdW5jdGlvbigpIHtcbiAgICB2ZWN0b3IueCA9IDA7XG4gICAgdmVjdG9yLnkgPSAwO1xuICAgIHZlY3Rvci56ID0gMDtcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9XG5cbiAgdmVjdG9yLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCd4JywgdmVjdG9yLngpO1xuICAgIGNvbnNvbGUubG9nKCd5JywgdmVjdG9yLnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgdmVjdG9yLnopO1xuICB9O1xuXG4gIHZlY3Rvci5ub3JtYWxpemUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFnbml0dWRlID0gdmVjdG9yLm1hZ25pdHVkZSgpO1xuICAgIHZlY3Rvci54IC8gbWFnbml0dWRlO1xuICAgIHZlY3Rvci55IC8gbWFnbml0dWRlO1xuICAgIHZlY3Rvci56IC8gbWFnbml0dWRlO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLmNyb3NzUHJvZHVjdFZlY3RvciA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICB4OiB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnogLSB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnksXG4gICAgICB5OiB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnggLSB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnosXG4gICAgICB6OiB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnkgLSB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnhcbiAgICB9KTtcbiAgfTtcblxuICB2ZWN0b3IuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlVmVjdG9yKHtcbiAgICAgIHg6IHZlY3Rvci54LFxuICAgICAgeTogdmVjdG9yLnksXG4gICAgICB6OiB2ZWN0b3IuelxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHZlY3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVWZWN0b3I7XG4iXX0=
