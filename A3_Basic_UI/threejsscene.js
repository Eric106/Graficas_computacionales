let renderer = null,
scene = null, 
camera = null;
//canvas limits
let topY = 2;
let botY = -2;
let botX = -5;
let topX = 5;
let topZ = 0;
let botZ = -30;
let topZSat = 1;
let botZSat = -2;
//render velocity
let duration = 5000; // ms
let currentTime = Date.now();
let mainGroup = null;
let lastIndexFig = 0;
let indexOfOrder = 0;

function animate() 
{
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    let fract = deltat / duration;
    let angle = Math.PI * 2 * fract;

    for (let i = 0; i < mainGroup.children.length; i++){
        mainGroup.children[i].rotation.y += angle;
        for (let j = 0; j < mainGroup.children[i].children.length; j++){
            mainGroup.children[i].children[j].rotation.y += angle;
            mainGroup.children[i].children[j].rotation.x += angle;
        }
    }
}

function run() {
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Spin the cube for next frame
    animate();
}

function createScene(canvas){
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color( 0.2, 0.2, 0.2 );
    // scene.background = new THREE.Color( "rgb(100, 100, 100)" );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.z = 10;
    scene.add(camera);

    // Add a directional light to show off the objects
    let light = new THREE.DirectionalLight( 0xffffff, 1.0);
    // let light = new THREE.DirectionalLight( "rgb(255, 255, 100)", 1.5);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0,-2,0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    let ambientLight = new THREE.AmbientLight(0xffccaa, 0.3);
    scene.add(ambientLight);
    mainGroup =  new THREE.Object3D();
    addMouseHandler(canvas, mainGroup);
}


function addFigure (){
    indexOfOrder += 1;
    let fig = null;
    let rand = (Math.random() * (+topX - +botX)) + +botX;
    let rand2 = (Math.random() * (+topY - +botY)) + +botY;
    let rand3 = (Math.random() * (+topZ - +botZ)) + +botZ;
    if (indexOfOrder === 1){
        let geometry = new THREE.SphereGeometry(1, 20, 20);
        let textureUrl = "../images/earth_specular_spec_1k.jpg";
        let texture = new THREE.TextureLoader().load(textureUrl);
        let material = new THREE.MeshPhongMaterial({map: texture});
        fig = new THREE.Mesh(geometry, material);
        fig.rotation.x = Math.PI / 5;
        fig.rotation.y = Math.PI / 5;
        fig.position.set(rand, rand2, rand3);
    }
    else if (indexOfOrder === 2){
        let geometry = new THREE.IcosahedronGeometry(1, 0);
        //Material
        let textureUrl2 = "../images/floor15.jpg";
        let texture2 = new THREE.TextureLoader().load(textureUrl2);
        let material2 = new THREE.MeshPhongMaterial({map: texture2});
        fig = new THREE.Mesh(geometry, material2);
        fig.rotation.x = Math.PI / 5;
        fig.rotation.y = Math.PI / 5;
        fig.position.set(rand, rand2, rand3);
    }
    else if (indexOfOrder === 3){
        let geometry = new THREE.OctahedronGeometry(1, 0);
        let textureUrl3 = "../images/water_texture_2.jpg";
        let texture3 = new THREE.TextureLoader().load(textureUrl3);
        let material3 = new THREE.MeshPhongMaterial({map: texture3});
        fig = new THREE.Mesh(geometry, material3);
        fig.rotation.x = Math.PI / 5;
        fig.rotation.y = Math.PI / 5;
        fig.position.set(rand, rand2, rand3);
    }
    else if (indexOfOrder === 4){
        let geometry = new THREE.TorusKnotGeometry( 1, 0.4, 64, 8 );
        let textureUrl4 = "../images/escamas.jpg";
        let texture4 = new THREE.TextureLoader().load(textureUrl4);
        let material4 = new THREE.MeshPhongMaterial({ map: texture4 });
        fig = new THREE.Mesh( geometry, material4);
        fig.rotation.x = Math.PI / 5;
        fig.rotation.y = Math.PI / 5;
        fig.position.set(rand, rand2, rand3);
        indexOfOrder = 0;
    }
    mainGroup.add( fig );
    scene.add( mainGroup );
  }

function addSatelite() {
    let fig = null;
    let rand = (Math.random() * (+topX - +botX)) + +botX;
    let rand2 = (Math.random() * (+topY - +botY)) + +botY;
    let rand3 = (Math.random() * (+topZSat - +botZSat)) + +botZSat;

    if (mainGroup.children.length > 0){
        let geometry = new THREE.SphereGeometry(0.5, 20, 20);
        let textureUrl = "../images/moon_bump.jpg";
        let texture = new THREE.TextureLoader().load(textureUrl);
        let material = new THREE.MeshPhongMaterial({map: texture});
        fig = new THREE.Mesh(geometry, material);
        fig.rotation.x = Math.PI / 5;
        fig.rotation.y = Math.PI / 5;

        if (mainGroup.children.length > 0){
            lastIndexFig = mainGroup.children.length;
        }
        obj = mainGroup.children[lastIndexFig-1];
        fig.position.set(rand, rand2, rand3);
        obj.add(fig);

        if (lastIndexFig == 0){
            lastIndexFig = mainGroup.children.length;
        } else{
            lastIndexFig--;
        }
    }
}

function restart() {
    for(let i = mainGroup.children.length; 0 <= i; i--){
        mainGroup.remove(mainGroup.children[i]);
    }
}