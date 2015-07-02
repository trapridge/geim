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