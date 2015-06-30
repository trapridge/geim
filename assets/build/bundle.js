(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/geim/Game.js":[function(require,module,exports){
var getCharacter = require('./Character');
var getVector = require('./Vector');
var getPoint = require('./Point');

var player = getCharacter();
var characters = [
  player,
  //getCharacter(),
  getCharacter({
    position: getPoint({x: 0, y: -25, z: 0}),
    mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                         new THREE.MeshNormalMaterial())
  })
];


var container, camera, scene, renderer;

init();
gameLoop();

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
  camera.position.z = 400;
  //camera.position.y = 100;
  //camera.lookAt(new THREE.Vector3(0, -100, 0));

  scene = new THREE.Scene();

  characters.forEach(function(char) {
    scene.add(char.mesh);
  });

  var lineMaterial = new THREE.LineBasicMaterial( { color: 0x303030 } ),
  geometry = new THREE.Geometry(),
  floor = -75, step = 25;

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

function draw(delta) {
  characters.forEach(function(char) {
    char.draw(delta, renderer);
  });

  renderer.render(scene, camera);
}

function update(delta) {
  characters.forEach(function(char) {
    char.update(delta);
  });
}


//document.addEventListener('click', function (event) {
//
//  event.preventDefault();
//
//  if(characters[0].movement.x === 1) {
//    characters[0].movement.x = -1;
//    characters[0].movement.z = -1;
//    characters[0].setRotate(true);
//  }
//  else if(characters[0].movement.x === -1) {
//    characters[0].movement.x = 0;
//    characters[0].movement.z = 0;
//    characters[0].setRotate(false);
//  }
//  else {
//    characters[0].movement.x = 1;
//    characters[0].movement.z = 1;
//  }
//
//}, false);

var movementSensitivity = 3;

document.addEventListener('keydown', function(event) {
  switch(event.keyCode) {
    case 87: // w
      player.movement.z = -1 * movementSensitivity;
      break;
    case 65: // a
      player.movement.x = -1 * movementSensitivity;
      break;
    case 83: // s
      player.movement.z = 1 * movementSensitivity;
      break;
    case 68: // d
      player.movement.x = 1 * movementSensitivity;
      break;
  }

}, true);

document.addEventListener('keyup', function(event) {
  switch(event.keyCode) {
    case 87: // w
      player.movement.z = 0;
      break;
    case 65: // a
      player.movement.x = 0;
      break;
    case 83: // s
      player.movement.z = 0;
      break;
    case 68: // d
      player.movement.x = 0;
      break;
  }

}, true);

