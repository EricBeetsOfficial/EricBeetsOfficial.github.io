import { createContext, setDebug, updateSceneMobile, updateSceneDesktop } from "./context.js";
import * as env from "./scene.js";
import { requestOrientationPermission } from "./utils.js";
import { isMobile } from "./device.js";
import { loadModel } from "./model.js";

const useOrientation = await requestOrientationPermission();
const canvas = document.getElementById("renderCanvas");
if (canvas != null)
{
    const parent = document.getElementById("parent");
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;

    var debug = false;
    if (canvas.classList[1] == 'debug')
    {
        debug = true;
    }

    const scene = createContext(canvas, parent);
    const [camera, shadowGenerator] = env.createScene(scene);
    setDebug(canvas, scene, camera, debug);
    loadModel(camera, scene, shadowGenerator);

    // Event mouse / motion
    if (useOrientation && isMobile.any())
    {
        // Use Orientation
        if (window.DeviceOrientationEvent) 
        {
            window.addEventListener("deviceorientation", function(event)
            {
                updateSceneMobile(camera, event.beta, event.gamma);
            }, true);
        }
    }
    else if (!useOrientation && isMobile.any())
    {
        if (isMobile.any())
        {
            // Automatic animation
        }
    }
    else
    {
        // Mouse event
        scene.onPointerObservable.add((evt) => {
            updateSceneDesktop(camera, evt.event.offsetX, evt.event.offsetY, canvas);
        }, BABYLON.PointerEventTypes.POINTERMOVE);
    }
}