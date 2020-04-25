let renderer = null,
  scene = null,
  camera = null,
  root = null,
  group = null,
  objectList = [],
  orbitControls = null
directionalLight = null;

let duration = 10, // sec
  penguinAnimator = null,
  lightAnimator = null;

const objModelUrl = { obj: 'assets/penguin.obj', map: 'assets/peng_texture.jpg' };
const mapUrl = 'assets/snow.jpg'

function promisifyLoader(loader, onProgress) {
  function promiseLoader(url) {

    return new Promise((resolve, reject) => {

      loader.load(url, resolve, onProgress, reject);

    });
  }

  return {
    originalLoader: loader,
    load: promiseLoader,
  };
}

const onError = ((err) => { console.error(err); });

async function loadObj(objModelUrl, objectList) {
  const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

  try {
    const object = await objPromiseLoader.load(objModelUrl.obj);

    let texture = objModelUrl.hasOwnProperty('map') ? new THREE.TextureLoader().load(objModelUrl.map) : null;
    let normalMap = objModelUrl.hasOwnProperty('normalMap') ? new THREE.TextureLoader().load(objModelUrl.normalMap) : null;
    let specularMap = objModelUrl.hasOwnProperty('specularMap') ? new THREE.TextureLoader().load(objModelUrl.specularMap) : null;

    object.traverse(function (child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.map = texture;
        child.material.normalMap = normalMap;
        child.material.specularMap = specularMap;
      }
    });

    object.scale.set(1, 1, 1);
    object.position.z = 0;
    object.position.x = 0;
    object.position.y = 0
    object.name = "objObject";
    objectList.push(object);
    scene.add(object);

  }
  catch (err) {
    return onError(err);
  }
}

function playAnimations() {
  penguinAnimator = new KF.KeyFrameAnimator;
  penguinAnimator.init({
    interps: [
      {
        keys: [0, .125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
        values: [
          { x: 0, z: 0},
          { x: 30, z: 30 },
          { x: 0, z:  70},
          { x: -30, z: 30 },
          { x: 0, z: 0},
          { x: 30, z: -30 },
          { x: 0, z:  -70},
          { x: -30, z: -30 },
          { x: 0, z: 0},
        ],
        target: objectList[0].position
      },
      {
        keys: [
          0, 0.03125, 0.0625, 0.09375,0.125, 0.3, 0.5, .725, 0.865, 0.95
        ],
        values: [
          { y: 0},
          { y: 0.1},
          { y: 0.2,},
          { y: 0.3},
          { y: -1},
          { y:  -3},
          { y: - 3.5},
          { y: -2},
          { y: -0.5},
          { y: -0.1}
        ],
        target: objectList[0].rotation
      },
      {
        keys: [
          0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45,
          0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95 ,1
        ],
        values: [
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
          { z: 0.3},{ z: -0.3},
        ],
        target: objectList[0].rotation
      }
    ],
    loop: true,
    duration: duration * 1000,

  })
  penguinAnimator.start()
}

function run() {
  requestAnimationFrame(function () { run(); });

  // Render the scene
  renderer.render(scene, camera);

  // Spin the cube for next frame
  // TWEEN.update()
  //animate();
  KF.update();

  // Update the camera controller
  orbitControls.update();
}


function createScene(canvas) {
  // Create the Three.js renderer and attach it to our canvas
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

  // Set the viewport size
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Create a new Three.js scene
  scene = new THREE.Scene();

  // Add  a camera so we can view the scene
  camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
  camera.position.set(-2, 50, 200);
  scene.add(camera);

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

  // Create a group to hold all the objects
  root = new THREE.Object3D;

  // Add a directional light to show off the object
  directionalLight = new THREE.DirectionalLight(0xffffff, 1);

  // Create and add all the lights
  directionalLight.position.set(-2, 49, 100);
  root.add(directionalLight);

  ambientLight = new THREE.AmbientLight(0xffffff,0.5);
  root.add(ambientLight);

  // Create the objects
  loadObj(objModelUrl, objectList);


  // Create a group to hold the objects
  group = new THREE.Object3D;
  root.add(group);

  // Create a texture map
  let map = new THREE.TextureLoader().load(mapUrl);
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(8, 8);


  // Put in a ground plane to show off the lighting
  let geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
  let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: 0xffffff, map: map, side: THREE.DoubleSide }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0;
  group.add(mesh);

  scene.add(root);
}
