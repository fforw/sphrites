import raf from "raf"
// noinspection ES6UnusedImports
import STYLE from "./style.css"
import {
    CubeCamera,
    DirectionalLight,
    PerspectiveCamera,
    Scene,
    Sprite,
    SpriteMaterial,
    sRGBEncoding,
    WebGLRenderer
} from "three"

import { Sky } from "three/examples/jsm/objects/Sky.js";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import loadTexture from "./loadTexture";


const SKY_EFFECT = true;

let container, stats, envMap;
let camera, scene, renderer, light;
let controls;


const skyParameters = {
    distance: 1000,
    inclination: 0.42,
    azimuth: 0.1
};


function updateSun()
{

    if (!sky)
    {
        return;
    }

    const theta = Math.PI * (skyParameters.inclination - 0.5);
    const phi = 2 * Math.PI * (skyParameters.azimuth - 0.5);

    light.position.x = skyParameters.distance * Math.cos(phi);
    light.position.y = skyParameters.distance * Math.sin(phi) * Math.sin(theta);
    light.position.z = skyParameters.distance * Math.sin(phi) * Math.cos(theta);

    sky.material.uniforms["sunPosition"].value = light.position.copy(light.position);

    cubeCamera.update(renderer, sky);

}


let cubeCamera, sky;





function init()
{

    container = document.getElementById("container");

    //

    renderer = new WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = sRGBEncoding
    container.appendChild(renderer.domElement);

    //

    scene = new Scene();

    camera = new PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(25, 25, 100);

    //

    light = new DirectionalLight("#fff8d5", 0.8);
    scene.add(light);

    cubeCamera = new CubeCamera(0.2, 1, 512);
    // cubeCamera.renderTarget.texture.generateMipmaps = true;
    // cubeCamera.renderTarget.texture.minFilter = LinearMipmapLinearFilter;

    scene.background = cubeCamera.renderTarget;

    // Skybox
    if (SKY_EFFECT)
    {
        sky = new Sky();


        // uniforms["turbidity"].value = 5;
        // uniforms["rayleigh"].value = 1.2;
        // uniforms["luminance"].value = 1;
        // uniforms["mieCoefficient"].value = 0.05;
        // uniforms["mieDirectionalG"].value = 0.9;

        envMap = cubeCamera.renderTarget.texture

        updateSun();
    }
    else
    {
        envMap = null;
    }

    controls = new OrbitControls(camera, renderer.domElement);
    //controls.maxPolarAngle = Math.PI * 0.45;
    controls.maxPolarAngle = Math.PI;
    controls.target.set(0, 0, 0);
    controls.minDistance = 0.0;
    controls.maxDistance = 150.0;
    controls.enableDamping = true;
    controls.dampingFactor = 0.02;
    controls.update();

    // stats = new Stats();
    // container.appendChild( stats.dom );

    // GUI

    //const gui = new GUI();

    // const folder = gui.addFolder( "Sky" );
    // folder.add( skyParameters, "inclination", 0, 0.5, 0.0001 ).onChange( updateSun );
    // folder.add( skyParameters, "azimuth", 0, 1, 0.0001 ).onChange( updateSun );
    // folder.open();
    //
    // const uniforms = water.material.uniforms;
    //
    // const folder = gui.addFolder( "Water" );
    // folder.add( uniforms.distortionScale, "value", 0, 8, 0.1 ).name( "distortionScale" );
    // folder.add( uniforms.size, "value", 0.1, 10, 0.1 ).name( "size" );
    // folder.add( uniforms.alpha, "value", 0.9, 1, .001 ).name( "alpha" );
    // folder.open();

    window.addEventListener("resize", onWindowResize, false);

}


function onWindowResize()
{

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}


let inclinationCount = 0;


function mainLoop()
{

    render();
    //stats.update();

    //skyParameters.inclination = -0.012 + Math.sin(inclinationCount += 0.01) * 0.524;

    updateSun();

    controls.update()
    raf(mainLoop);

}

function render()
{
    renderer.render(scene, camera);
}

const NUM_SPHERES = 110;

// scale of each sphere
const SPHERE_SCALE = 12;

// size of the random sphere spawn area
const SPHERE_AREA = 120;

raf(() => {

    Promise.all([
        loadTexture("assets/red-sphere.png"),
        loadTexture("assets/blue-sphere.png")
    ])
    .then(([ tRed, tBlue ]) =>
    {

        const redMat = new SpriteMaterial({
            map: tRed,
            transparent: true,
        });


        const blueMat = new SpriteMaterial({
            map: tBlue,
            transparent: true,
        });

        init();

        const half = SPHERE_AREA/2;

        for (let i=0; i < NUM_SPHERES; i++)
        {
            const sprite = new Sprite(Math.random() < 0.5 ? redMat : blueMat);
            scene.add(sprite);
            sprite.position.set(
                Math.random() * SPHERE_AREA - half,
                Math.random() * SPHERE_AREA - half,
                Math.random() * SPHERE_AREA - half
            );
            sprite.scale.set(SPHERE_SCALE, SPHERE_SCALE, SPHERE_SCALE);
        }

        mainLoop();

    })

})

