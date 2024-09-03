const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
console.log("Test01");
const scene = createScene();
scene.debugLayer.show(
{
    embedMode: true,
});
engine.runRenderLoop(function () 
{
    scene.render();
});

window.addEventListener("resize", function () 
{
    engine.resize();
});

function assignLightmapOnMaterial(material, lightmap) {
    material.lightmapTexture = lightmap;
    material.lightmapTexture.coordinatesIndex = 1;
    material.useLightmapAsShadowmap = true;
}

// var createScene = function () {
function createScene () {
    console.log("createScene");

    // scene init
    var scene = new BABYLON.Scene(engine);
    scene.clearColor = BABYLON.Color3.Black();
    var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, 1.6, 7.6, new BABYLON.Vector3(0, 1.5, 0), scene);
    camera.minZ = 0.01;
    camera.allowUpsideDown = false;
    camera.wheelPrecision = 150;
    camera.attachControl(canvas, true);
    var hdrTexture = new BABYLON.CubeTexture("/assets/models/Studio_Softbox_2Umbrellas_cube_specular.env", scene);
    hdrTexture.gammaSpace = false;
    scene.environmentTexture = hdrTexture;
    var shaderBall, shaderBallGLTFRoot;


    /** the pipeline start just below **/

    //http://doc.babylonjs.com/how_to/using_default_rendering_pipeline
    var pipeline = new BABYLON.DefaultRenderingPipeline(
        "pipeline", // The name of the pipeline
        true, // Do you want HDR textures ?
        scene, // The scene instance
        scene.cameras // The list of cameras to be attached to
    );
    if (pipeline.isSupported) {
        //chromatic aberration | http://doc.babylonjs.com/api/classes/babylon.chromaticaberrationpostprocess
        pipeline.chromaticAberrationEnabled = false; //false by default
        pipeline.chromaticAberration.aberrationAmount = 30; //30 by default
        pipeline.chromaticAberration.radialIntensity = 0; //0 by default
        //DoF | http://doc.babylonjs.com/api/classes/babylon.depthoffieldeffect
        pipeline.depthOfFieldEnabled = false; //false by default
        pipeline.depthOfFieldBlurLevel = 0; //0 by default
        pipeline.depthOfField.focusDistance = 2000; //2000 by default, in mm
        pipeline.depthOfField.focalLength = 50; //50 by default, in mm
        pipeline.depthOfField.fStop = 1.4; //1.4 by default
        //bloom
        pipeline.bloomEnabled = false; //false by default
        pipeline.bloomThreshold = 0.9; //0.9 by default
        pipeline.bloomWeight = 0.15; //0.15 by default
        pipeline.bloomKernel = 64; //64 by default
        pipeline.bloomScale = 0.5; //0.5 by default
        //FSAA
        pipeline.fxaaEnabled = true; //false by default
        if (pipeline.fxaaEnabled) {
            //http://doc.babylonjs.com/api/classes/babylon.fxaapostprocess#adaptscaletocurrentviewport
            pipeline.fxaa.samples = 32; //1 by default
            pipeline.fxaa.adaptScaleToCurrentViewport = true; //false by default
        }
        //grain | http://doc.babylonjs.com/api/classes/babylon.grainpostprocess
        pipeline.grainEnabled = false; //false by default
        pipeline.grain.intensity = 30; //30 by default
        pipeline.grain.animated = false; //false by default
        //image processing effect | http://doc.babylonjs.com/api/classes/babylon.imageprocessingpostprocess
        pipeline.imageProcessingEnabled = true; //true by default
        //MSAA
        pipeline.samples = 0; //1 by default
        //sharpening | http://doc.babylonjs.com/api/classes/babylon.sharpenpostprocess
        pipeline.sharpenEnabled = false; //false by default
        pipeline.sharpen.edgeAmount = 0.3; //0.3 by default
        pipeline.sharpen.colorAmount = 1; //1 by default
    }

    /** pipeline ending **/

    // cornell box
    BABYLON.SceneLoader.ImportMesh(
        "",
        "https://models.babylonjs.com/CornellBox/",
        "cornellBox.glb",
        scene,
        function () {
            // renaming the default gltf "__root__"
            scene.getMeshByName("bloc.000").parent.name = "__cornell-root__";
            // material tweaking
            scene.materials.forEach(function (material) {
                material.environmentIntensity = 1.4;
            });
            scene.getMaterialByName("light.000").emissiveColor = BABYLON.Color3.White();
            var monkeyMtl = scene.getMaterialByName("suzanne.000");
            monkeyMtl.metallic = 0.64;
            monkeyMtl.roughness = 0.63;

            // we have to cycles through objects to assign their lightmaps
            let lightmappedMeshes = ["bloc.000", "suzanne.000", "cornellBox.000"];
            lightmappedMeshes.forEach(function (mesh) {
                let currentMesh = scene.getNodeByName(mesh);
                let currentMeshChildren = currentMesh.getChildren();
                // lightmap texture creation
                let currentLightmap = new BABYLON.Texture(
                    "https://models.babylonjs.com/CornellBox/" + currentMesh.name + ".lightmap.jpg",
                    scene,
                    false,
                    false);
                switch (currentMesh.getClassName()) {
                    case "Mesh":
                        assignLightmapOnMaterial(currentMesh.material, currentLightmap);
                        break;
                    case "TransformNode":
                        currentMeshChildren.forEach(function (mesh) {
                            assignLightmapOnMaterial(mesh.material, currentLightmap);
                        });
                        break;
                }
            });

            // all new meshes now receive shadows (shadowGenerator created below)
            scene.meshes.forEach(function (mesh) {
                mesh.receiveShadows = true;
            });
        });

    // BJS logo 
    BABYLON.SceneLoader.ImportMesh(
        "",
        "https://models.babylonjs.com/",
        "shaderBall.glb",
        scene,
        function (shaderBallMeshes) {
            // selecting the mesh we will animate later on scene.registerBeforeRender()
            shaderBall = scene.getMeshByID("simpleShaderBall");
            // renaming the default gltf empty object "__root__" and adapting it to the scene
            shaderBallGLTFRoot = shaderBall.parent;
            shaderBallGLTFRoot.name = "__shaderBall-root__";
            shaderBallGLTFRoot.scaling.scaleInPlace(0.5);
            shaderBallGLTFRoot.position.y = 1.6;
            shaderBallGLTFRoot.rotationQuaternion = null; //this will help for the rotation anim later
            // tweaking materials
            var shaderBallMtl = shaderBall.material;
            shaderBallMtl.albedoTexture = new BABYLON.Texture("/assets/models/checkerBJS.png", scene);
            shaderBallMtl.metallic = 1;
            shaderBallMtl.roughness = 0.33;
            // dyn light to generate shadows 
            var light = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(0, -1, 0), scene);
            light.position = new BABYLON.Vector3(0, 3, 0);
            // shadows handling
            var shadowGenerator = new BABYLON.ShadowGenerator(128, light);
            shadowGenerator.useBlurExponentialShadowMap = true;
            shaderBallMeshes.forEach(function (mesh) {
                shadowGenerator.addShadowCaster(mesh);
            });
        });

    // why not using glow?
    var glowLayer = new BABYLON.GlowLayer("glow", scene, {
        mainTextureFixedSize: 256,
        blurKernelSize: 32
    });

    // simple animation for the logo
    var time = 0; //this will be used as a time variable
    scene.registerBeforeRender(function () {
        time += 0.1;
        if (shaderBallGLTFRoot != undefined) {
            shaderBallGLTFRoot.rotation.x += 0.002;
            shaderBallGLTFRoot.rotation.y -= 0.003;
            shaderBallGLTFRoot.rotation.z -= 0.001;
            shaderBallGLTFRoot.position.y = (Math.cos(time * 0.1) * 0.15) + 1.5;
        }
    });

    return scene;
};