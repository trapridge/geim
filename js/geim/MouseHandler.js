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

