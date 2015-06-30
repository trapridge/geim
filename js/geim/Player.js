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