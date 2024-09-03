const medias = document.querySelectorAll("video");
const iframes = document.querySelectorAll('iframe');

VideoStop();
// VideoStopYouTube();

function VideoStop()
{
    // console.log("Pause video");
    medias.forEach((media) =>
    {
        media.pause();
    });
}

function VideoStopYouTube()
{
    // console.log("Pause youtube " + iframes.length);
    for (let i = 0; i < iframes.length; i++)
    {
        if (iframes[i] !== null)
        {
            iframes[i].contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'stopVideo' }), '*');
        }
    }
}