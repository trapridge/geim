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