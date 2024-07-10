let scene, camera, renderer, model;
const container = document.getElementById('container');

init();
animate();

function init() {
    console.log('Initializing scene...');
    // Scene setup
    scene = new THREE.Scene();
    console.log('Scene created.');

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 2);
    console.log('Camera initialized.');

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff); // Set background to white
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    console.log('Renderer initialized.');

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);
    console.log('Ambient light added.');

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    console.log('Directional light added.');

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load('sony_gv-8_video_walkman copy/scene.gltf', function(gltf) {
        console.log('Model loaded successfully.');
        model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(1, 1, 1);
        scene.add(model);
        setupModelControls();
    }, undefined, function (error) {
        console.error('Error loading model:', error);
    });

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Resume audio context on first user interaction
    window.addEventListener('click', () => {
        if (Howler && Howler.ctx && Howler.ctx.state === 'suspended') {
            Howler.ctx.resume().then(() => {
                console.log('Audio context resumed.');
            }).catch((err) => {
                console.error('Error resuming audio context:', err);
            });
        }
    });
}

function setupModelControls() {
    if (!model) {
        console.error('Model is not loaded.');
        return;
    }

    const playButton = model.getObjectByName('pCylinder1_Case1_0');
    const pauseButton = model.getObjectByName('pSphere1_Case1_0');
    const forwardButton = model.getObjectByName('pSphere3_Case1_0');
    const backwardButton = model.getObjectByName('pSphere2_Case1_0');

    if (!playButton || !pauseButton || !forwardButton || !backwardButton) {
        console.error('One or more buttons are not found on the model.');
        return;
    }

    const sounds = new Howl({
        src: ['Audio/11_WIP_.mp3', 'Audio/86_WIP_.mp3', 'Audio/90_V1_WIP_.mp3', 'Audio/91_WIP_.mp3'],
        sprite: {
            play: [0, 30000], // Assuming 30 seconds for example
            pause: [0, 0], // Pause doesn't need a sprite
            forward: [15000, 30000], // Play from 15s to 45s
            backward: [0, 15000] // Play from 0s to 15s
        }
    });

    playButton.userData = { action: () => { console.log('Play button pressed.'); sounds.play('play'); } };
    pauseButton.userData = { action: () => { console.log('Pause button pressed.'); sounds.pause(); } };
    forwardButton.userData = { action: () => { console.log('Forward button pressed.'); sounds.play('forward'); } };
    backwardButton.userData = { action: () => { console.log('Backward button pressed.'); sounds.play('backward'); } };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onDocumentMouseDown(event) {
        event.preventDefault();
        console.log('Mouse down event detected.');

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
