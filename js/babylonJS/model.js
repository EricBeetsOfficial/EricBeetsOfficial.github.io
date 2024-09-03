export function loadModel(camera, scene, shadowGenerator)
{
    // Plane
    const abstractPlane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3.Zero, new BABYLON.Vector3.Up);
    const ground = BABYLON.MeshBuilder.CreatePlane("plane", {size: 10000, sourcePlane: abstractPlane, sideOrientation: BABYLON.Mesh.SINGLESIDE});
	// ground.receiveShadows = true;
    ground.material = new BABYLON.StandardMaterial("ground-material", scene);

    // let currentLightmap = new BABYLON.Texture("plane_lightmap.jpg", scene, false, false);
    // ground.material.lightmapTexture = currentLightmap;
    // ground.material.lightmapTexture.coordinatesIndex = 1;
    // ground.material.useLightmapAsShadowmap = true;

    BABYLON.SceneLoader.ImportMeshAsync("", "/assets/models/", "nEric_.glb").then((result) =>
    {
        let parent = result.meshes[0];
    	// shadowGenerator.addShadowCaster(parent);
        let childMeshes = parent.getChildMeshes();
        let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
        let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;
        for(let i = 0; i < childMeshes.length; i++)
        {
            childMeshes[i].receiveShadows = true;
            let meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
            let meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
            min = BABYLON.Vector3.Minimize(min, meshMin);
            max = BABYLON.Vector3.Maximize(max, meshMax);
        }
        parent.setBoundingInfo(new BABYLON.BoundingInfo(min, max));
        camera.setTarget(parent, true);
    });

    BABYLON.SceneLoader.ImportMeshAsync("", "/assets/models/", "scene.glb").then((result) =>
    {
        let parent = result.meshes[0];
    	// shadowGenerator.addShadowCaster(parent);
        parent.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), BABYLON.Tools.ToRadians(-40));
        parent.translate(BABYLON.Axis.Z, 2, BABYLON.Space.LOCAL);
        parent.translate(BABYLON.Axis.X, -4, BABYLON.Space.LOCAL);
        let child = parent.getChildMeshes();
        for (let i = 0; i < child.length; i++)
        {
            child[i].receiveShadows = true;
        }
    });
}