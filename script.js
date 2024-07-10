let scene, camera, renderer, model;
const container = document.getElementById('container');

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 2);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load('scene.gltf', function(gltf) {
        model = gltf.scene;
        scene.add(model);
        setupModelControls();
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function setupModelControls() {
    const playButton = model.getObjectByName('pCylinder1_Case1_0');
    const pauseButton = model.getObjectByName('pSphere1_Case1_0');
    const forwardButton = model.getObjectByName('pSphere3_Case1_0');
    const backwardButton = model.getObjectByName('pSphere2_Case1_0');

    const sounds = new Howl({
        src: ['Audio/11_WIP_.mp3', 'Audio/86_WIP_.mp3', 'Audio/90_V1_WIP_.mp3', 'Audio/91_WIP_.mp3'],
        sprite: {
            play: [0, 30000], // Assuming 30 seconds for example
            pause: [0, 0], // Pause doesn't need a sprite
            forward: [15000, 30000], // Play from 15s to 45s
            backward: [0, 15000] // Play from 0s to 15s
        }
    });

    playButton.userData = { action: () => sounds.play('play') };
    pauseButton.userData = { action: () => sounds.pause() };
    forwardButton.userData = { action: () => sounds.play('forward') };
    backwardButton.userData = { action: () => sounds.play('backward') };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onDocumentMouseDown(event) {
        event.preventDefault();

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(model.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            if (object.userData.action) {
                object.userData.action();
            }
        }
    }

    window.addEventListener('mousedown', onDocumentMouseDown, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
