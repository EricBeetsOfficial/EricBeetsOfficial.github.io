const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine


var addPanningCameraToScene = (scene, canvas) =>
{
    var camera = new BABYLON.FreeCamera("camera", BABYLON.Vector3.Zero(), scene);
camera._disablePointerInputWhenUsingDeviceOrientation = false;
    camera.inputs.addDeviceOrientation();
    camera.attachControl(canvas);

    var getPointerViewSpaceRay = (x, y) =>
    {
        return BABYLON.Vector3.Unproject(
            new BABYLON.Vector3(x, y, 0), 
            canvas.width, 
            canvas.height,
            BABYLON.Matrix.Identity(),
            BABYLON.Matrix.Identity(), 
            camera.getProjectionMatrix()).normalize();
    }

    var ptrX = 0;
    var ptrY = 0;
    camera.rotationQuaternion = BABYLON.Quaternion.Identity();

    var sphericalPan = () =>
    {
        var massiveJump = (Math.abs(ptrX - scene.pointerX) > 100 || Math.abs(ptrY - scene.pointerY) > 100);

        console.log(camera.getProjectionMatrix().m);

        var priorRay = getPointerViewSpaceRay(ptrX, ptrY);
        var currentRay = getPointerViewSpaceRay(scene.pointerX, scene.pointerY);
        
        var rotationAxis = BABYLON.Vector3.Cross(priorRay, currentRay);
        if (rotationAxis.lengthSquared() > 0 && !massiveJump)
        {
            var rotationAngle = BABYLON.Vector3.GetAngleBetweenVectors(priorRay, currentRay, rotationAxis);
            var rotation = BABYLON.Quaternion.RotationAxis(rotationAxis, -rotationAngle);

            var newForward = BABYLON.Vector3.Forward();
            newForward.rotateByQuaternionToRef(rotation, newForward);
            newForward.rotateByQuaternionToRef(camera.rotationQuaternion, newForward);

            // TODO: var matrix = BABYLON.Matrix.LookAtRH(BABYLON.Vector3.Zero(), newForward, BABYLON.Vector3.Up());
            var newRight = BABYLON.Vector3.Cross(BABYLON.Vector3.Up(), newForward);
            var newUp = BABYLON.Vector3.Cross(newForward, newRight);

            var matrix = new BABYLON.Matrix.Identity();
            matrix.setRowFromFloats(0, newRight.x, newRight.y, newRight.z, 0);
            matrix.setRowFromFloats(1, newUp.x, newUp.y, newUp.z, 0);
            matrix.setRowFromFloats(2, newForward.x, newForward.y, newForward.z, 0);

            camera.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(matrix.getRotationMatrix());
        }

        ptrX = scene.pointerX;
        ptrY = scene.pointerY;
    };

    var observable = scene.onBeforeRenderObservable.add(sphericalPan);
    scene.onBeforeRenderObservable.remove(observable);

    scene.onPointerDown = (_, __, ___) =>
    {
        observable = scene.onBeforeRenderObservable.add(sphericalPan);
        camera.detachControl(canvas);
    }
    scene.onPointerUp = (_, __, ___) =>
    {
        scene.onBeforeRenderObservable.remove(observable);
        camera.attachControl(canvas);
    }
};

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var dome = new BABYLON.PhotoDome(
        "testdome",
        "/assets/models/360photo.jpg",
        {
            resolution: 32,
            size: 1000
        },
        scene
    );

    addPanningCameraToScene(scene, canvas);
        // if(scene.activeCamera === vrHelper.vrDeviceOrientationCamera){
            BABYLON.FreeCameraDeviceOrientationInput.WaitForOrientationChangeAsync(1000).then(()=>{
                // Successfully received sensor input
            }).catch(()=>{
               // alert("Device orientation camera is being used but no sensor is found, prompt user to enable in safari settings");
               if (typeof DeviceMotionEvent.requestPermission === 'function') 
	{
		DeviceMotionEvent.requestPermission()
		.then(permissionState => {
			if (permissionState === 'granted') 
			{
				// DeviceMotionEvent.requestPermission() has been granted
			}
        })
        .catch(console.error);
       }
            })
        // }

    return scene;
};

const scene = createScene();

engine.runRenderLoop(function () 
{
    scene.render();
});

window.addEventListener("resize", function () 
{
    engine.resize();
});
