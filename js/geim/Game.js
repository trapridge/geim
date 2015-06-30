var createCharacter = require('./Character');
var createPlayer = require('./Player');
var createPoint = require('./Point');

var player = createPlayer({
  position: createPoint({x: 0, y: 0, z: 0}),
  mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                       new THREE.MeshNormalMaterial())
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

var container, camera, scene, renderer;

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
  var v = player.viewAngle.toVector().scale(150);
  //v.log();
  var p = player.position.clone();
  //p.log();
  var i = p.addVector(v);
  camera.position.z = i.z + 200;
  camera.position.x = i.x;
  camera.position.y = i.y + 50;

  //console.log(camera.position.x);

  camera.lookAt(player.mesh.position);

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
  if(lastX > 0 && lastY > 0) {
    var movedX = event.screenX - lastX;
    var movedY = event.screenY - lastY;

    //player.mesh.rotation.x += movedX * mouseSensitivity;

    //camera.position.y -= movedY;
    //camera.lookAt(player.mesh.position);
    //player.mesh.rotation.y -= movedX * mouseSensitivity;

    player.viewAngle.pitch += movedY * mouseSensitivity;
    player.viewAngle.yaw += movedX * mouseSensitivity;


    console.log('angles', player.viewAngle.pitch * (180/Math.PI), player.viewAngle.yaw * (180/Math.PI));
  }
  lastX = event.screenX;
  lastY = event.screenY;
}, false);