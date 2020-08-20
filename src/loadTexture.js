// Instantiate a loader
import { TextureLoader } from "three";

const loader = new TextureLoader();

export default function(url, onProgress = null)
{
    return new Promise(((resolve, reject) => {
        // Load a glTF resource
        loader.load(
            // resource URL
            url,
            // called when the resource is loaded
            resolve,
            // called while loading is progressing
            onProgress,
            // called when loading has errors
            reject
        );

    }))
}
