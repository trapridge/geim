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


player.viewAngle.toVector().log();
player.viewAngle.restrict();
player.viewAngle.toVector().log();

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

var container, camera, scene, renderer, line, axes;

init();
gameLoop();

function init() {

  camera = new THREE.PerspectiveCamera(70,
                                       window.innerWidth / window.innerHeight,
                                       1, 1000);
  camera.position.y = 50;
  camera.position.z = 100;

  console.log('initial', camera.position.x, camera.position.y, camera.position.z);

  scene = new THREE.Scene();

  axes = buildAxes( 1000 );
  scene.add(axes);

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
  // Separate logic to its own file
  var angle = player.viewAngle.clone();
  //angle.yaw += Math.PI/2;
  var v = angle.toVector().scale(200);
  var playerPosition = player.position.clone();
  var cameraPosition = playerPosition.addVector(v);
  camera.position.x = cameraPosition.x + 0;
  camera.position.y = cameraPosition.y + 50;
  camera.position.z = cameraPosition.z + 100;

  //camera.position.x = player.position.x;
  //camera.position.y = player.position.y + 100;
  //camera.position.z = player.position.z + 100;

  //console.log('camera', camera.position.x, camera.position.y, camera.position.z);
  //console.log('player', player.position.x, player.position.y, player.position.z);
  //console.log('player', player.mesh.position.x, player.mesh.position.y, player.mesh.position.z);

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

function buildAxes( length ) {
  var axes = new THREE.Object3D();

  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

  return axes;

}

function buildAxis( src, dst, colorHex, dashed ) {
  var geom = new THREE.Geometry(),
  mat;

  if(dashed) {
    mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
    mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }

  geom.vertices.push( src.clone() );
  geom.vertices.push( dst.clone() );
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line( geom, mat, THREE.LinePieces );

  return axis;

}
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
},{"./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js":[function(require,module,exports){
var createKeyHandler = function(player) {
  'use strict';
  
  var movementSensitivity = 3;
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
},{}],"/Users/jansaharju/Code/geim/js/geim/MouseHandler.js":[function(require,module,exports){
var createMouseHandler = function(player) {
  'use strict';

  // TODO: change to use pointer locking: http://www.html5rocks.com/en/tutorials/pointerlock/intro/

  var mouseSensitivity = 0.02, lastX = 0, lastY = 0, looking = false;

  document.addEventListener('mousemove', function(event) {
    if(lastX > 0 && lastY > 0 && looking) {
      var movedX = event.screenX - lastX;
      var movedY = event.screenY - lastY;

      // update player's view angle
      player.updateViewAngles(-movedX * mouseSensitivity,
                              movedY * mouseSensitivity);
    }
    lastX = event.screenX;
    lastY = event.screenY;
  }, false);

  document.addEventListener('mousedown', function(event) {
    event.preventDefault();
    if(event.button == 2) // secondary
      looking = true;
    else if(event.button == 1) // primary
      player.shoot();
  }, false);

  document.addEventListener('mouseup', function(event) {
    if(event.button == 2) // secondary
      looking = false;
  }, false);

  document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  }, false)

}

module.exports = createMouseHandler;


},{}],"/Users/jansaharju/Code/geim/js/geim/Player.js":[function(require,module,exports){
var createVector = require('./Vector');
var createCharacter = require('./Character');
var createEulerAngles = require('./EulerAngles');
var playerKeyHandler = require('./KeyHandler');
var playerMouseHandler = require('./MouseHandler');

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
  playerMouseHandler(player);


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
    //player.movement = player.movementDirection;

    // rotate player according to viewAngle
    // TODO: do not use rotation
    player.mesh.rotation.y = player.viewAngle.yaw;

    superUpdate(delta);
  };

  var superDraw = player.draw;
  player.draw = function(delta, renderer) {
    superDraw(delta, renderer);
    // mesh drawn as part of scene in Game.js
  };

  player.updateViewAngles = function(yawD, pitchD) {
    player.viewAngle.yaw += yawD;
    player.viewAngle.pitch += pitchD;
    player.viewAngle.restrict();
  };

  player.shoot = function() {

  };

  return singletonPlayer = player;
}

