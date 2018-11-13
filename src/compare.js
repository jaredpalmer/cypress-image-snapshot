import fs from 'fs';
import fsExtra from 'fs-extra';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import { createHash } from 'crypto';

const compare = (snapshot, latest, output, update, callback, threshold = 0.01) => new Promise((resolve, reject) => {
    const latestImg = PNG.sync.read(fs.readFileSync(latest));

    if (update || !fs.existsSync(snapshot)) {
        fsExtra.ensureFileSync(snapshot);
        fs.writeFileSync(snapshot, PNG.sync.write(latestImg, { filterType: 4 }))
        resolve({ diff: 0, total: 0, msg: "Snapshot did not exist we created it for you!" })
    }

    const snapshotImg = PNG.sync.read(fs.readFileSync(snapshot));

    const snapshotHash = createHash('sha1').update(snapshotImg.data).digest('base64');
    const latestHash = createHash('sha1').update(latestImg.data).digest('base64');

    if (snapshotHash === latestHash) {
        resolve({ diff: 0, total: 0, msg: "File hash matched no need for pixel by pixel compare!" });
    }

    if(snapshotImg.width !== latestImg.width || snapshotImg.height !== latestImg.height) {
        // Check if the DPI setting of the screen is different to provide better error handling.
        if((snapshotImg.width % latestImg.width === 0 && snapshotImg.height % latestImg.height === 0) || (latestImg.width % snapshotImg.width  === 0 && latestImg.height % snapshotImg.height === 0)) {
            reject(new Error(`Size of the images compare are not equal, this is likely to DPI settings please ensure you run the test cases on a screen with the same DPI settings.`))
        }

        reject(new Error(`Size of the images to compare need to be equal, snapshot ${snapshotImg.width}x${snapshotImg.height} vs latest ${latestImg.width}x${latestImg.height}.`))
    };

    const diffImg = new PNG({width: snapshotImg.width, height: snapshotImg.height});

    const diffPixels = pixelmatch(snapshotImg.data, latestImg.data, diffImg.data, snapshotImg.width, snapshotImg.height, {threshold});

    if (diffPixels > 0) {
        if(typeof callback === 'function') {
            callback.call({latestImg, snapshotImg, diffImg, snapshotPath: snapshot, latestPath: latest, diffPath: output, diffPixels, threshold})
        } else {
            const { width, height } = snapshotImg;

            const compositeDiffImg = new PNG({
                width: width * 3,
                height
            });

            PNG.bitblt(snapshotImg, compositeDiffImg, 0, 0, width, height, 0, 0);
            PNG.bitblt(diffImg, compositeDiffImg, 0, 0, width, height, width, 0);
            PNG.bitblt(latestImg, compositeDiffImg, 0, 0, width, height, width * 2, 0);

            fsExtra.ensureFileSync(output);
            fs.writeFileSync(output, PNG.sync.write(compositeDiffImg, { filterType: 4 }))
        }
    }

    resolve({ diff: diffPixels, total: snapshotImg.width * snapshotImg.height });
});

export default compare;