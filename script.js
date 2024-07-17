// script.js

let scene, camera, renderer, model, controls, listener, sound, audioLoader;
let audioFiles = ['Audio/11_WIP_.mp3', 'Audio/86_WIP_.mp3', 'Audio/90 V1_WIP_.mp3', 'Audio/91_WIP_.mp3'];
let currentAudioIndex = 0, Glass2, Glass2_Glass1_0;

function init() {
    console.log('Initializing scene...');
    initializeScene();
    initializeCamera();
    initializeRenderer();
    initializeLights();
    setupAudio();
    setupEventListeners();
    loadModel();
}

function initializeScene() {
    console.log('Initializing scene...');
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
}

function initializeCamera() {
    console.log('Initializing camera...');
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 50, 20);
}

function initializeRenderer() {
    console.log('Initializing renderer...');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x1a1a1a);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
}

function initializeLights() {
    console.log('Initializing lights...');
    scene.add(new THREE.AmbientLight(0xffffff, 2));
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 200, 0);
    scene.add(hemiLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight1.position.set(1, 1, 1).normalize();
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
    dirLight2.position.set(-1, -1, -1).normalize();
    scene.add(dirLight2);
}

function loadModel() {
    console.log('Loading model...');
    const loader = new THREE.GLTFLoader();
    loader.load('Buttons/Buttons2.gltf', (gltf) => {
        console.log('Model loaded');
        model = gltf.scene;
        console.log(model); // Log the model to check its structure
        model.position.set(0, 0, 0);
        model.scale.set(400, 400, 400);
        scene.add(model);
        setupControls();
        setupModelControls();
    }, undefined, (error) => console.error('Error loading model:', error));
}

function setupControls() {
    console.log('Setting up controls...');
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
}

function setupModelControls() {
    console.log('Setting up model controls...');
    const playButton = model.getObjectByName('PlayButton');
    const pauseButton = model.getObjectByName('PauseButton');
    const forwardButton = model.getObjectByName('ForwardButton');
    const backwardButton = model.getObjectByName('BackwardButton');
    Glass2 = model.getObjectByName('Glass2');
    Glass2_Glass1_0 = model.getObjectByName('Glass2_Glass1_0');

    if (!playButton || !pauseButton || !forwardButton || !backwardButton || !Glass2 || !Glass2_Glass1_0) {
        console.error('One or more buttons or the screen textures are not found on the model.');
        return;
    }

    playButton.userData = { action: () => playAudio(audioFiles[currentAudioIndex]) };
    pauseButton.userData = { action: pauseAudio };
    forwardButton.userData = { action: nextAudio };
    backwardButton.userData = { action: previousAudio };

    window.addEventListener('mousedown', onDocumentMouseDown, false);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(model.children, true);
    if (intersects.length > 0 && intersects[0].object.userData.action) {
        intersects[0].object.userData.action();
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render(); // Render the scene after resizing
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    if (!scene || !camera) {
        console.error('Scene or camera is not defined');
        return;
    }
    try {
        controls.update(); // Update controls for damping to work
        renderer.render(scene, camera);
    } catch (error) {
        console.error('Error during rendering:', error);
    }
}

function playAudio(url) {
    if (!sound) {
        sound = new THREE.Audio(listener);
    }
    if (sound.isPlaying) sound.stop();
    audioLoader.load(url, (buffer) => {
        sound.setBuffer(buffer);
        sound.play();
    });
    updateMaterials(url);
}

function pauseAudio() {
    if (sound && sound.isPlaying) sound.pause();
}

function nextAudio() {
    currentAudioIndex = (currentAudioIndex + 1) % audioFiles.length;
    playAudio(audioFiles[currentAudioIndex]);
}

function previousAudio() {
    currentAudioIndex = (currentAudioIndex - 1 + audioFiles.length) % audioFiles.length;
    playAudio(audioFiles[currentAudioIndex]);
}

function updateMaterials(url) {
    // Custom material updates based on audio file
}

function setupAudio() {
    console.log('Setting up audio...');
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader();
}

// Initialize the scene and start the animation loop
init();
animate();
