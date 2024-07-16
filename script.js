// script.js

const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader1 = `
uniform float iTime;
uniform vec2 iResolution;
varying vec2 vUv;

float colormap_red(float x) {
    return (x < 0.0) ? 54.0 / 255.0 : (x < 20049.0 / 82979.0) ? (829.79 * x + 54.51) / 255.0 : 1.0;
}

float colormap_green(float x) {
    if (x < 20049.0 / 82979.0) return 0.0;
    if (x < 327013.0 / 810990.0) return (8546482679670.0 / 10875673217.0 * x - 2064961390770.0 / 10875673217.0) / 255.0;
    return (x <= 1.0) ? (103806720.0 / 483977.0 * x + 19607415.0 / 483977.0) / 255.0 : 1.0;
}

float colormap_blue(float x) {
    if (x < 0.0) return 54.0 / 255.0;
    if (x < 7249.0 / 82979.0) return (829.79 * x + 54.51) / 255.0;
    if (x < 20049.0 / 82979.0) return 127.0 / 255.0;
    return (x < 327013.0 / 810990.0) ? (792.02249341361393720147485376583 * x - 64.364790735602331034989206222672) / 255.0 : 1.0;
}

vec4 colormap(float x) {
    return vec4(colormap_red(x), colormap_green(x), colormap_blue(x), 1.0);
}

float rand(vec2 n) { 
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p){
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u*u*(3.0-2.0*u);
    return mix(mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x), mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y)*noise(p+2.02*iTime);
}

const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm(vec2 p) {
    float f = 0.0;
    for (int i = 0; i < 8; i++) {
        f += pow(0.5, float(i)) * noise(p);
        p = mtx * p * 2.0;
    }
    return f / 0.96875;
}

float pattern(vec2 p) {
    return fbm(p + fbm(p + fbm(p)));
}

void main() {
    vec2 uv = vUv * iResolution.xy;
    float shade = pattern(uv);
    gl_FragColor = vec4(colormap(shade).rgb, shade);
}
`;

const fragmentShader2 = `
uniform float iTime;
uniform vec2 iResolution;
varying vec2 vUv;

void main() {
    vec2 uv = vUv * iResolution.xy;
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));
    gl_FragColor = vec4(col, 1.0);
}
`;

const shaderMaterial1 = createShaderMaterial(fragmentShader1);
const shaderMaterial2 = createShaderMaterial(fragmentShader2);
let video, videoTexture, videoMaterial, scene, camera, renderer, model, controls, listener, sound;
let audioFiles = ['Audio/11_WIP_.mp3', 'Audio/86_WIP_.mp3', 'Audio/90 V1_WIP_.mp3', 'Audio/91_WIP_.mp3'];
let currentAudioIndex = 0, Glass2, Glass2_Glass1_0;

init();

function init() {
    initializeScene();
    initializeCamera();
    initializeRenderer();
    initializeLights();
    createLoadingScreen();
    loadResources();
    loadModel();
    setupAudio();
    setupVideo();
    setupEventListeners();
}

function initializeScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
}

function initializeCamera() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(0, 50, 20);
}

function initializeRenderer() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0x1a1a1a);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('container').appendChild(renderer.domElement);
}

function initializeLights() {
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
    const loader = new THREE.GLTFLoader();
    loader.load('Buttons/Buttons2.gltf', (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(400, 400, 400);
        scene.add(model);
        setupControls();
        setupModelControls();
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('container').style.display = 'block';
        animate(); // Start the animation loop after everything is set up
    }, undefined, (error) => console.error('Error loading model:', error));
}

function setupControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
}

function setupModelControls() {
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
    shaderMaterial1.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
    shaderMaterial2.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update(); // Ensure controls are defined before calling update
    }
    const time = performance.now() / 1000;
    shaderMaterial1.uniforms.iTime.value = time;
    shaderMaterial2.uniforms.iTime.value = time;
    renderer.render(scene, camera);
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
    if (video && !video.paused) video.pause();
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
    if (url === audioFiles[1]) {
        applyMaterial(shaderMaterial2);
    } else if (url === audioFiles[2]) {
        applyMaterial(videoMaterial);
        video.play();
    } else {
        applyMaterial(shaderMaterial1);
    }
}

function applyMaterial(material) {
    if (Glass2 && Glass2_Glass1_0) {
        Glass2.material = material;
        Glass2_Glass1_0.material = material;
    } else {
        console.error('Glass2 or Glass2_Glass1_0 is not defined');
    }
}

function createShaderMaterial(fragmentShader) {
    return new THREE.ShaderMaterial({
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
}

function setupAudio() {
    listener = new THREE.AudioListener();
    camera.add(listener);
    audioLoader = new THREE.AudioLoader();
}

function setupVideo() {
    video = document.createElement('video');
    video.src = 'Untitled.mp4';
    video.load();
    video.loop = true;
    videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;
    videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });
}

function loadResources() {
    // Simulate resource loading with a percentage counter
    let loaded = 0;
    const total = 100; // Adjust based on actual resources

    const interval = setInterval(() => {
        loaded++;
        updateLoadingPercentage(loaded);
        if (loaded >= total) {
            clearInterval(interval);
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('container').style.display = 'block';
        }
    }, 50); // Adjust timing as necessary
}

function updateLoadingPercentage(percent) {
    const loadingPercentElement = document.getElementById('loadingPercent');
    if (loadingPercentElement) {
        loadingPercentElement.innerText = percent + '%';
    }
}

function createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.innerHTML = '<div id="loadingText">Loading... <span id="loadingPercent">0%</span></div>';
    document.body.appendChild(loadingScreen);
}
