var createCharacter = require('./Character');
var createPlayer = require('./Player');
var createVector = require('./Vector');
var createPoint = require('./Point');

var player = createPlayer({
  position: createPoint({x: 0, y: 0, z: 0}),
  mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                       new THREE.MeshBasicMaterial({ wireframe: true }))
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

var container, camera, scene, renderer, line;

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
  var v = player.viewAngle.toVector().scale(150);
  var p = player.position.clone();
  var i = p.addVector(v);
  camera.position.z = i.z + 100;
  camera.position.x = i.x;
  camera.position.y = i.y + 50;
  camera.lookAt(player.mesh.position);

  // update nose
  player.viewAngle.log();
  var v = v.createNormalized().scale(100);
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


var mouseSensitivity = 0.01, lastX = 0, lastY = 0;
document.addEventListener('mousemove', function(event) {
  if(lastX > 0 && lastY > 0 && mouseDown) {
    var movedX = event.screenX - lastX;
    var movedY = event.screenY - lastY;

    // update player's view angle
    player.viewAngle.pitch += movedY * mouseSensitivity;
    player.viewAngle.yaw += movedX * mouseSensitivity;
    player.viewAngle.normalize();

    //console.log('angles', player.viewAngle.pitch * (180/Math.PI), player.viewAngle.yaw * (180/Math.PI));
  }
  lastX = event.screenX;
  lastY = event.screenY;
}, false);

var mouseDown = false;
document.addEventListener('mousedown', function(event) {
  mouseDown = true;
}, false);

document.addEventListener('mouseup', function(event) {
  mouseDown = false;
}, false);