export function createScene(scene)
{
    createRendering(scene);

    // Camera
    // var camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 15, new BABYLON.Vector3(0, 0, 0));
    var camera = new BABYLON.ArcRotateCamera("camera", 3 * Math.PI / 4,  Math.PI / 4, 20, new BABYLON.Vector3(0, 0, 0));

    const [light0,light] = createLight(scene);
    return [camera, createDynamicShadow(light)];
}

function createRendering(scene)
{
    // Rendering
    var pipeline = new BABYLON.DefaultRenderingPipeline(
        "pipeline",
        true,
        scene,
        scene.cameras
    );
    if (pipeline.isSupported)
    {
        pipeline.imageProcessingEnabled = true;
        pipeline.imageProcessing.vignetteEnabled = true;
        pipeline.imageProcessing.vignetteWeight = 2;
    }
}

function createLight(scene)
{
    // Lights
    var light0 = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
    light0.intensity = 0.6;

    var light = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(-1, -2, -1), scene);
    light.intensity = 1.0;
	light.position = new BABYLON.Vector3(2, 10, 2);
    light.shadowMinZ = 1;
    light.shadowMaxZ = 50;

	// var lightSphere = BABYLON.Mesh.CreateSphere("sphere", 10, 1, scene);
	// lightSphere.position = light.position;
	// lightSphere.material = new BABYLON.StandardMaterial("light", scene);
	// lightSphere.material.emissiveColor = new BABYLON.Color3(1, 1, 0);
    return [light0, light];
}

function createDynamicShadow(light)
{
    // Shadows
	var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
	shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.useKernelBlur = true;
    shadowGenerator.blurKernel = 16;
    shadowGenerator.depthScale = 4;
    shadowGenerator.blurScale = 1;
    return shadowGenerator;
}