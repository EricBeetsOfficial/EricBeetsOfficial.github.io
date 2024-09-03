var guiMessage;
const urlImageTracker = "https://ericbeets.free.fr/assets/EricBeets_.png";
const urlImageFull = "https://ericbeets.free.fr/assets/EricBeets.png";
const scaleModel = 12;

function createGUI()
{
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    guiMessage = new BABYLON.GUI.Rectangle("rimg");
    guiMessage.background = "transparent";
    guiMessage.cornerRadius = 20;
    guiMessage.thickness = 0;
    guiMessage.isPointerBlocker = true;
    guiMessage.width = 0.75;
    guiMessage.height = 0.30;

    var guiImageTracker = new BABYLON.GUI.Image("Tracker", urlImageTracker);
    guiImageTracker.autoScale = true;
    guiImageTracker.alpha = 0.65;
    guiImageTracker.scaleX = 0.45;
    guiImageTracker.scaleY = 0.45;

    var guiText = new BABYLON.GUI.TextBlock();
    guiText.text = "Filmez le CV";
    guiText.color = "white";
    guiText.outlineColor = "black";
    guiText.outlineWidth = 3;
    guiText.fontSize = 100;
	guiText.textHorizontalAlignment = BABYLON.GUI.TextBlock.HORIZONTAL_ALIGNMENT_CENTER;
	guiText.textVerticalAlignment = BABYLON.GUI.TextBlock.VERTICAL_ALIGNMENT_TOP;

    guiMessage.addControl(guiImageTracker);
    guiMessage.addControl(guiText);
    advancedTexture.addControl(guiMessage);
}

async function startXR()
{
    const availableAR = await BABYLON.WebXRSessionManager.IsSessionSupportedAsync('immersive-ar');
    if (!availableAR) {
        alert('immersive-ar WebXR session mode is not available in your browser.');
    }

    const canvas = document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true);
    const scene = new BABYLON.Scene(engine);

    const root = new BABYLON.TransformNode("root", scene);
    root.rotationQuaternion = new BABYLON.Quaternion();

    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

    BABYLON.SceneLoader.ImportMeshAsync("", "https://ericbeetsofficial.github.io/assets/models/", "nEric_.glb").then((result) =>
    {
        result.meshes[0].parent = root;
        let parent = result.meshes[0];
        parent.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), BABYLON.Tools.ToRadians(0));
        parent.scaling.x /= scaleModel;
        parent.scaling.y /= scaleModel;
        parent.scaling.z /= scaleModel;
    });

    const htmlButton = document.getElementById("arButton")
    const arButton = new BABYLON.WebXREnterExitUIButton(htmlButton, "immersive-ar", "unbounded");

    const xr = await BABYLON.WebXRDefaultExperience.CreateAsync(scene,
    {
        uiOptions: {
            sessionMode: "immersive-ar",
            customButtons: [arButton]
        },
        // optionalFeatures: ["hit-test", "dom-overlay"], // Optional features for AR
        optionalFeatures: true
    });
    xr.teleportation.detach();

    xr.baseExperience.onStateChangedObservable.add((state)=>
    {
        if(state === BABYLON.WebXRState.IN_XR)
        {
            createGUI();
        }
        if(state === BABYLON.WebXRState.EXITING_XR)
        {
            guiMessage.isVisible = false;
        }
    });

    const featuresManager = xr.baseExperience.featuresManager;
    const imageTracking = featuresManager.enableFeature(BABYLON.WebXRFeatureName.IMAGE_TRACKING, "latest",
    {
        images: [
            {
                src: urlImageTracker,
                estimatedRealWorldWidth : 1 // in meters
            },
        ]
    })

    imageTracking.onTrackedImageUpdatedObservable.add((image) =>
    {
        root.setEnabled(!image.emulated);
        if (!image.emulated)
        {
            image.transformationMatrix.decompose(root.scaling, root.rotationQuaternion, root.position);
        }
        guiMessage.isVisible = image.emulated;
    });;

    engine.runRenderLoop(() =>
    {
        scene.render();
    });

    window.addEventListener("resize", function ()
    {
        engine.resize();
    })
}

startXR();