module.exports = createPlayer;
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./EulerAngles":"/Users/jansaharju/Code/geim/js/geim/EulerAngles.js","./KeyHandler":"/Users/jansaharju/Code/geim/js/geim/KeyHandler.js","./MouseHandler":"/Users/jansaharju/Code/geim/js/geim/MouseHandler.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Point.js":[function(require,module,exports){
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
    vector.x = vector.x / magnitude;
    vector.y = vector.y / magnitude;
    vector.z = vector.z / magnitude;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL2dlaW0vR2FtZS5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0V1bGVyQW5nbGVzLmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vS2V5SGFuZGxlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL01vdXNlSGFuZGxlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BsYXllci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BvaW50LmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vVmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgY3JlYXRlQ2hhcmFjdGVyID0gcmVxdWlyZSgnLi9DaGFyYWN0ZXInKTtcbnZhciBjcmVhdGVQbGF5ZXIgPSByZXF1aXJlKCcuL1BsYXllcicpO1xudmFyIGNyZWF0ZVZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG52YXIgY3JlYXRlUG9pbnQgPSByZXF1aXJlKCcuL1BvaW50Jyk7XG5cbnZhciBwbGF5ZXIgPSBjcmVhdGVQbGF5ZXIoe1xuICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe3g6IDAsIHk6IDAsIHo6IDB9KSxcbiAgbWVzaDogbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KDUwLCAxMDAsIDUwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgd2lyZWZyYW1lOiB0cnVlIH0pKVxufSk7XG5cblxucGxheWVyLnZpZXdBbmdsZS50b1ZlY3RvcigpLmxvZygpO1xucGxheWVyLnZpZXdBbmdsZS5yZXN0cmljdCgpO1xucGxheWVyLnZpZXdBbmdsZS50b1ZlY3RvcigpLmxvZygpO1xuXG52YXIgcmFtZG9tU2VlZFNpemUgPSA0MDA7XG52YXIgY2hhcmFjdGVycyA9IFtcbiAgcGxheWVyLFxuICBjcmVhdGVDaGFyYWN0ZXIoe1xuICAgIHBvc2l0aW9uOiBjcmVhdGVQb2ludCh7XG4gICAgICB4OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSksXG4gICAgICB6OiBNYXRoLnJhbmRvbSgpICogcmFtZG9tU2VlZFNpemUgLSAocmFtZG9tU2VlZFNpemUgPj4gMSlcbiAgICB9KVxuICB9KSxcbiAgY3JlYXRlQ2hhcmFjdGVyKHtcbiAgICBwb3NpdGlvbjogY3JlYXRlUG9pbnQoe1xuICAgICAgeDogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpLFxuICAgICAgejogTWF0aC5yYW5kb20oKSAqIHJhbWRvbVNlZWRTaXplIC0gKHJhbWRvbVNlZWRTaXplID4+IDEpXG4gICAgfSlcbiAgfSksXG4gIGNyZWF0ZUNoYXJhY3Rlcih7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KHtcbiAgICAgIHg6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKSxcbiAgICAgIHo6IE1hdGgucmFuZG9tKCkgKiByYW1kb21TZWVkU2l6ZSAtIChyYW1kb21TZWVkU2l6ZSA+PiAxKVxuICAgIH0pXG4gIH0pXG5dO1xuXG52YXIgY29udGFpbmVyLCBjYW1lcmEsIHNjZW5lLCByZW5kZXJlciwgbGluZSwgYXhlcztcblxuaW5pdCgpO1xuZ2FtZUxvb3AoKTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcblxuICBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzAsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDEsIDEwMDApO1xuICBjYW1lcmEucG9zaXRpb24ueSA9IDUwO1xuICBjYW1lcmEucG9zaXRpb24ueiA9IDEwMDtcblxuICBjb25zb2xlLmxvZygnaW5pdGlhbCcsIGNhbWVyYS5wb3NpdGlvbi54LCBjYW1lcmEucG9zaXRpb24ueSwgY2FtZXJhLnBvc2l0aW9uLnopO1xuXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgYXhlcyA9IGJ1aWxkQXhlcyggMTAwMCApO1xuICBzY2VuZS5hZGQoYXhlcyk7XG5cbiAgY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBzY2VuZS5hZGQoY2hhci5tZXNoKTtcbiAgfSk7XG5cbiAgdmFyIG1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKHtcbiAgICBjb2xvcjogMHgwMDAwZmZcbiAgfSk7XG5cbiAgdmFyIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCk7XG4gIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goXG4gICAgbmV3IFRIUkVFLlZlY3RvcjMoMCwgMjUsIDApLFxuICAgIG5ldyBUSFJFRS5WZWN0b3IzKDAsIDI1LCAtNTApXG4gICk7XG4gIGxpbmUgPSBuZXcgVEhSRUUuTGluZSggZ2VvbWV0cnksIG1hdGVyaWFsICk7XG4gIGxpbmUuZnJ1c3R1bUN1bGxlZCA9IGZhbHNlO1xuICBzY2VuZS5hZGQoIGxpbmUgKTtcblxuICB2YXIgbGluZU1hdGVyaWFsID0gbmV3IFRIUkVFLkxpbmVCYXNpY01hdGVyaWFsKCB7IGNvbG9yOiAweDMwMzAzMCB9ICksXG4gIGdlb21ldHJ5ID0gbmV3IFRIUkVFLkdlb21ldHJ5KCksXG4gIGZsb29yID0gLTUwLCBzdGVwID0gMjU7XG5cbiAgZm9yICggdmFyIGkgPSAwOyBpIDw9IDQwOyBpICsrICkge1xuXG4gICAgZ2VvbWV0cnkudmVydGljZXMucHVzaCggbmV3IFRIUkVFLlZlY3RvcjMoIC0gNTAwLCBmbG9vciwgaSAqIHN0ZXAgLSA1MDAgKSApO1xuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAgIDUwMCwgZmxvb3IsIGkgKiBzdGVwIC0gNTAwICkgKTtcblxuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCBpICogc3RlcCAtIDUwMCwgZmxvb3IsIC01MDAgKSApO1xuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCBpICogc3RlcCAtIDUwMCwgZmxvb3IsICA1MDAgKSApO1xuXG4gIH1cblxuICB2YXIgZ3JpZCA9IG5ldyBUSFJFRS5MaW5lKCBnZW9tZXRyeSwgbGluZU1hdGVyaWFsLCBUSFJFRS5MaW5lUGllY2VzICk7XG4gIHNjZW5lLmFkZChncmlkKTtcblxuICAvLyBUT0RPOiBhZGQgYXhpc1xuXG4gIHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgcmVuZGVyZXIuc2V0U2l6ZSh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGFpbmVyJyk7XG4gIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTtcbn1cblxudmFyIHN0YXJ0LCBkZWx0YSA9IDA7XG5mdW5jdGlvbiBnYW1lTG9vcCgpIHtcbiAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICB1cGRhdGUoZGVsdGEpO1xuICBkcmF3KGRlbHRhKTtcbiAgZGVsdGEgPSBEYXRlLm5vdygpIC0gc3RhcnQ7XG4gIGlmKGRlbHRhIDwgMTApIGRlbHRhID0gMTA7XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShnYW1lTG9vcCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZShkZWx0YSkge1xuICAvLyBwb3NpdGlvbiBjYW1lcmFcbiAgLy8gU2VwYXJhdGUgbG9naWMgdG8gaXRzIG93biBmaWxlXG4gIHZhciBhbmdsZSA9IHBsYXllci52aWV3QW5nbGUuY2xvbmUoKTtcbiAgLy9hbmdsZS55YXcgKz0gTWF0aC5QSS8yO1xuICB2YXIgdiA9IGFuZ2xlLnRvVmVjdG9yKCkuc2NhbGUoMjAwKTtcbiAgdmFyIHBsYXllclBvc2l0aW9uID0gcGxheWVyLnBvc2l0aW9uLmNsb25lKCk7XG4gIHZhciBjYW1lcmFQb3NpdGlvbiA9IHBsYXllclBvc2l0aW9uLmFkZFZlY3Rvcih2KTtcbiAgY2FtZXJhLnBvc2l0aW9uLnggPSBjYW1lcmFQb3NpdGlvbi54ICsgMDtcbiAgY2FtZXJhLnBvc2l0aW9uLnkgPSBjYW1lcmFQb3NpdGlvbi55ICsgNTA7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gY2FtZXJhUG9zaXRpb24ueiArIDEwMDtcblxuICAvL2NhbWVyYS5wb3NpdGlvbi54ID0gcGxheWVyLnBvc2l0aW9uLng7XG4gIC8vY2FtZXJhLnBvc2l0aW9uLnkgPSBwbGF5ZXIucG9zaXRpb24ueSArIDEwMDtcbiAgLy9jYW1lcmEucG9zaXRpb24ueiA9IHBsYXllci5wb3NpdGlvbi56ICsgMTAwO1xuXG4gIC8vY29uc29sZS5sb2coJ2NhbWVyYScsIGNhbWVyYS5wb3NpdGlvbi54LCBjYW1lcmEucG9zaXRpb24ueSwgY2FtZXJhLnBvc2l0aW9uLnopO1xuICAvL2NvbnNvbGUubG9nKCdwbGF5ZXInLCBwbGF5ZXIucG9zaXRpb24ueCwgcGxheWVyLnBvc2l0aW9uLnksIHBsYXllci5wb3NpdGlvbi56KTtcbiAgLy9jb25zb2xlLmxvZygncGxheWVyJywgcGxheWVyLm1lc2gucG9zaXRpb24ueCwgcGxheWVyLm1lc2gucG9zaXRpb24ueSwgcGxheWVyLm1lc2gucG9zaXRpb24ueik7XG5cbiAgY2FtZXJhLmxvb2tBdChwbGF5ZXIubWVzaC5wb3NpdGlvbik7XG5cbiAgLy8gdXBkYXRlIG5vc2VcbiAgLy8gVE9ETzogbW92ZSB0byBQbGF5ZXIgYW5kIHVwZGF0ZSBwb3NpdGlvbiBpbmRpcmVjdGx5XG4gIHZhciB2ID0gdi5ub3JtYWxpemUoKS5zY2FsZSg1MDApO1xuICB2LnkgPSAwO1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzBdLnggPSBwbGF5ZXIucG9zaXRpb24ueDtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1swXS55ID0gcGxheWVyLnBvc2l0aW9uLnk7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMF0ueiA9IHBsYXllci5wb3NpdGlvbi56O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzWzFdLnggPSBwbGF5ZXIucG9zaXRpb24ueCAtIHYueDtcbiAgbGluZS5nZW9tZXRyeS52ZXJ0aWNlc1sxXS55ID0gcGxheWVyLnBvc2l0aW9uLnkgLSB2Lnk7XG4gIGxpbmUuZ2VvbWV0cnkudmVydGljZXNbMV0ueiA9IHBsYXllci5wb3NpdGlvbi56IC0gdi56O1xuICBsaW5lLmdlb21ldHJ5LnZlcnRpY2VzTmVlZFVwZGF0ZSA9IHRydWU7XG5cbiAgLy8gdXBkYXRlIGNoYXJhY3RlcnNcbiAgY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBjaGFyLnVwZGF0ZShkZWx0YSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBkcmF3KGRlbHRhKSB7XG4gIC8vY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgLy8gIGNoYXIuZHJhdyhkZWx0YSwgcmVuZGVyZXIpO1xuICAvL30pO1xuXG4gIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRBeGVzKCBsZW5ndGggKSB7XG4gIHZhciBheGVzID0gbmV3IFRIUkVFLk9iamVjdDNEKCk7XG5cbiAgYXhlcy5hZGQoIGJ1aWxkQXhpcyggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKSwgbmV3IFRIUkVFLlZlY3RvcjMoIGxlbmd0aCwgMCwgMCApLCAweEZGMDAwMCwgZmFsc2UgKSApOyAvLyArWFxuICBheGVzLmFkZCggYnVpbGRBeGlzKCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApLCBuZXcgVEhSRUUuVmVjdG9yMyggLWxlbmd0aCwgMCwgMCApLCAweEZGMDAwMCwgdHJ1ZSkgKTsgLy8gLVhcbiAgYXhlcy5hZGQoIGJ1aWxkQXhpcyggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKSwgbmV3IFRIUkVFLlZlY3RvcjMoIDAsIGxlbmd0aCwgMCApLCAweDAwRkYwMCwgZmFsc2UgKSApOyAvLyArWVxuICBheGVzLmFkZCggYnVpbGRBeGlzKCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgMCwgMCApLCBuZXcgVEhSRUUuVmVjdG9yMyggMCwgLWxlbmd0aCwgMCApLCAweDAwRkYwMCwgdHJ1ZSApICk7IC8vIC1ZXG4gIGF4ZXMuYWRkKCBidWlsZEF4aXMoIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCAwICksIG5ldyBUSFJFRS5WZWN0b3IzKCAwLCAwLCBsZW5ndGggKSwgMHgwMDAwRkYsIGZhbHNlICkgKTsgLy8gK1pcbiAgYXhlcy5hZGQoIGJ1aWxkQXhpcyggbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIDAgKSwgbmV3IFRIUkVFLlZlY3RvcjMoIDAsIDAsIC1sZW5ndGggKSwgMHgwMDAwRkYsIHRydWUgKSApOyAvLyAtWlxuXG4gIHJldHVybiBheGVzO1xuXG59XG5cbmZ1bmN0aW9uIGJ1aWxkQXhpcyggc3JjLCBkc3QsIGNvbG9ySGV4LCBkYXNoZWQgKSB7XG4gIHZhciBnZW9tID0gbmV3IFRIUkVFLkdlb21ldHJ5KCksXG4gIG1hdDtcblxuICBpZihkYXNoZWQpIHtcbiAgICBtYXQgPSBuZXcgVEhSRUUuTGluZURhc2hlZE1hdGVyaWFsKHsgbGluZXdpZHRoOiAzLCBjb2xvcjogY29sb3JIZXgsIGRhc2hTaXplOiAzLCBnYXBTaXplOiAzIH0pO1xuICB9IGVsc2Uge1xuICAgIG1hdCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCh7IGxpbmV3aWR0aDogMywgY29sb3I6IGNvbG9ySGV4IH0pO1xuICB9XG5cbiAgZ2VvbS52ZXJ0aWNlcy5wdXNoKCBzcmMuY2xvbmUoKSApO1xuICBnZW9tLnZlcnRpY2VzLnB1c2goIGRzdC5jbG9uZSgpICk7XG4gIGdlb20uY29tcHV0ZUxpbmVEaXN0YW5jZXMoKTsgLy8gVGhpcyBvbmUgaXMgU1VQRVIgaW1wb3J0YW50LCBvdGhlcndpc2UgZGFzaGVkIGxpbmVzIHdpbGwgYXBwZWFyIGFzIHNpbXBsZSBwbGFpbiBsaW5lc1xuXG4gIHZhciBheGlzID0gbmV3IFRIUkVFLkxpbmUoIGdlb20sIG1hdCwgVEhSRUUuTGluZVBpZWNlcyApO1xuXG4gIHJldHVybiBheGlzO1xuXG59IiwidmFyIGNyZWF0ZVBvaW50ID0gcmVxdWlyZSgnLi9Qb2ludCcpO1xudmFyIGNyZWF0ZVZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG5cbnZhciBjcmVhdGVDaGFyYWN0ZXIgPSBmdW5jdGlvbiAoc3BlYykge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gSU5JVFxuICB2YXIgZGVmYXVsdHMgPSB7XG4gICAgcG9zaXRpb246IGNyZWF0ZVBvaW50KCksXG4gICAgbW92ZW1lbnREaXJlY3Rpb246IGNyZWF0ZVZlY3RvcigpLFxuICAgIG1vdmVtZW50OiBjcmVhdGVWZWN0b3IoKSxcbiAgICBtZXNoOiBuZXcgVEhSRUUuTWVzaChuZXcgVEhSRUUuQm94R2VvbWV0cnkoNTAsIDEwMCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoTm9ybWFsTWF0ZXJpYWwoKSksXG4gICAgaGVhbHRoOiAxMDAsXG4gICAgdmlzaWJsZTogdHJ1ZSxcbiAgICByb3RhdGluZzogZmFsc2UsXG4gICAgdmVsb2NpdHk6IDAgLy8gdW5pdHMvbXNcbiAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBjaGFyYWN0ZXIgPSB7fTtcblxuXG4gIC8vIEZJRUxEU1xuICBjaGFyYWN0ZXIucG9zaXRpb24gPSBzcGVjLnBvc2l0aW9uIHx8IGRlZmF1bHRzLnBvc2l0aW9uO1xuICBjaGFyYWN0ZXIubW92ZW1lbnREaXJlY3Rpb24gPSBzcGVjLm1vdmVtZW50RGlyZWN0aW9uIHx8IGRlZmF1bHRzLm1vdmVtZW50RGlyZWN0aW9uO1xuICBjaGFyYWN0ZXIubW92ZW1lbnQgPSBzcGVjLm1vdmVtZW50IHx8IGRlZmF1bHRzLm1vdmVtZW50O1xuICBjaGFyYWN0ZXIubWVzaCA9IHNwZWMubWVzaCB8fCBkZWZhdWx0cy5tZXNoO1xuICBjaGFyYWN0ZXIuaGVhbHRoID0gc3BlYy5oZWFsdGggfHwgZGVmYXVsdHMuaGVhbHRoO1xuICBjaGFyYWN0ZXIudmlzaWJsZSA9IHNwZWMudmlzaWJsZSB8fCBkZWZhdWx0cy52aXNpYmxlO1xuICBjaGFyYWN0ZXIucm90YXRpbmcgPSBzcGVjLnJvdGF0aW5nIHx8IGRlZmF1bHRzLnJvdGF0aW5nO1xuICBjaGFyYWN0ZXIudmVsb2NpdHkgPSBzcGVjLnZlbG9jaXR5IHx8IGRlZmF1bHRzLnZlbG9jaXR5O1xuXG5cbiAgLy8gTUVUSE9EU1xuICBjaGFyYWN0ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICAvLyBtb3ZlIGNoYXJhY3RlciBieSBhZGRpbmcgdGhlIG1vdmVtZW50IHZlY3RvciB0byBjdXJyZW50IHBvc2l0aW9uXG4gICAgY2hhcmFjdGVyLnBvc2l0aW9uLmFkZFZlY3RvcihjaGFyYWN0ZXIubW92ZW1lbnQuc2NhbGUoY2hhcmFjdGVyLnZlbG9jaXR5KSk7XG5cbiAgICAvLyB1cGRhdGUgbWVzaCB0byBuZXcgcG9zaXRpb25cbiAgICB1cGRhdGVNZXNoUG9zaXRpb24oY2hhcmFjdGVyLnBvc2l0aW9uLCBjaGFyYWN0ZXIubWVzaCk7XG4gIH07XG5cbiAgY2hhcmFjdGVyLmRyYXcgPSBmdW5jdGlvbihkZWx0YSwgcmVuZGVyZXIpIHtcbiAgICAvLyBtZXNoIGRyYXduIGFzIHBhcnQgb2Ygc2NlbmUgaW4gR2FtZS5qc1xuICB9O1xuXG5cblxuICAvLyBIRUxQRVJTXG4gIGZ1bmN0aW9uIHVwZGF0ZU1lc2hQb3NpdGlvbihwb2ludCwgbWVzaCkge1xuICAgIG1lc2gucG9zaXRpb24ueCA9IHBvaW50Lng7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gcG9pbnQueTtcbiAgICBtZXNoLnBvc2l0aW9uLnogPSBwb2ludC56O1xuICB9XG5cblxuICByZXR1cm4gY2hhcmFjdGVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUNoYXJhY3RlcjsiLCIvLyBUT0RPOiB0aGlzIGlzIG5vdCBuZWVkZWQgYXMgRXVsZXIgYW5nbGVzIGFyZSBjYWxjdWxhdGVkIGluIFRIUkVFXG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHBpdGNoOiAwLCB5YXc6IDAsIHJvbGw6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBldWxlckFuZ2xlcyA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIGV1bGVyQW5nbGVzLnBpdGNoID0gc3BlYy5waXRjaCB8fCBkZWZhdWx0cy5waXRjaDtcbiAgZXVsZXJBbmdsZXMueWF3ID0gc3BlYy55YXcgfHwgZGVmYXVsdHMueWF3O1xuICBldWxlckFuZ2xlcy5yb2xsID0gc3BlYy5yb2xsIHx8IGRlZmF1bHRzLnJvbGw7XG5cblxuICAvLyBNRVRIT0RTXG4gIGV1bGVyQW5nbGVzLnRvVmVjdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVZlY3Rvcih7XG4gICAgICAvL3g6IE1hdGguY29zKGV1bGVyQW5nbGVzLnlhdykgKiBNYXRoLmNvcyhldWxlckFuZ2xlcy5waXRjaCksXG4gICAgICAvL3k6IE1hdGguc2luKGV1bGVyQW5nbGVzLnBpdGNoKSxcbiAgICAgIC8vejogTWF0aC5zaW4oZXVsZXJBbmdsZXMueWF3KSAqIE1hdGguY29zKGV1bGVyQW5nbGVzLnBpdGNoKVxuICAgICAgLy8gbm90ZSB4IGFuZCB6IHN3aXRjaGVkIGFzIHdlIHJvdGF0aW9uIHRvIGJlIG5ldXRyYWwgYWxvbmcgeiBheGlzIGJ5IGRlZmF1bHRcbiAgICAgIHg6IE1hdGguc2luKGV1bGVyQW5nbGVzLnlhdykgKiBNYXRoLmNvcyhldWxlckFuZ2xlcy5waXRjaCksXG4gICAgICB5OiBNYXRoLnNpbihldWxlckFuZ2xlcy5waXRjaCksXG4gICAgICB6OiBNYXRoLmNvcyhldWxlckFuZ2xlcy55YXcpICogTWF0aC5jb3MoZXVsZXJBbmdsZXMucGl0Y2gpXG4gICAgfSk7XG4gIH07XG5cbiAgZXVsZXJBbmdsZXMucmVzdHJpY3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZihldWxlckFuZ2xlcy5waXRjaCA+IE1hdGguUEkgLyAyLyogLSAwLjEqLykge1xuICAgICAgZXVsZXJBbmdsZXMucGl0Y2ggPSBNYXRoLlBJIC8gMi8qIC0gMC4xKi87XG4gICAgfVxuICAgIGVsc2UgaWYoZXVsZXJBbmdsZXMucGl0Y2ggPCAtTWF0aC5QSSAvIDIvKiArIDAuMSovKSB7XG4gICAgICBldWxlckFuZ2xlcy5waXRjaCA9IC1NYXRoLlBJIC8gMi8qICsgMC4xKi87XG4gICAgfVxuXG4gICAgd2hpbGUoZXVsZXJBbmdsZXMueWF3IDwgLU1hdGguUEkpIHtcbiAgICAgIGV1bGVyQW5nbGVzLnlhdyArPSBNYXRoLlBJICogMjtcbiAgICB9XG4gICAgd2hpbGUoZXVsZXJBbmdsZXMueWF3ID4gTWF0aC5QSSkge1xuICAgICAgZXVsZXJBbmdsZXMueWF3IC09IE1hdGguUEkgKiAyO1xuICAgIH1cbiAgICByZXR1cm4gZXVsZXJBbmdsZXM7XG4gIH07XG5cbiAgZXVsZXJBbmdsZXMubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3BpdGNoJywgZXVsZXJBbmdsZXMucGl0Y2ggKiAxODAvTWF0aC5QSSk7XG4gICAgY29uc29sZS5sb2coJ3lhdycsIGV1bGVyQW5nbGVzLnlhdyAqIDE4MC9NYXRoLlBJKTtcbiAgICBjb25zb2xlLmxvZygncm9sbCcsIGV1bGVyQW5nbGVzLnJvbGwgKiAxODAvTWF0aC5QSSk7XG4gIH07XG5cbiAgZXVsZXJBbmdsZXMuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlRXVsZXJBbmdsZXMoe1xuICAgICAgcGl0Y2g6IGV1bGVyQW5nbGVzLnBpdGNoLFxuICAgICAgeWF3OiBldWxlckFuZ2xlcy55YXcsXG4gICAgICByb2xsOiBldWxlckFuZ2xlcy5yb2xsXG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIGV1bGVyQW5nbGVzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUV1bGVyQW5nbGVzOyIsInZhciBjcmVhdGVLZXlIYW5kbGVyID0gZnVuY3Rpb24ocGxheWVyKSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgXG4gIHZhciBtb3ZlbWVudFNlbnNpdGl2aXR5ID0gMztcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICBzd2l0Y2goZXZlbnQua2V5Q29kZSkge1xuICAgICAgY2FzZSA4NzogLy8gd1xuICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IC1tb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgNjU6IC8vIGFcbiAgICAgICAgcGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnggPSAtbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDgzOiAvLyBzXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY4OiAvLyBkXG4gICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID0gbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gIH0sIGZhbHNlKTtcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgc3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcbiAgICAgIGNhc2UgODc6IC8vIHdcbiAgICAgICAgaWYocGxheWVyLm1vdmVtZW50RGlyZWN0aW9uLnogPT09IC1tb3ZlbWVudFNlbnNpdGl2aXR5KVxuICAgICAgICAgIHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56ID0gMDtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDY1OiAvLyBhXG4gICAgICAgIGlmKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54ID09PSAtbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA4MzogLy8gc1xuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueiA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSA2ODogLy8gZFxuICAgICAgICBpZihwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9PT0gbW92ZW1lbnRTZW5zaXRpdml0eSlcbiAgICAgICAgICBwbGF5ZXIubW92ZW1lbnREaXJlY3Rpb24ueCA9IDA7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICB9LCBmYWxzZSk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVLZXlIYW5kbGVyOyIsInZhciBjcmVhdGVNb3VzZUhhbmRsZXIgPSBmdW5jdGlvbihwbGF5ZXIpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIFRPRE86IGNoYW5nZSB0byB1c2UgcG9pbnRlciBsb2NraW5nOiBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9wb2ludGVybG9jay9pbnRyby9cblxuICB2YXIgbW91c2VTZW5zaXRpdml0eSA9IDAuMDIsIGxhc3RYID0gMCwgbGFzdFkgPSAwLCBsb29raW5nID0gZmFsc2U7XG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZihsYXN0WCA+IDAgJiYgbGFzdFkgPiAwICYmIGxvb2tpbmcpIHtcbiAgICAgIHZhciBtb3ZlZFggPSBldmVudC5zY3JlZW5YIC0gbGFzdFg7XG4gICAgICB2YXIgbW92ZWRZID0gZXZlbnQuc2NyZWVuWSAtIGxhc3RZO1xuXG4gICAgICAvLyB1cGRhdGUgcGxheWVyJ3MgdmlldyBhbmdsZVxuICAgICAgcGxheWVyLnVwZGF0ZVZpZXdBbmdsZXMoLW1vdmVkWCAqIG1vdXNlU2Vuc2l0aXZpdHksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb3ZlZFkgKiBtb3VzZVNlbnNpdGl2aXR5KTtcbiAgICB9XG4gICAgbGFzdFggPSBldmVudC5zY3JlZW5YO1xuICAgIGxhc3RZID0gZXZlbnQuc2NyZWVuWTtcbiAgfSwgZmFsc2UpO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBpZihldmVudC5idXR0b24gPT0gMikgLy8gc2Vjb25kYXJ5XG4gICAgICBsb29raW5nID0gdHJ1ZTtcbiAgICBlbHNlIGlmKGV2ZW50LmJ1dHRvbiA9PSAxKSAvLyBwcmltYXJ5XG4gICAgICBwbGF5ZXIuc2hvb3QoKTtcbiAgfSwgZmFsc2UpO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKGV2ZW50LmJ1dHRvbiA9PSAyKSAvLyBzZWNvbmRhcnlcbiAgICAgIGxvb2tpbmcgPSBmYWxzZTtcbiAgfSwgZmFsc2UpO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfSwgZmFsc2UpXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVNb3VzZUhhbmRsZXI7XG5cbiIsInZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xudmFyIGNyZWF0ZUNoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG52YXIgY3JlYXRlRXVsZXJBbmdsZXMgPSByZXF1aXJlKCcuL0V1bGVyQW5nbGVzJyk7XG52YXIgcGxheWVyS2V5SGFuZGxlciA9IHJlcXVpcmUoJy4vS2V5SGFuZGxlcicpO1xudmFyIHBsYXllck1vdXNlSGFuZGxlciA9IHJlcXVpcmUoJy4vTW91c2VIYW5kbGVyJyk7XG5cbnZhciBzaW5nbGV0b25QbGF5ZXI7XG52YXIgY3JlYXRlUGxheWVyID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmKHNpbmdsZXRvblBsYXllcikge1xuICAgIHJldHVybiBzaW5nbGV0b25QbGF5ZXI7XG4gIH1cblxuXG4gIC8vIElOSVRcbiAgdmFyIHBsYXllciA9IGNyZWF0ZUNoYXJhY3RlcihzcGVjKTtcbiAgdmFyIGRlZmF1bHRzID0ge1xuICAgIHZlbG9jaXR5OiAxLCAvLyBvdmVycmlkZVxuICAgIHBvaW50czogMCxcbiAgICB2aWV3QW5nbGU6IGNyZWF0ZUV1bGVyQW5nbGVzKClcbiAgfTtcbiAgcGxheWVyLnBvaW50cyA9IHNwZWMgJiYgc3BlYy5wb2ludHMgPyBzcGVjLnBvaW50cyA6IGRlZmF1bHRzLnBvaW50cztcbiAgcGxheWVyLnZpZXdBbmdsZSA9IHNwZWMgJiYgc3BlYy5wb2ludHMgPyBzcGVjLnZpZXdBbmdsZSA6IGRlZmF1bHRzLnZpZXdBbmdsZTtcbiAgcGxheWVyLnZlbG9jaXR5ID0gc3BlYyAmJiBzcGVjLnZlbG9jaXR5ID8gc3BlYy52ZWxvY2l0eSA6IGRlZmF1bHRzLnZlbG9jaXR5O1xuICBwbGF5ZXJLZXlIYW5kbGVyKHBsYXllcik7XG4gIHBsYXllck1vdXNlSGFuZGxlcihwbGF5ZXIpO1xuXG5cbiAgLy8gTUVUSE9EU1xuICB2YXIgc3VwZXJVcGRhdGUgPSBwbGF5ZXIudXBkYXRlO1xuICBwbGF5ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcblxuICAgIC8vIG1vdmUgcGxheWVyIGFjY29yZGluZyB0bzpcbiAgICAvLyAgIGtleWJvYXJkIChtb3ZlbWVudERpcmVjdGlvbiksIGFuZFxuICAgIC8vICAgbW91c2UgKHZpZXdBbmdsZSlcbiAgICB2YXIgZm9yd2FyZFZlY3RvciA9IHBsYXllci52aWV3QW5nbGUudG9WZWN0b3IoKTtcbiAgICBmb3J3YXJkVmVjdG9yLnkgPSAwO1xuXG4gICAgdmFyIHVwVmVjdG9yID0gY3JlYXRlVmVjdG9yKHsgeDogMCwgeTogMSwgejogMCB9KTtcbiAgICB2YXIgcmlnaHRWZWN0b3IgPSB1cFZlY3Rvci5jcm9zc1Byb2R1Y3RWZWN0b3IoZm9yd2FyZFZlY3Rvcik7XG5cbiAgICAvLyBUT0RPOiBzY2FsZSBtb3ZlbWVudCBieSBkVFxuXG4gICAgdmFyIGEgPSBmb3J3YXJkVmVjdG9yLm5vcm1hbGl6ZSgpLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi56KTtcbiAgICB2YXIgYiA9IHJpZ2h0VmVjdG9yLm5vcm1hbGl6ZSgpLnNjYWxlKHBsYXllci5tb3ZlbWVudERpcmVjdGlvbi54KTtcblxuICAgIHBsYXllci5tb3ZlbWVudCA9IGEuYWRkVmVjdG9yKGIpO1xuICAgIC8vcGxheWVyLm1vdmVtZW50ID0gcGxheWVyLm1vdmVtZW50RGlyZWN0aW9uO1xuXG4gICAgLy8gcm90YXRlIHBsYXllciBhY2NvcmRpbmcgdG8gdmlld0FuZ2xlXG4gICAgLy8gVE9ETzogZG8gbm90IHVzZSByb3RhdGlvblxuICAgIHBsYXllci5tZXNoLnJvdGF0aW9uLnkgPSBwbGF5ZXIudmlld0FuZ2xlLnlhdztcblxuICAgIHN1cGVyVXBkYXRlKGRlbHRhKTtcbiAgfTtcblxuICB2YXIgc3VwZXJEcmF3ID0gcGxheWVyLmRyYXc7XG4gIHBsYXllci5kcmF3ID0gZnVuY3Rpb24oZGVsdGEsIHJlbmRlcmVyKSB7XG4gICAgc3VwZXJEcmF3KGRlbHRhLCByZW5kZXJlcik7XG4gICAgLy8gbWVzaCBkcmF3biBhcyBwYXJ0IG9mIHNjZW5lIGluIEdhbWUuanNcbiAgfTtcblxuICBwbGF5ZXIudXBkYXRlVmlld0FuZ2xlcyA9IGZ1bmN0aW9uKHlhd0QsIHBpdGNoRCkge1xuICAgIHBsYXllci52aWV3QW5nbGUueWF3ICs9IHlhd0Q7XG4gICAgcGxheWVyLnZpZXdBbmdsZS5waXRjaCArPSBwaXRjaEQ7XG4gICAgcGxheWVyLnZpZXdBbmdsZS5yZXN0cmljdCgpO1xuICB9O1xuXG4gIHBsYXllci5zaG9vdCA9IGZ1bmN0aW9uKCkge1xuXG4gIH07XG5cbiAgcmV0dXJuIHNpbmdsZXRvblBsYXllciA9IHBsYXllcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVQbGF5ZXI7IiwiLy8gVE9ETzogY29uc2lkZXIgdXNpbmcgVEhSRUUuVmVjdG9yMyBhdCBzb21lIHBvaW50XG5cbnZhciBjcmVhdGVWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgY3JlYXRlUG9pbnQgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBJTklUXG4gIHZhciBkZWZhdWx0cyA9ICB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG4gIHZhciBwb2ludCA9IHt9O1xuXG5cbiAgLy8gRklFTERTXG4gIHBvaW50LnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgcG9pbnQueSA9IHNwZWMueSB8fCBkZWZhdWx0cy55O1xuICBwb2ludC56ID0gc3BlYy56IHx8IGRlZmF1bHRzLno7XG5cblxuICAvLyBNRVRIT0RTXG4gIHBvaW50LmFkZFZlY3RvciA9IGZ1bmN0aW9uKHZlY3Rvcikge1xuICAgIHBvaW50LnggKz0gdmVjdG9yLng7XG4gICAgcG9pbnQueSArPSB2ZWN0b3IueTtcbiAgICBwb2ludC56ICs9IHZlY3Rvci56O1xuICAgIHJldHVybiBwb2ludDtcbiAgfTtcblxuICBwb2ludC5zdWJzdHJhY3RWZWN0b3IgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICBwb2ludC54IC09IHZlY3Rvci54O1xuICAgIHBvaW50LnkgLT0gdmVjdG9yLnk7XG4gICAgcG9pbnQueiAtPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yVG9Qb2ludCA9IGZ1bmN0aW9uKGZyb21Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogcG9pbnQueCAtPSBmcm9tUG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnkgLT0gZnJvbVBvaW50LnksXG4gICAgICB6OiBwb2ludC56IC09IGZyb21Qb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY3JlYXRlVmVjdG9yRnJvbVBvaW50ID0gZnVuY3Rpb24odG9Qb2ludCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdG9Qb2ludC54IC09IHBvaW50LngsXG4gICAgICB5OiB0b1BvaW50LnkgLT0gcG9pbnQueSxcbiAgICAgIHo6IHRvUG9pbnQueiAtPSBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gY3JlYXRlUG9pbnQoe1xuICAgICAgeDogcG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnksXG4gICAgICB6OiBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCBwb2ludC54KTtcbiAgICBjb25zb2xlLmxvZygneScsIHBvaW50LnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgcG9pbnQueik7XG4gIH07XG5cblxuICByZXR1cm4gcG9pbnQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlUG9pbnQ7IiwiLy8gVE9ETzogdHJhbnNpdGlvbiB0byBUSFJFRS5WZWN0b3IzIGF0IHNvbWUgcG9pbnRcblxudmFyIGNyZWF0ZVZlY3RvciA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIElOSVRcbiAgdmFyIGRlZmF1bHRzID0geyB4OiAwLCB5OiAwLCB6OiAwIH07XG4gIHNwZWMgPSBzcGVjIHx8IGRlZmF1bHRzO1xuICB2YXIgdmVjdG9yID0ge307XG5cblxuICAvLyBGSUVMRFNcbiAgdmVjdG9yLnggPSBzcGVjLnggfHwgZGVmYXVsdHMueDtcbiAgdmVjdG9yLnkgPSBzcGVjLnkgfHwgZGVmYXVsdHMueTtcbiAgdmVjdG9yLnogPSBzcGVjLnogfHwgZGVmYXVsdHMuejtcblxuXG4gIC8vIE1FVEhPRFNcbiAgdmVjdG9yLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQodmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSk7XG4gIH07XG5cbiAgdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdmVjdG9yLnggKiB2ZWN0b3IueCArXG4gICAgICAgICAgIHZlY3Rvci55ICogdmVjdG9yLnkgK1xuICAgICAgICAgICB2ZWN0b3IueiAqIHZlY3Rvci56O1xuICB9O1xuXG4gIHZlY3Rvci5hZGRWZWN0b3IgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHZlY3Rvci54ICs9IG90aGVyVmVjdG9yLngsXG4gICAgdmVjdG9yLnkgKz0gb3RoZXJWZWN0b3IueSxcbiAgICB2ZWN0b3IueiArPSBvdGhlclZlY3Rvci56XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3Iuc3Vic3RyYWN0VmVjdG9yID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICB2ZWN0b3IueCAtPSBvdGhlclZlY3Rvci54LFxuICAgIHZlY3Rvci55IC09IG90aGVyVmVjdG9yLnksXG4gICAgdmVjdG9yLnogLT0gb3RoZXJWZWN0b3IuelxuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnNjYWxlID0gZnVuY3Rpb24oc2NhbGFyKSB7XG4gICAgdmVjdG9yLnggKj0gc2NhbGFyO1xuICAgIHZlY3Rvci55ICo9IHNjYWxhcjtcbiAgICB2ZWN0b3IueiAqPSBzY2FsYXI7XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3IucmV2ZXJzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ICo9IC0xO1xuICAgIHZlY3Rvci55ICo9IC0xO1xuICAgIHZlY3Rvci56ICo9IC0xO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IuZG90UHJvZHVjdCA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIHZlY3Rvci54ICogb3RoZXJWZWN0b3IueCArXG4gICAgICAgICAgICB2ZWN0b3IueSAqIG90aGVyVmVjdG9yLnkgK1xuICAgICAgICAgICAgdmVjdG9yLnogKiBvdGhlclZlY3Rvci56O1xuICB9O1xuXG4gIHZlY3Rvci5sb25nZXJUaGFuID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICByZXR1cm4gdmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKSA+IG90aGVyVmVjdG9yLm1hZ25pdHVkZVNxdWFyZWQoKTtcbiAgfTtcblxuICB2ZWN0b3IuemVybyA9IGZ1bmN0aW9uKCkge1xuICAgIHZlY3Rvci54ID0gMDtcbiAgICB2ZWN0b3IueSA9IDA7XG4gICAgdmVjdG9yLnogPSAwO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH1cblxuICB2ZWN0b3IubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCB2ZWN0b3IueCk7XG4gICAgY29uc29sZS5sb2coJ3knLCB2ZWN0b3IueSk7XG4gICAgY29uc29sZS5sb2coJ3onLCB2ZWN0b3Iueik7XG4gIH07XG5cbiAgdmVjdG9yLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYWduaXR1ZGUgPSB2ZWN0b3IubWFnbml0dWRlKCk7XG4gICAgdmVjdG9yLnggPSB2ZWN0b3IueCAvIG1hZ25pdHVkZTtcbiAgICB2ZWN0b3IueSA9IHZlY3Rvci55IC8gbWFnbml0dWRlO1xuICAgIHZlY3Rvci56ID0gdmVjdG9yLnogLyBtYWduaXR1ZGU7XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3IuY3Jvc3NQcm9kdWN0VmVjdG9yID0gZnVuY3Rpb24ob3RoZXJWZWN0b3IpIHtcbiAgICByZXR1cm4gY3JlYXRlVmVjdG9yKHtcbiAgICAgIHg6IHZlY3Rvci55ICogb3RoZXJWZWN0b3IueiAtIHZlY3Rvci56ICogb3RoZXJWZWN0b3IueSxcbiAgICAgIHk6IHZlY3Rvci56ICogb3RoZXJWZWN0b3IueCAtIHZlY3Rvci54ICogb3RoZXJWZWN0b3IueixcbiAgICAgIHo6IHZlY3Rvci54ICogb3RoZXJWZWN0b3IueSAtIHZlY3Rvci55ICogb3RoZXJWZWN0b3IueFxuICAgIH0pO1xuICB9O1xuXG4gIHZlY3Rvci5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjcmVhdGVWZWN0b3Ioe1xuICAgICAgeDogdmVjdG9yLngsXG4gICAgICB5OiB2ZWN0b3IueSxcbiAgICAgIHo6IHZlY3Rvci56XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gdmVjdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZVZlY3RvcjtcbiJdfQ==
