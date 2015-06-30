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