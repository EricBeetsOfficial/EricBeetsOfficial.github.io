export function map_range(value, low1, high1, low2, high2) 
{
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
export function requestOrientationPermission()
{
    return new Promise((resolve, reject) =>
    {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function')
        {
         DeviceOrientationEvent.requestPermission()
            .then(permissionState => 
            {
                if (permissionState === 'granted')
                {
                    resolve(true);
                }
            })
            .catch(()=>
            {
                reject("Failed !");
            });
        }
        else
        {
            resolve(false);
        }
    });
}
