let renderer = null,
scene = null,
camera = null,
root = null,
robots = [],
robot = null,
group = null,
score = 0
indexCLicked = null,
mouse = new THREE.Vector3(),
duration = 2000, // ms
currentTime = Date.now(),
spotLight = null,
robotGroup = null,
ambientLight = null,
mapUrl = "images/futground.jpg",
CLICKED = null,
animator = null,
loopAnimation = false

async function sleep(target, ms) {
    setTimeout(()=>{target.state="dead"}, ms)
}

function deadAnimation(robot) {
    animator = new KF.KeyFrameAnimator
    animator.init({
        interps:
            [
                {
                    keys:[0, .33, .66, 1],
                    values:[
                        {  y : 250 },
                        {  y : 500 },
                        {  y : 750},
                        {  y :1000 },
                    ],
                    target: robot.position
                },
            ],
        loop: loopAnimation,
        duration:duration,
        easing: TWEEN.Easing.Linear.None,
    })

    animator.start()
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

async function loadGLTF() {
    let gltfLoader = new THREE.GLTFLoader()
    let loader = promisifyLoader(gltfLoader)

    try {
        // Run_L, Threaten, back, idle
        let result = await loader.load("../models/gltf/robot/robot_walk.gltf")
        robot= result.scene.children[0]
        robot.scale.set(0.2, 0.2, 0.2)
        robot.position.x =  Math.random() * (800 - (-800))+ (-800)
        robot.position.y = - 4
        robot.position.z = Math.random() * (-450 - (-10000))+ (-10000)
        robot.state = "running"
        robot.traverse(child =>{
            if(child.isMesh)
            {
                child.castShadow = true
                child.receiveShadow = true
            }
        })
        robotGroup.add(robot)
        robot.mixer =  new THREE.AnimationMixer( robotGroup )
        robots.push(robot)
        robot.mixer.clipAction(result.animations[0], robot).setDuration(0.8).play()
    }
    catch(err)
    {
        console.error(err)
    }
}

async function loadManyGLTF(){
    for(let i = 0;i<20;i++){
        loadGLTF()
    }
}
async function animate() {
    let now = Date.now()
    let deltat = now - currentTime
    currentTime = now

    for(let robo of robots) {
        if(robo.state === "running"){
            robo.mixer.update(deltat * 0.002)
            robo.position.z += 0.5 * deltat
        }

        if (robo.position.z > 600) {
            var index = robots.indexOf(robo)
            if (index > -1) {
                robots.splice(index, 1)
            }
            robotGroup.remove(robo)
            score--
            var scoreH = document.getElementById("score")
            scoreH.innerHTML = "Score: " + score
        }

        if(robo.state ==="dying" ) {
            await sleep(robo, 500)
        }

        if(robo.state === "dead"){
            robotGroup.remove(robo)
        }
        indexCLicked = null

    }

    indexCLicked = null
}

function render() {
    renderer.render( scene, camera )
}

function countdown() {
    var seconds = 120
    function tick() {
        var counter = document.getElementById("counter")
        seconds--
        counter.innerHTML = "Time: " + (seconds <= 10 ? "0" : "") + String(seconds)
        if( seconds >= 0 ) {
            setTimeout(tick, 1000)
        } else {
            restart()
        }
    }
    tick()
}

function restart() {
    if (confirm("Do you want to restart the game?")) {
        location.reload()
    } else {
        window.location.href = "Menu.html"
    }
}

function run() {
    requestAnimationFrame(function() { run() })
    // Spin the cube for next frame
    animate()
    KF.update()
    render()
}

function createScene(canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create a new Three.js scene
    scene = new THREE.Scene()
    raycaster = new THREE.Raycaster()

    //Background
    const loader = new THREE.TextureLoader()
    loader.load('images/back.jpg' , function(texture)
    {
        scene.background = texture
    })

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true })
    renderer.setSize(canvas.width, canvas.height)
    // Turn on shadows
    renderer.shadowMap.enabled = true
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 1500 )
    camera.position.set(0, 300, 1200)
    camera.lookAt(scene.position)
    scene.add(camera)

    // Create a group to hold all the objects
    root = new THREE.Object3D

    // Create and add all the lights
    spotLight = new THREE.SpotLight( 0xffffff )
    spotLight.position.set( 100, 1000, 100 )
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 1024
    spotLight.shadow.mapSize.height = 1024
    //Shadow Effects
    spotLight.shadow.camera.near = 500
    spotLight.shadow.camera.far = 4000
    spotLight.shadow.camera.fov = 30
    root.add(spotLight)

    ambientLight = new THREE.AmbientLight ( 0x065F61, 1)
    root.add(ambientLight)

    //load objects
    loadManyGLTF()
    setInterval(loadManyGLTF,30000)

    // Create a group to hold the objects
    group = new THREE.Object3D
    root.add(group)

    // Create a group to hold the objects
    robotGroup = new THREE.Object3D

    // Create a texture map
    let map = new THREE.TextureLoader().load(mapUrl)
    map.wrapS = map.wrapT = THREE.RepeatWrapping
    map.repeat.set(8, 8)

    let color = 0xffffff

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(1800, 1500, 50, 50)
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}))

    mesh.rotation.x = -Math.PI / 2
    mesh.position.y = -4.02
    mesh.castShadow = false
    mesh.receiveShadow = true
    group.add( mesh )
    scene.add( root )

    // Now add the group to our scene
    scene.add( root )
    scene.add(robotGroup)
    document.addEventListener('mousedown', onDocumentMouseDown)
    window.addEventListener('resize', onWindowResize, false)
    countdown()
}

function onDocumentMouseDown(event) {
    event.preventDefault()
    x = (event.clientX / window.innerWidth) * 2 - 1
    y = -(event.clientY / window.innerHeight) * 2 + 1
    mouse.set(x, y)
    raycaster.setFromCamera(mouse, camera)
    let intersects = raycaster.intersectObjects(robotGroup.children, true)
    console.log("intersects", intersects)
    if ( intersects.length > 0 ) {

        CLICKED = intersects[ intersects.length - 1 ].object
        CLICKED.material.emissive.setHex( 0x1805FD )
        indexCLicked = robots.indexOf(CLICKED.parent)
        score ++
        robots[indexCLicked].state = "dying"
        var scoreH = document.getElementById("score")
        scoreH.innerHTML = "Score: " + score
        deadAnimation( robots[indexCLicked] )
    }
    CLICKED = null
}