document.addEventListener('click', function (event) {
  console.log('hai');
}, false);
},{"./Character":"/Users/jansaharju/Code/geim/js/geim/Character.js","./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Character.js":[function(require,module,exports){
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
},{"./Point":"/Users/jansaharju/Code/geim/js/geim/Point.js","./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Point.js":[function(require,module,exports){
var getVector = require('./Vector');

var getPoint = function(spec) {
  'use strict';

  var defaults =  { x: 0, y: 0, z: 0 };

  spec = spec || defaults;

  var point = {};
  (function init() {
    point.x = spec.x || defaults.x;
    point.y = spec.y || defaults.y;
    point.z = spec.z || defaults.z;
  })();

  // METHODS
  point.addVector = function(vector) {
    point.x += vector.x;
    point.y += vector.y;
    point.z += vector.z;
    return point;
  };

  point.getVectorToPoint = function(fromPoint) {
    return getVector({
      x: point.x -= fromPoint.x,
      y: point.y -= fromPoint.y,
      z: point.z -= fromPoint.z
    });
  };

  point.getVectorFromPoint = function(toPoint) {
    return getVector({
      x: toPoint.x -= point.x,
      y: toPoint.y -= point.y,
      z: toPoint.z -= point.z
    });
  };

  point.log = function() {
    console.log('x', point.x);
    console.log('y', point.y);
    console.log('z', point.z);
  };

  return point;
}

module.exports = getPoint;
},{"./Vector":"/Users/jansaharju/Code/geim/js/geim/Vector.js"}],"/Users/jansaharju/Code/geim/js/geim/Vector.js":[function(require,module,exports){
var getVector = function(spec) {
  'use strict';

  var defaults = { x: 0, y: 0, z: 0 };
  spec = spec || defaults;

  var vector = {};
  (function init() {
    vector.x = spec.x || defaults.x;
    vector.y = spec.y || defaults.y;
    vector.z = spec.z || defaults.z;
  })();

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
    vector.x * scalar;
    vector.y * scalar;
    vector.z * scalar;
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

  vector.getNormalized = function() {
    var magnitude = vector.magnitude();
    return getVector({
      x: vector.x / magnitude,
      y: vector.y / magnitude,
      z: vector.z / magnitude
    });
  };

  vector.getCrossProduct = function(otherVector) {
    return getVector({
      x: vector.y * otherVector.z - vector.z * otherVector.y,
      y: vector.z * otherVector.x - vector.x * otherVector.z,
      z: vector.x * otherVector.y - vector.y * otherVector.x
    });
  };

  return vector;
}

module.exports = getVector;

},{}]},{},["./js/geim/Game.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuL2pzL2dlaW0vR2FtZS5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL0NoYXJhY3Rlci5qcyIsIi9Vc2Vycy9qYW5zYWhhcmp1L0NvZGUvZ2VpbS9qcy9nZWltL1BvaW50LmpzIiwiL1VzZXJzL2phbnNhaGFyanUvQ29kZS9nZWltL2pzL2dlaW0vVmVjdG9yLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGdldENoYXJhY3RlciA9IHJlcXVpcmUoJy4vQ2hhcmFjdGVyJyk7XG52YXIgZ2V0VmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcbnZhciBnZXRQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcblxudmFyIHBsYXllciA9IGdldENoYXJhY3RlcigpO1xudmFyIGNoYXJhY3RlcnMgPSBbXG4gIHBsYXllcixcbiAgLy9nZXRDaGFyYWN0ZXIoKSxcbiAgZ2V0Q2hhcmFjdGVyKHtcbiAgICBwb3NpdGlvbjogZ2V0UG9pbnQoe3g6IDAsIHk6IC0yNSwgejogMH0pLFxuICAgIG1lc2g6IG5ldyBUSFJFRS5NZXNoKG5ldyBUSFJFRS5Cb3hHZW9tZXRyeSg1MCwgMTAwLCA1MCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRIUkVFLk1lc2hOb3JtYWxNYXRlcmlhbCgpKVxuICB9KVxuXTtcblxuXG52YXIgY29udGFpbmVyLCBjYW1lcmEsIHNjZW5lLCByZW5kZXJlcjtcblxuaW5pdCgpO1xuZ2FtZUxvb3AoKTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKDcwLCB3aW5kb3cuaW5uZXJXaWR0aCAvIHdpbmRvdy5pbm5lckhlaWdodCwgMSwgMTAwMCk7XG4gIGNhbWVyYS5wb3NpdGlvbi56ID0gNDAwO1xuICAvL2NhbWVyYS5wb3NpdGlvbi55ID0gMTAwO1xuICAvL2NhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgLTEwMCwgMCkpO1xuXG4gIHNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgY2hhcmFjdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGNoYXIpIHtcbiAgICBzY2VuZS5hZGQoY2hhci5tZXNoKTtcbiAgfSk7XG5cbiAgdmFyIGxpbmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5MaW5lQmFzaWNNYXRlcmlhbCggeyBjb2xvcjogMHgzMDMwMzAgfSApLFxuICBnZW9tZXRyeSA9IG5ldyBUSFJFRS5HZW9tZXRyeSgpLFxuICBmbG9vciA9IC03NSwgc3RlcCA9IDI1O1xuXG4gIGZvciAoIHZhciBpID0gMDsgaSA8PSA0MDsgaSArKyApIHtcblxuICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2goIG5ldyBUSFJFRS5WZWN0b3IzKCAtIDUwMCwgZmxvb3IsIGkgKiBzdGVwIC0gNTAwICkgKTtcbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggICA1MDAsIGZsb29yLCBpICogc3RlcCAtIDUwMCApICk7XG5cbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAtNTAwICkgKTtcbiAgICBnZW9tZXRyeS52ZXJ0aWNlcy5wdXNoKCBuZXcgVEhSRUUuVmVjdG9yMyggaSAqIHN0ZXAgLSA1MDAsIGZsb29yLCAgNTAwICkgKTtcblxuICB9XG5cbiAgdmFyIGdyaWQgPSBuZXcgVEhSRUUuTGluZSggZ2VvbWV0cnksIGxpbmVNYXRlcmlhbCwgVEhSRUUuTGluZVBpZWNlcyApO1xuICBzY2VuZS5hZGQoZ3JpZCk7XG5cbiAgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXG4gIGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250YWluZXInKTtcbiAgY29udGFpbmVyLmFwcGVuZENoaWxkKHJlbmRlcmVyLmRvbUVsZW1lbnQpO1xufVxuXG52YXIgc3RhcnQsIGRlbHRhID0gMDtcbmZ1bmN0aW9uIGdhbWVMb29wKCkge1xuICBzdGFydCA9IERhdGUubm93KCk7XG4gIHVwZGF0ZShkZWx0YSk7XG4gIGRyYXcoZGVsdGEpO1xuICBkZWx0YSA9IERhdGUubm93KCkgLSBzdGFydDtcbiAgaWYoZGVsdGEgPCAxMCkgZGVsdGEgPSAxMDtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGdhbWVMb29wKTtcbn1cblxuZnVuY3Rpb24gZHJhdyhkZWx0YSkge1xuICBjaGFyYWN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcikge1xuICAgIGNoYXIuZHJhdyhkZWx0YSwgcmVuZGVyZXIpO1xuICB9KTtcblxuICByZW5kZXJlci5yZW5kZXIoc2NlbmUsIGNhbWVyYSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZShkZWx0YSkge1xuICBjaGFyYWN0ZXJzLmZvckVhY2goZnVuY3Rpb24oY2hhcikge1xuICAgIGNoYXIudXBkYXRlKGRlbHRhKTtcbiAgfSk7XG59XG5cblxuLy9kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuLy9cbi8vICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuLy9cbi8vICBpZihjaGFyYWN0ZXJzWzBdLm1vdmVtZW50LnggPT09IDEpIHtcbi8vICAgIGNoYXJhY3RlcnNbMF0ubW92ZW1lbnQueCA9IC0xO1xuLy8gICAgY2hhcmFjdGVyc1swXS5tb3ZlbWVudC56ID0gLTE7XG4vLyAgICBjaGFyYWN0ZXJzWzBdLnNldFJvdGF0ZSh0cnVlKTtcbi8vICB9XG4vLyAgZWxzZSBpZihjaGFyYWN0ZXJzWzBdLm1vdmVtZW50LnggPT09IC0xKSB7XG4vLyAgICBjaGFyYWN0ZXJzWzBdLm1vdmVtZW50LnggPSAwO1xuLy8gICAgY2hhcmFjdGVyc1swXS5tb3ZlbWVudC56ID0gMDtcbi8vICAgIGNoYXJhY3RlcnNbMF0uc2V0Um90YXRlKGZhbHNlKTtcbi8vICB9XG4vLyAgZWxzZSB7XG4vLyAgICBjaGFyYWN0ZXJzWzBdLm1vdmVtZW50LnggPSAxO1xuLy8gICAgY2hhcmFjdGVyc1swXS5tb3ZlbWVudC56ID0gMTtcbi8vICB9XG4vL1xuLy99LCBmYWxzZSk7XG5cbnZhciBtb3ZlbWVudFNlbnNpdGl2aXR5ID0gMztcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHN3aXRjaChldmVudC5rZXlDb2RlKSB7XG4gICAgY2FzZSA4NzogLy8gd1xuICAgICAgcGxheWVyLm1vdmVtZW50LnogPSAtMSAqIG1vdmVtZW50U2Vuc2l0aXZpdHk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDY1OiAvLyBhXG4gICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IC0xICogbW92ZW1lbnRTZW5zaXRpdml0eTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgODM6IC8vIHNcbiAgICAgIHBsYXllci5tb3ZlbWVudC56ID0gMSAqIG1vdmVtZW50U2Vuc2l0aXZpdHk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDY4OiAvLyBkXG4gICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IDEgKiBtb3ZlbWVudFNlbnNpdGl2aXR5O1xuICAgICAgYnJlYWs7XG4gIH1cblxufSwgdHJ1ZSk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgc3dpdGNoKGV2ZW50LmtleUNvZGUpIHtcbiAgICBjYXNlIDg3OiAvLyB3XG4gICAgICBwbGF5ZXIubW92ZW1lbnQueiA9IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDY1OiAvLyBhXG4gICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDgzOiAvLyBzXG4gICAgICBwbGF5ZXIubW92ZW1lbnQueiA9IDA7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDY4OiAvLyBkXG4gICAgICBwbGF5ZXIubW92ZW1lbnQueCA9IDA7XG4gICAgICBicmVhaztcbiAgfVxuXG59LCB0cnVlKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgY29uc29sZS5sb2coJ2hhaScpO1xufSwgZmFsc2UpOyIsInZhciBnZXRQb2ludCA9IHJlcXVpcmUoJy4vUG9pbnQnKTtcbnZhciBnZXRWZWN0b3IgPSByZXF1aXJlKCcuL1ZlY3RvcicpO1xuXG52YXIgZ2V0Q2hhcmFjdGVyID0gZnVuY3Rpb24gKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBwb3NpdGlvbjogZ2V0UG9pbnQoKSxcbiAgICBtb3ZlbWVudDogZ2V0VmVjdG9yKCksXG4gICAgbWVzaDogbmV3IFRIUkVFLk1lc2gobmV3IFRIUkVFLkJveEdlb21ldHJ5KDUwLCA1MCwgNTApLFxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBUSFJFRS5NZXNoTm9ybWFsTWF0ZXJpYWwoKSksXG4gICAgaGVhbHRoOiAxMDAsXG4gICAgdmlzaWJsZTogdHJ1ZSxcbiAgICByb3RhdGluZzogZmFsc2VcbiAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG5cbiAgdmFyIGNoYXJhY3RlciA9IHt9O1xuICAoZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjaGFyYWN0ZXIucG9zaXRpb24gPSBzcGVjLnBvc2l0aW9uIHx8IGRlZmF1bHRzLnBvc2l0aW9uO1xuICAgIGNoYXJhY3Rlci5tb3ZlbWVudCA9IHNwZWMubW92ZW1lbnQgfHwgZGVmYXVsdHMubW92ZW1lbnQ7XG4gICAgY2hhcmFjdGVyLm1lc2ggPSBzcGVjLm1lc2ggfHwgZGVmYXVsdHMubWVzaDtcbiAgICBjaGFyYWN0ZXIuaGVhbHRoID0gc3BlYy5oZWFsdGggfHwgZGVmYXVsdHMuaGVhbHRoO1xuICAgIGNoYXJhY3Rlci52aXNpYmxlID0gc3BlYy52aXNpYmxlIHx8IGRlZmF1bHRzLnZpc2libGU7XG4gICAgY2hhcmFjdGVyLnJvdGF0aW5nID0gc3BlYy5yb3RhdGluZyB8fCBkZWZhdWx0cy5yb3RhdGluZztcbiAgICB1cGRhdGVNZXNoUG9zaXRpb24oY2hhcmFjdGVyLnBvc2l0aW9uLCBjaGFyYWN0ZXIubWVzaCk7XG4gIH0pKCk7XG5cbiAgLy8gTUVUSE9EU1xuICBjaGFyYWN0ZXIudXBkYXRlID0gZnVuY3Rpb24oZGVsdGEpIHtcbiAgICB1cGRhdGVNZXNoUG9zaXRpb24oY2hhcmFjdGVyLnBvc2l0aW9uLmFkZFZlY3RvcihjaGFyYWN0ZXIubW92ZW1lbnQpLFxuICAgICAgICAgICAgICAgICAgICAgICBjaGFyYWN0ZXIubWVzaCk7XG5cbiAgICBpZihjaGFyYWN0ZXIucm90YXRpbmcpIHtcbiAgICAgIGNoYXJhY3Rlci5tZXNoLnJvdGF0aW9uLnkgKz0gMC4wMjI1O1xuICAgIH1cbiAgfTtcblxuICBjaGFyYWN0ZXIuZHJhdyA9IGZ1bmN0aW9uKGRlbHRhLCByZW5kZXJlcikge1xuICAgIC8vIG1lc2ggZHJhd24gYXMgcGFydCBvZiBzY2VuZSBpbiBHYW1lLmpzXG4gIH07XG5cbiAgY2hhcmFjdGVyLnNldFJvdGF0ZSA9IGZ1bmN0aW9uKHJvdGF0ZSkge1xuICAgIGNoYXJhY3Rlci5yb3RhdGluZyA9IHJvdGF0ZTtcbiAgfTtcblxuICAvLyBIRUxQRVJTXG4gIGZ1bmN0aW9uIHVwZGF0ZU1lc2hQb3NpdGlvbihwb2ludCwgbWVzaCkge1xuICAgIG1lc2gucG9zaXRpb24ueCA9IHBvaW50Lng7XG4gICAgbWVzaC5wb3NpdGlvbi55ID0gcG9pbnQueTtcbiAgICBtZXNoLnBvc2l0aW9uLnogPSBwb2ludC56O1xuICB9XG5cbiAgcmV0dXJuIGNoYXJhY3Rlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRDaGFyYWN0ZXI7IiwidmFyIGdldFZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XG5cbnZhciBnZXRQb2ludCA9IGZ1bmN0aW9uKHNwZWMpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBkZWZhdWx0cyA9ICB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcblxuICBzcGVjID0gc3BlYyB8fCBkZWZhdWx0cztcblxuICB2YXIgcG9pbnQgPSB7fTtcbiAgKGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgcG9pbnQueCA9IHNwZWMueCB8fCBkZWZhdWx0cy54O1xuICAgIHBvaW50LnkgPSBzcGVjLnkgfHwgZGVmYXVsdHMueTtcbiAgICBwb2ludC56ID0gc3BlYy56IHx8IGRlZmF1bHRzLno7XG4gIH0pKCk7XG5cbiAgLy8gTUVUSE9EU1xuICBwb2ludC5hZGRWZWN0b3IgPSBmdW5jdGlvbih2ZWN0b3IpIHtcbiAgICBwb2ludC54ICs9IHZlY3Rvci54O1xuICAgIHBvaW50LnkgKz0gdmVjdG9yLnk7XG4gICAgcG9pbnQueiArPSB2ZWN0b3IuejtcbiAgICByZXR1cm4gcG9pbnQ7XG4gIH07XG5cbiAgcG9pbnQuZ2V0VmVjdG9yVG9Qb2ludCA9IGZ1bmN0aW9uKGZyb21Qb2ludCkge1xuICAgIHJldHVybiBnZXRWZWN0b3Ioe1xuICAgICAgeDogcG9pbnQueCAtPSBmcm9tUG9pbnQueCxcbiAgICAgIHk6IHBvaW50LnkgLT0gZnJvbVBvaW50LnksXG4gICAgICB6OiBwb2ludC56IC09IGZyb21Qb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQuZ2V0VmVjdG9yRnJvbVBvaW50ID0gZnVuY3Rpb24odG9Qb2ludCkge1xuICAgIHJldHVybiBnZXRWZWN0b3Ioe1xuICAgICAgeDogdG9Qb2ludC54IC09IHBvaW50LngsXG4gICAgICB5OiB0b1BvaW50LnkgLT0gcG9pbnQueSxcbiAgICAgIHo6IHRvUG9pbnQueiAtPSBwb2ludC56XG4gICAgfSk7XG4gIH07XG5cbiAgcG9pbnQubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ3gnLCBwb2ludC54KTtcbiAgICBjb25zb2xlLmxvZygneScsIHBvaW50LnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgcG9pbnQueik7XG4gIH07XG5cbiAgcmV0dXJuIHBvaW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFBvaW50OyIsInZhciBnZXRWZWN0b3IgPSBmdW5jdGlvbihzcGVjKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgZGVmYXVsdHMgPSB7IHg6IDAsIHk6IDAsIHo6IDAgfTtcbiAgc3BlYyA9IHNwZWMgfHwgZGVmYXVsdHM7XG5cbiAgdmFyIHZlY3RvciA9IHt9O1xuICAoZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB2ZWN0b3IueCA9IHNwZWMueCB8fCBkZWZhdWx0cy54O1xuICAgIHZlY3Rvci55ID0gc3BlYy55IHx8IGRlZmF1bHRzLnk7XG4gICAgdmVjdG9yLnogPSBzcGVjLnogfHwgZGVmYXVsdHMuejtcbiAgfSkoKTtcblxuICAvLyBNRVRIT0RTXG4gIHZlY3Rvci5tYWduaXR1ZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCkpO1xuICB9O1xuXG4gIHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgfTtcblxuICB2ZWN0b3IuYWRkVG9WZWN0b3IgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHZlY3Rvci54ICs9IG90aGVyVmVjdG9yLngsXG4gICAgdmVjdG9yLnkgKz0gb3RoZXJWZWN0b3IueSxcbiAgICB2ZWN0b3IueiArPSBvdGhlclZlY3Rvci56XG4gICAgcmV0dXJuIHZlY3RvcjtcbiAgfTtcblxuICB2ZWN0b3Iuc3Vic3RyYWN0RnJvbVZlY3RvciA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgdmVjdG9yLnggLT0gb3RoZXJWZWN0b3IueCxcbiAgICB2ZWN0b3IueSAtPSBvdGhlclZlY3Rvci55LFxuICAgIHZlY3Rvci56IC09IG90aGVyVmVjdG9yLnpcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9O1xuXG4gIHZlY3Rvci5zY2FsZSA9IGZ1bmN0aW9uKHNjYWxhcikge1xuICAgIHZlY3Rvci54ICogc2NhbGFyO1xuICAgIHZlY3Rvci55ICogc2NhbGFyO1xuICAgIHZlY3Rvci56ICogc2NhbGFyO1xuICAgIHJldHVybiB2ZWN0b3I7XG4gIH07XG5cbiAgdmVjdG9yLnJldmVyc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2ZWN0b3IueCAqPSAtMTtcbiAgICB2ZWN0b3IueSAqPSAtMTtcbiAgICB2ZWN0b3IueiAqPSAtMTtcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9XG5cbiAgdmVjdG9yLmRvdFByb2R1Y3QgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHJldHVybiB2ZWN0b3IueCAqIG90aGVyVmVjdG9yLnggK1xuICAgICAgICAgICAgdmVjdG9yLnkgKiBvdGhlclZlY3Rvci55ICtcbiAgICAgICAgICAgIHZlY3Rvci56ICogb3RoZXJWZWN0b3IuejtcbiAgfTtcblxuICB2ZWN0b3IubG9uZ2VyVGhhbiA9IGZ1bmN0aW9uKG90aGVyVmVjdG9yKSB7XG4gICAgcmV0dXJuIHZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCkgPiBvdGhlclZlY3Rvci5tYWduaXR1ZGVTcXVhcmVkKCk7XG4gIH07XG5cbiAgdmVjdG9yLnplcm8gPSBmdW5jdGlvbigpIHtcbiAgICB2ZWN0b3IueCA9IDA7XG4gICAgdmVjdG9yLnkgPSAwO1xuICAgIHZlY3Rvci56ID0gMDtcbiAgICByZXR1cm4gdmVjdG9yO1xuICB9XG5cbiAgdmVjdG9yLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCd4JywgdmVjdG9yLngpO1xuICAgIGNvbnNvbGUubG9nKCd5JywgdmVjdG9yLnkpO1xuICAgIGNvbnNvbGUubG9nKCd6JywgdmVjdG9yLnopO1xuICB9O1xuXG4gIHZlY3Rvci5nZXROb3JtYWxpemVkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hZ25pdHVkZSA9IHZlY3Rvci5tYWduaXR1ZGUoKTtcbiAgICByZXR1cm4gZ2V0VmVjdG9yKHtcbiAgICAgIHg6IHZlY3Rvci54IC8gbWFnbml0dWRlLFxuICAgICAgeTogdmVjdG9yLnkgLyBtYWduaXR1ZGUsXG4gICAgICB6OiB2ZWN0b3IueiAvIG1hZ25pdHVkZVxuICAgIH0pO1xuICB9O1xuXG4gIHZlY3Rvci5nZXRDcm9zc1Byb2R1Y3QgPSBmdW5jdGlvbihvdGhlclZlY3Rvcikge1xuICAgIHJldHVybiBnZXRWZWN0b3Ioe1xuICAgICAgeDogdmVjdG9yLnkgKiBvdGhlclZlY3Rvci56IC0gdmVjdG9yLnogKiBvdGhlclZlY3Rvci55LFxuICAgICAgeTogdmVjdG9yLnogKiBvdGhlclZlY3Rvci54IC0gdmVjdG9yLnggKiBvdGhlclZlY3Rvci56LFxuICAgICAgejogdmVjdG9yLnggKiBvdGhlclZlY3Rvci55IC0gdmVjdG9yLnkgKiBvdGhlclZlY3Rvci54XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIHZlY3Rvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWZWN0b3I7XG4iXX0=
