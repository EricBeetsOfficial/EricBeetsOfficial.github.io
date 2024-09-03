import { map_range } from "./utils.js";

let firstX = null;
let firstY = null;
let margin = Math.PI / 8;
let _debug = false;

export const createContext = function (canvas, parent)
{
    // Engine and Scene
    const engine = new BABYLON.Engine(canvas, true);
    engine.doNotHandleTouchAction = true;
    const scene = new BABYLON.Scene(engine);
    engineEvent(engine, scene, canvas, parent);
    return scene;
};

export function setDebug(canvas, scene, camera, debug)
{
    _debug = debug;
    if (debug)
    {
        margin = 0;
        // Enable BabylonJS inspectors
        scene.debugLayer.show(
        {
            embedMode: true,
        });
    	camera.attachControl(canvas, true);
    }
}

export function updateSceneDesktop(camera, alpha, beta, canvas)
{
    if (!_debug)
    {
        camera.alpha = map_range(alpha, canvas?.clientWidth, 0, margin, Math.PI - margin); // Y up
        camera.beta = map_range(beta, canvas?.clientHeight, 0, margin * 2.5, Math.PI - margin * 4);  // X
    }
}

export function updateSceneMobile(camera, beta, gamma)
{
    var x = beta / 180 * Math.PI;
    var y = gamma / 180 * Math.PI;
    if (firstX == null) firstX = x;
    if (firstY == null) firstY = y;
    camera.alpha = map_range(y - firstY, Math.PI / 2, -Math.PI / 2,  -margin, Math.PI + margin); // Y up
    camera.beta = map_range(x - firstX, Math.PI / 2, -Math.PI, margin, Math.PI - margin);  // X
}

function engineEvent(engine, scene, canvas, parent)
{
    engine.runRenderLoop(function () 
    {
        scene.render();
    });

    window.addEventListener("resize", function () 
    {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
        // console.log("Resize: " + canvas.width + " " + canvas.height);
        engine.resize();
    });

}