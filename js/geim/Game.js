var createCharacter = require('./Character');
var createPlayer = require('./Player');
var createVector = require('./Vector');
var createPoint = require('./Point');

var player = createPlayer({
  position: createPoint({x: 0, y: 0, z: 0}),
  mesh: new THREE.Mesh(new THREE.BoxGeometry(50, 100, 50),
                       new THREE.MeshBasicMaterial({ wireframe: true }))
});


player.viewAngle.toVector().log();
player.viewAngle.restrict();
player.viewAngle.toVector().log();

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

var container, camera, scene, renderer, line, axes;

init();
gameLoop();

function init() {

  camera = new THREE.PerspectiveCamera(70,
                                       window.innerWidth / window.innerHeight,
                                       1, 1000);
  camera.position.y = 50;
  camera.position.z = 100;

  console.log('initial', camera.position.x, camera.position.y, camera.position.z);

  scene = new THREE.Scene();

  axes = buildAxes( 1000 );
  scene.add(axes);

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

  // TODO: add axis

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
  // Separate logic to its own file
  var angle = player.viewAngle.clone();
  //angle.yaw += Math.PI/2;
  var v = angle.toVector().scale(200);
  var playerPosition = player.position.clone();
  var cameraPosition = playerPosition.addVector(v);
  camera.position.x = cameraPosition.x + 0;
  camera.position.y = cameraPosition.y + 50;
  camera.position.z = cameraPosition.z + 100;

  //camera.position.x = player.position.x;
  //camera.position.y = player.position.y + 100;
  //camera.position.z = player.position.z + 100;

  //console.log('camera', camera.position.x, camera.position.y, camera.position.z);
  //console.log('player', player.position.x, player.position.y, player.position.z);
  //console.log('player', player.mesh.position.x, player.mesh.position.y, player.mesh.position.z);

  camera.lookAt(player.mesh.position);

  // update nose
  // TODO: move to Player and update position indirectly
  var v = v.normalize().scale(500);
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

function buildAxes( length ) {
  var axes = new THREE.Object3D();

  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
  axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

  return axes;

}

function buildAxis( src, dst, colorHex, dashed ) {
  var geom = new THREE.Geometry(),
  mat;

  if(dashed) {
    mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3 });
  } else {
    mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
  }

  geom.vertices.push( src.clone() );
  geom.vertices.push( dst.clone() );
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  var axis = new THREE.Line( geom, mat, THREE.LinePieces );

  return axis;

}