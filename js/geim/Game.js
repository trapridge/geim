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