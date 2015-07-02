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
  var v = player.viewAngle.toVector().scale(150);
  var p = player.position.clone();
  var i = p.addVector(v);
  camera.position.z = i.z + 100;
  camera.position.x = i.x;
  camera.position.y = i.y + 50;
  camera.lookAt(player.mesh.position);

  // update nose
  player.viewAngle.log();
  var v = v.createNormalized().scale(100);
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


var mouseSensitivity = 0.01, lastX = 0, lastY = 0;
document.addEventListener('mousemove', function(event) {
  if(lastX > 0 && lastY > 0 && mouseDown) {
    var movedX = event.screenX - lastX;
    var movedY = event.screenY - lastY;

    // update player's view angle
    player.viewAngle.pitch += movedY * mouseSensitivity;
    player.viewAngle.yaw += movedX * mouseSensitivity;
    player.viewAngle.normalize();

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

  eulerAngles.normalize = function() {
    if(eulerAngles.pitch > Math.PI / 2 - 0.1) {
      eulerAngles.pitch = Math.PI / 2 - 0.1;
    }
    else if(eulerAngles.pitch < -Math.PI / 2 + 0.1) {
      eulerAngles.pitch = -Math.PI / 2 + 0.1;
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
    var forwardVector = player.viewAngle.toVector();
    forwardVector.y = 0;
    var upVector = createVector({ x: 0, y: 1, z: 0 });
    var rightVector = upVector.createCrossProduct(forwardVector);

    var a = forwardVector.scale(player.movementDirection.x);
    var b = rightVector.scale(player.movementDirection.z);

    //player.movement = a.addVector(b);
    //var temp = forwardVector.scale(player.movementDirection.x).dotProduct(rightVector.scale(player.movementDirection.z));
    //console.log(temp);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL2dlaW0vR2FtZS5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0V1bGVyQW5nbGVzLmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vS2V5SGFuZGxlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BsYXllci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BvaW50LmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vVmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3JlYXRlQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXInKTtcbnZhciBjcmVhdGVQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xudmFyIGNyZWF0ZVZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG52YXIgY3JlYXRlUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG5cbnZhciBwbGF5ZXIgPSBjcmVhdGVQbGF5ZXIoe1xuICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe3g6IDAsIHk6IDAsIHo6IDB9KSxcbiAgbWVzaDogbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KDUwLCAxMDAsIDUwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgd2lyZWZyYW1lOiB0cnVlIH0pKVxufSk7XG5cbnZhciByYW1kb21TZWVkU2l6ZSA9IDQwMDtcbnZhciBjaGFyYWN0ZXJzID0gW1xuICBwbGF5ZXIsXG4gIGNyZWF0ZUNoYXJhY3Rlcih7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KHtcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKSxcbiAgICAgIHo6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKVxuICAgIH0pXG4gIH0pLFxuICBjcmVhdGVDaGFyYWN0ZXIoe1xuICAgIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7XG4gICAgICB4OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSksXG4gICAgICB6OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSlcbiAgICB9KVxuICB9KSxcbiAgY3JlYXRlQ2hhcmFjdGVyKHtcbiAgICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe1xuICAgICAgeDogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpLFxuICAgICAgejogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpXG4gICAgfSlcbiAgfSlcbl07XG5cbnZhciBjb250YWluZXIsIGNhbWVyYSwgc2NlbmUsIHJlbmRlcmVyLCBsaW5lO1xuXG5pbml0KCk7XG5nYW1lTG9vcCgpO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuXG4gIGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3MCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgMSwgMTAwMCk7XG4gIGNhbWVyYS5wb3NpdGlvbi55ID0gNTA7XG5cbiAgc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcblxuICBjaGFyYWN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcikge1xuICAgIHNjZW5lLmFkZChjaGFyLm1lc2gpO1xuICB9KTtcblxuICB2YXIgbWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoe1xuICAgIGNvbG9yOiAweDAwMDBmZlxuICB9KTtcblxuICB2YXIgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTtcbiAgZ2VvbWV0cnkudmVydGljZXMucHVzaChcbiAgICBuZXcgVEhSRUUuVmVjdG9yMygwLCAyNSwgMCksXG4gICAgbmV3IFRIUkVFLlZlY3RvcjMoMCwgMjUsIC01MClcbiAgKTtcbiAgbGluZSA9IG5ldyBUSFJFRS5MaW5lKCBnZW9tZXRyeSwgbWF0ZXJpYWwgKTtcbiAgbGluZS5mcnVzdHVtQ3VsbGVkID0gZmFsc2U7XG4gIHNjZW5lLmFkZCggbGluZSApO1xuXG4gIHZhciBsaW5lTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTGluZUJhc2ljTWF0ZXJpYWwoIHsgY29sb3I6IDB4MzAzMDMwIH0gKSxcbiAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKSxcbiAgZmxvb3IgPSAtNTAsIHN0ZXAgPSAyNTtcblxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPD0gNDA7IGkgKysgKSB7XG5cbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggLSA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoICAgNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuXG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgLTUwMCApICk7XG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIGkgKiBzdGVwIC0gNTAwLCBmbG9vciwgIDUwMCApICk7XG5cbiAgfVxuXG4gIHZhciBncmlkID0gbmV3IFRIUkVFLkxpbmUoIGdlb21ldHJ5LCBsaW5lTWF0ZXJpYWwsIFRIUkVFLkxpbmVQaWVjZXMgKTtcbiAgc2NlbmUuYWRkKGdyaWQpO1xuXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cblxudmFyIHN0YXJ0LCBkZWx0YSA9IDA7XG5mdW5jdGlvbiBnYW1lTG9vcCgpIHtcbiAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICB1cGRhdGUoZGVsdGEpO1xuICBkcmF3KGRlbHRhKTtcbiAgZGVsdGEgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gIGlmKGRlbHRhIDwgMTApIGRlbHRhID0gMTA7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZShkZWx0YSkge1xuICAvLyBwb3NpdGlvbiBjYW1lcmFcbiAgdmFyIHYgPSBwbGF5ZXIudmlld0FuZ2xlLnRvVmVjdG9yKCkuc2NhbGUoMTUwKTtcbiAgdmFyIHAgPSBwbGF5ZXIucG9zaXRpb24uY2xvbmUoKTtcbiAgdmFyIGkgPSBwLmFkZFZlY3Rvcih2KTtcbiAgY2FtZXJhLnBvc2l0aW9uLnogPSBpLnogKyAxMDA7XG4gIGNhbWVyYS5wb3NpdGlvbi54ID0gaS54O1xuICBjYW1lcmEucG9zaXRpb24ueSA9IGkueSArIDUwO1xuICBjYW1lcmEubG9va0F0KHBsYXllci5tZXNoLnBvc2l0aW9uKTtcblxuICAvLyB1cGRhdGUgbm9zZVxuICBwbGF5ZXIudmlld0FuZ2xlLmxvZygpO1xuICB2YXIgdiA9IHYuY3JlYXRlTm9ybWFsaXplZCgpLnNjYWxlKDEwMCk7XG4gIHYueSA9IDA7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMF0ueCA9IHBsYXllci5wb3NpdGlvbi54O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzBdLnkgPSBwbGF5ZXIucG9zaXRpb24ueTtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1swXS56ID0gcGxheWVyLnBvc2l0aW9uLno7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMV0ueCA9IHBsYXllci5wb3NpdGlvbi54IC0gdi54O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnkgPSBwbGF5ZXIucG9zaXRpb24ueSAtIHYueTtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1sxXS56ID0gcGxheWVyLnBvc2l0aW9uLnogLSB2Lno7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNOZWVkVXBkYXRlID0gdHJ1ZTtcblxuICAvLyB1cGRhdGUgY2hhcmFjdGVyc1xuICBjaGFyYWN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcikge1xuICAgIGNoYXIudXBkYXRlKGRlbHRhKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGRyYXcoZGVsdGEpIHtcbiAgLy9jaGFyYWN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcikge1xuICAvLyAgY2hhci5kcmF3KGRlbHRhLCByZW5kZXJlcik7XG4gIC8vfSk7XG5cbiAgcmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xufVxuXG5cbnZhciBtb3VzZVNlbnNpdGl2aXR5ID0gMC4wMSwgbGFzdFggPSAwLCBsYXN0WSA9IDA7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihldmVudCkge1xuICBpZihsYXN0WCA+IDAgJiYgbGFzdFkgPiAwICYmIG1vdXNlRG93bikge1xuICAgIHZhciBtb3ZlZFggPSBldmVudC5zY3JlZW5YIC0gbGFzdFg7XG4gICAgdmFyIG1vdmVkWSA9IGV2ZW50LnNjcmVlblkgLSBsYXN0WTtcblxuICAgIC8vIHVwZGF0ZSBwbGF5ZXIncyB2aWV3IGFuZ2xlXG4gICAgcGxheWVyLnZpZXdBbmdsZS5waXRjaCArPSBtb3ZlZFkgKiBtb3VzZVNlbnNpdGl2aXR5O1xuICAgIHBsYXllci52aWV3QW5nbGUueWF3ICs9IG1vdmVkWCAqIG1vdXNlU2Vuc2l0aXZpdHk7XG4gICAgcGxheWVyLnZpZXdBbmdsZS5ub3JtYWxpemUoKTtcblxuICAgIC8vY29uc29sZS5sb2coJ2FuZ2xlcycsIHBsYXllci52aWV3QW5nbGUucGl0Y2ggKiAoMTgwL01hdGguUEkpLCBwbGF5ZXIudmlld0FuZ2xlLnlhdyAqICgxODAvTWF0aC5QSSkpO1xuICB9XG4gIGxhc3RYID0gZXZlbnQuc2NyZWVuWDtcbiAgbGFzdFkgPSBldmVudC5zY3JlZW5ZO1xufSwgZmFsc2UpO1xuXG52YXIgbW91c2VEb3duID0gZmFsc2U7XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihldmVudCkge1xuICBtb3VzZURvd24gPSB0cnVlO1xufSwgZmFsc2UpO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgbW91c2VEb3duID0gZmFsc2U7XG59LCBmYWxzZSk7IiwidmFyIGNyZWF0ZVBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludCcpO1xudmFyIGNyZWF0ZVZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG5cbnZhciBjcmVhdGVDaGFyYWN0ZXIgPSBmdW5jdGlvbiAoc3BlYykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gSU5JVFxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KCksXG4gICAgbW92ZW1lbnREaXJlY3Rpb246IGNyZWF0ZVZlY3RvcigpLFxuICAgIG1vdmVtZW50OiBjcmVhdGVWZWN0b3IoKSxcbiAgICBtZXNoOiBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNTAsIDEwMCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoTm9ybWFsTWF0ZXJpYWwoKSksXG4gICAgaGVhbHRoOiAxMDAsXG4gICAgdmlzaWJsZTogdHJ1ZSxcbiAgICByb3RhdGluZzogZmFsc2UsXG4gICAgdmVsb2NpdHk6IDAgLy8gdW5pdHMvbXNcbiAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBjaGFyYWN0ZXIgPSB7fTtcblxuXG4gIC8vIEZJRUxEU1xuICBjaGFyYWN0ZXIucG9zaXRpb24gPSBzcGVjLnBvc2l0aW9uIHx8IGRlZmF1bHRzLnBvc2l0aW9uO1xuICBjaGFyYWN0ZXIubW92ZW1lbnREaXJlY3Rpb24gPSBzcGVjLm1vdmVtZW50RGlyZWN0aW9uIHx8IGRlZmF1bHRzLm1vdmVtZW50RGlyZWN0aW9uO1xuICBjaGFyYWN0ZXIubW92ZW1lbnQgPSBzcGVjLm1vdmVtZW50IHx8IGRlZmF1bHRzLm1vdmVtZW50O1xuICBjaGFyYWN0ZXIubWVzaCA9IHNwZWMubWVzaCB8fCBkZWZhdWx0cy5tZXNoO1xuICBjaGFyYWN0ZXIuaGVhbHRoID0gc3BlYy5oZWFsdGggfHwgZGVmYXVsdHMuaGVhbHRoO1xuICBjaGFyYWN0ZXIudmlzaWJsZSA9IHNwZWMudmlzaWJsZSB8fCBkZWZhdWx0cy52aXNpYmxlO1xuICBjaGFyYWN0ZXIucm90YXRpbmcgPSBzcGVjLnJvdGF0aW5nIHx8IGRlZmF1bHRzLnJvdGF0aW5nO1xuICBjaGFyYWN0ZXIudmVsb2NpdHkgPSBzcGVjLnZlbG9jaXR5IHx8IGRlZmF1bHRzLnZlbG9jaXR5O1xuXG5cbiAgLy8gTUVUSE9EU1xuICBjaGFyYWN0ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICAvLyBtb3ZlIGNoYXJhY3RlciBieSBhZGRpbmcgdG8gY3VycmVudCBwb3NpdGlvblxuICAgIGNoYXJhY3Rlci5tb3ZlbWVudCA9IGNoYXJhY3Rlci5tb3ZlbWVudERpcmVjdGlvbjtcbiAgICBjaGFyYWN0ZXIucG9zaXRpb24uYWRkVmVjdG9yKGNoYXJhY3Rlci5tb3ZlbWVudC5zY2FsZShjaGFyYWN0ZXIudmVsb2NpdHkpKTtcblxuICAgIC8vIHVwZGF0ZSBtZXNoIHRvIG5ldyBwb3NpdGlvblxuICAgIHVwZGF0ZU1lc2hQb3NpdGlvbihjaGFyYWN0ZXIucG9zaXRpb24sIGNoYXJhY3Rlci5tZXNoKTtcbiAgfTtcblxuICBjaGFyYWN0ZXIuZHJhdyA9IGZ1bmN0aW9uKGRlbHRhLCByZW5kZXJlcikge1xuICAgIC8vIG1lc2ggZHJhd24gYXMgcGFydCBvZiBzY2VuZSBpbiBHYW1lLmpzXG4gIH07XG5cblxuICAvLyBIRUxQRVJTXG4gIGZ1bmN0aW9uIHVwZGF0ZU1lc2hQb3NpdGlvbihwb2ludCwgbWVzaCkge1xuICAgIG1lc2gucG9zaXRpb24ueCA9IHBvaW50Lng7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gcG9pbnQueTtcbiAgICBtZXNoLnBvc2l0aW9uLnogPSBwb2ludC56O1xuICB9XG5cblxuICByZXR1cm4gY2hhcmFjdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNoYXJhY3RlcjsiLCIvLyBUT0RPOiB0aGlzIGlzIG5vdCBuZWVkZWQgYXMgRXVsZXIgYW5nbGVzIGFyZSBjYWxjdWxhdGVkIGluIFRIUkVFXG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHBpdGNoOiAwLCB5YXc6IDAsIHJvbGw6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBldWxlckFuZ2xlcyA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIGV1bGVyQW5nbGVzLnBpdGNoID0gc3BlYy5waXRjaCB8fCBkZWZhdWx0cy5waXRjaDtcbiAgZXVsZXJBbmdsZXMueWF3ID0gc3BlYy55YXcgfHwgZGVmYXVsdHMueWF3O1xuICBldWxlckFuZ2xlcy5yb2xsID0gc3BlYy5yb2xsIHx8IGRlZmF1bHRzLnJvbGw7XG5cblxuICAvLyBNRVRIT0RTXG4gIGV1bGVyQW5nbGVzLnRvVmVjdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICB4OiBNYXRoLmNvcyhldWxlckFuZ2xlcy55YXcpICogTWF0aC5jb3MoZXVsZXJBbmdsZXMucGl0Y2gpLFxuICAgICAgeTogTWF0aC5zaW4oZXVsZXJBbmdsZXMucGl0Y2gpLFxuICAgICAgejogTWF0aC5zaW4oZXVsZXJBbmdsZXMueWF3KSAqIE1hdGguY29zKGV1bGVyQW5nbGVzLnBpdGNoKVxuICAgIH0pO1xuICB9O1xuXG4gIGV1bGVyQW5nbGVzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKGV1bGVyQW5nbGVzLnBpdGNoID4gTWF0aC5QSSAvIDIgLSAwLjEpIHtcbiAgICAgIGV1bGVyQW5nbGVzLnBpdGNoID0gTWF0aC5QSSAvIDIgLSAwLjE7XG4gICAgfVxuICAgIGVsc2UgaWYoZXVsZXJBbmdsZXMucGl0Y2ggPCAtTWF0aC5QSSAvIDIgKyAwLjEpIHtcbiAgICAgIGV1bGVyQW5nbGVzLnBpdGNoID0gLU1hdGguUEkgLyAyICsgMC4xO1xuICAgIH1cblxuICAgIHdoaWxlKGV1bGVyQW5nbGVzLnlhdyA8IC1NYXRoLlBJKSB7XG4gICAgICBldWxlckFuZ2xlcy55YXcgKz0gTWF0aC5QSSAqIDI7XG4gICAgfVxuICAgIHdoaWxlKGV1bGVyQW5nbGVzLnlhdyA+IE1hdGguUEkpIHtcbiAgICAgIGV1bGVyQW5nbGVzLnlhdyAtPSBNYXRoLlBJICogMjtcbiAgICB9XG4gICAgcmV0dXJuIGV1bGVyQW5nbGVzO1xuICB9O1xuXG4gIGV1bGVyQW5nbGVzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdwaXRjaCcsIGV1bGVyQW5nbGVzLnBpdGNoICogMTgwL01hdGguUEkpO1xuICAgIGNvbnNvbGUubG9nKCd5YXcnLCBldWxlckFuZ2xlcy55YXcgKiAxODAvTWF0aC5QSSk7XG4gICAgY29uc29sZS5sb2coJ3JvbGwnLCBldWxlckFuZ2xlcy5yb2xsICogMTgwL01hdGguUEkpO1xuICB9O1xuXG4gIHJldHVybiBldWxlckFuZ2xlcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVFdWxlckFuZ2xlczsiLCJ2YXIgbW92ZW1lbnRTZW5zaXRpdml0eSA9IDM7XG5cbnZhciBjcmVhdGVLZXlIYW5kbGVyID0gZnVuY3Rpb24ocGxheWVyKSB7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSA4NzogLy8gd1xuICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IC1tb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjU6IC8vIGFcbiAgICAgICAgcGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnggPSAtbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDgzOiAvLyBzXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY4OiAvLyBkXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH0sIGZhbHNlKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgODc6IC8vIHdcbiAgICAgICAgaWYocGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnogPT09IC1tb3ZlbWVudFNlbnNpdGl2aXR5KVxuICAgICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY1OiAvLyBhXG4gICAgICAgIGlmKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID09PSAtbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4MzogLy8gc1xuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2ODogLy8gZFxuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9LCBmYWxzZSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVLZXlIYW5kbGVyOyIsInZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xudmFyIGNyZWF0ZUNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSByZXF1aXJlKCcuL0V1bGVyQW5nbGVzJyk7XG52YXIgcGxheWVyS2V5SGFuZGxlciA9IHJlcXVpcmUoJy4vS2V5SGFuZGxlcicpO1xuXG52YXIgc2luZ2xldG9uUGxheWVyO1xudmFyIGNyZWF0ZVBsYXllciA9IGZ1bmN0aW9uIChzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZihzaW5nbGV0b25QbGF5ZXIpIHtcbiAgICByZXR1cm4gc2luZ2xldG9uUGxheWVyO1xuICB9XG5cblxuICAvLyBJTklUXG4gIHZhciBwbGF5ZXIgPSBjcmVhdGVDaGFyYWN0ZXIoc3BlYyk7XG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICB2ZWxvY2l0eTogMSwgLy8gb3ZlcnJpZGVcbiAgICBwb2ludHM6IDAsXG4gICAgdmlld0FuZ2xlOiBjcmVhdGVFdWxlckFuZ2xlcygpXG4gIH07XG4gIHBsYXllci5wb2ludHMgPSBzcGVjICYmIHNwZWMucG9pbnRzID8gc3BlYy5wb2ludHMgOiBkZWZhdWx0cy5wb2ludHM7XG4gIHBsYXllci52aWV3QW5nbGUgPSBzcGVjICYmIHNwZWMucG9pbnRzID8gc3BlYy52aWV3QW5nbGUgOiBkZWZhdWx0cy52aWV3QW5nbGU7XG4gIHBsYXllci52ZWxvY2l0eSA9IHNwZWMgJiYgc3BlYy52ZWxvY2l0eSA/IHNwZWMudmVsb2NpdHkgOiBkZWZhdWx0cy52ZWxvY2l0eTtcbiAgcGxheWVyS2V5SGFuZGxlcihwbGF5ZXIpO1xuXG5cbiAgLy8gTUVUSE9EU1xuICB2YXIgc3VwZXJVcGRhdGUgPSBwbGF5ZXIudXBkYXRlO1xuICBwbGF5ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICB2YXIgZm9yd2FyZFZlY3RvciA9IHBsYXllci52aWV3QW5nbGUudG9WZWN0b3IoKTtcbiAgICBmb3J3YXJkVmVjdG9yLnkgPSAwO1xuICAgIHZhciB1cFZlY3RvciA9IGNyZWF0ZVZlY3Rvcih7IHg6IDAsIHk6IDEsIHo6IDAgfSk7XG4gICAgdmFyIHJpZ2h0VmVjdG9yID0gdXBWZWN0b3IuY3JlYXRlQ3Jvc3NQcm9kdWN0KGZvcndhcmRWZWN0b3IpO1xuXG4gICAgdmFyIGEgPSBmb3J3YXJkVmVjdG9yLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54KTtcbiAgICB2YXIgYiA9IHJpZ2h0VmVjdG9yLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56KTtcblxuICAgIC8vcGxheWVyLm1vdmVtZW50ID0gYS5hZGRWZWN0b3IoYik7XG4gICAgLy92YXIgdGVtcCA9IGZvcndhcmRWZWN0b3Iuc2NhbGUocGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLngpLmRvdFByb2R1Y3QocmlnaHRWZWN0b3Iuc2NhbGUocGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnopKTtcbiAgICAvL2NvbnNvbGUubG9nKHRlbXApO1xuXG4gICAgc3VwZXJVcGRhdGUoZGVsdGEpO1xuICB9O1xuXG4gIHZhciBzdXBlckRyYXcgPSBwbGF5ZXIuZHJhdztcbiAgcGxheWVyLmRyYXcgPSBmdW5jdGlvbihkZWx0YSwgcmVuZGVyZXIpIHtcbiAgICBzdXBlckRyYXcoZGVsdGEsIHJlbmRlcmVyKTtcbiAgICAvLyBtZXNoIGRyYXduIGFzIHBhcnQgb2Ygc2NlbmUgaW4gR2FtZS5qc1xuICB9O1xuXG5cbiAgcmV0dXJuIHNpbmdsZXRvblBsYXllciA9IHBsYXllcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVQbGF5ZXI7IiwiLy8gVE9ETzogY29uc2lkZXIgdXNpbmcgVEhSRUUuVmVjdG9yMyBhdCBzb21lIHBvaW50XG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlUG9pbnQgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBwb2ludCA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIHBvaW50LnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgcG9pbnQueSA9IHNwZWMueSB8fCBkZWZhdWx0cy55O1xuICBwb2ludC56ID0gc3BlYy56IHx8IGRlZmF1bHRzLno7XG5cblxuICAvLyBNRVRIT0RTXG4gIHBvaW50LmFkZFZlY3RvciA9IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgIHBvaW50LnggKz0gdmVjdG9yLng7XG4gICAgcG9pbnQueSArPSB2ZWN0b3IueTtcbiAgICBwb2ludC56ICs9IHZlY3Rvci56O1xuICAgIHJldHVybiBwb2ludDtcbiAgfTtcblxuICBwb2ludC5zdWJzdHJhY3RWZWN0b3IgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICBwb2ludC54IC09IHZlY3Rvci54O1xuICAgIHBvaW50LnkgLT0gdmVjdG9yLnk7XG4gICAgcG9pbnQueiAtPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yVG9Qb2ludCA9IGZ1bmN0aW9uKGZyb21Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogcG9pbnQueCAtPSBmcm9tUG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnkgLT0gZnJvbVBvaW50LnksXG4gICAgICB6OiBwb2ludC56IC09IGZyb21Qb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yRnJvbVBvaW50ID0gZnVuY3Rpb24odG9Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdG9Qb2ludC54IC09IHBvaW50LngsXG4gICAgICB5OiB0b1BvaW50LnkgLT0gcG9pbnQueSxcbiAgICAgIHo6IHRvUG9pbnQueiAtPSBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlUG9pbnQoe1xuICAgICAgeDogcG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnksXG4gICAgICB6OiBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCBwb2ludC54KTtcbiAgICBjb25zb2xlLmxvZygneScsIHBvaW50LnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgcG9pbnQueik7XG4gIH07XG5cblxuICByZXR1cm4gcG9pbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUG9pbnQ7IiwiLy8gVE9ETzogdHJhbnNpdGlvbiB0byBUSFJFRS5WZWN0b3IzIGF0IHNvbWUgcG9pbnRcblxudmFyIGNyZWF0ZVZlY3RvciA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIElOSVRcbiAgdmFyIGRlZmF1bHRzID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gIHNwZWMgPSBzcGVjIHx8IGRlZmF1bHRzO1xuICB2YXIgdmVjdG9yID0ge307XG5cblxuICAvLyBGSUVMRFNcbiAgdmVjdG9yLnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgdmVjdG9yLnkgPSBzcGVjLnkgfHwgZGVmYXVsdHMueTtcbiAgdmVjdG9yLnogPSBzcGVjLnogfHwgZGVmYXVsdHMuejtcblxuXG4gIC8vIE1FVEhPRFNcbiAgdmVjdG9yLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSk7XG4gIH07XG5cbiAgdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmVjdG9yLnggKiB2ZWN0b3IueCArXG4gICAgICAgICAgIHZlY3Rvci55ICogdmVjdG9yLnkgK1xuICAgICAgICAgICB2ZWN0b3IueiAqIHZlY3Rvci56O1xuICB9O1xuXG4gIHZlY3Rvci5hZGRWZWN0b3IgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHZlY3Rvci54ICs9IG90aGVyVmVjdG9yLngsXG4gICAgdmVjdG9yLnkgKz0gb3RoZXJWZWN0b3IueSxcbiAgICB2ZWN0b3IueiArPSBvdGhlclZlY3Rvci56XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3Iuc3Vic3RyYWN0VmVjdG9yID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICB2ZWN0b3IueCAtPSBvdGhlclZlY3Rvci54LFxuICAgIHZlY3Rvci55IC09IG90aGVyVmVjdG9yLnksXG4gICAgdmVjdG9yLnogLT0gb3RoZXJWZWN0b3IuelxuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnNjYWxlID0gZnVuY3Rpb24oc2NhbGFyKSB7XG4gICAgdmVjdG9yLnggKj0gc2NhbGFyO1xuICAgIHZlY3Rvci55ICo9IHNjYWxhcjtcbiAgICB2ZWN0b3IueiAqPSBzY2FsYXI7XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3IucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ICo9IC0xO1xuICAgIHZlY3Rvci55ICo9IC0xO1xuICAgIHZlY3Rvci56ICo9IC0xO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IuZG90UHJvZHVjdCA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIHZlY3Rvci54ICogb3RoZXJWZWN0b3IueCArXG4gICAgICAgICAgICB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnkgK1xuICAgICAgICAgICAgdmVjdG9yLnogKiBvdGhlclZlY3Rvci56O1xuICB9O1xuXG4gIHZlY3Rvci5sb25nZXJUaGFuID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICByZXR1cm4gdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSA+IG90aGVyVmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfTtcblxuICB2ZWN0b3IuemVybyA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ID0gMDtcbiAgICB2ZWN0b3IueSA9IDA7XG4gICAgdmVjdG9yLnogPSAwO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCB2ZWN0b3IueCk7XG4gICAgY29uc29sZS5sb2coJ3knLCB2ZWN0b3IueSk7XG4gICAgY29uc29sZS5sb2coJ3onLCB2ZWN0b3Iueik7XG4gIH07XG5cbiAgdmVjdG9yLmNyZWF0ZU5vcm1hbGl6ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFnbml0dWRlID0gdmVjdG9yLm1hZ25pdHVkZSgpO1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdmVjdG9yLnggLyBtYWduaXR1ZGUsXG4gICAgICB5OiB2ZWN0b3IueSAvIG1hZ25pdHVkZSxcbiAgICAgIHo6IHZlY3Rvci56IC8gbWFnbml0dWRlXG4gICAgfSk7XG4gIH07XG5cbiAgdmVjdG9yLmNyZWF0ZUNyb3NzUHJvZHVjdCA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICB4OiB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnogLSB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnksXG4gICAgICB5OiB2ZWN0b3IueiAqIG90aGVyVmVjdG9yLnggLSB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnosXG4gICAgICB6OiB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnkgLSB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnhcbiAgICB9KTtcbiAgfTtcblxuXG4gIHJldHVybiB2ZWN0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlVmVjdG9yO1xuIl19
