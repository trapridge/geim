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