import { COMPARE } from "./constants";

let screenshotDetails = {};

const matchImageSnapshotPlugin = (name, options, config) => {
    console.log(name);
    console.log(options);
    console.log(config);
    console.log(screenshotDetails);
}

const addMatchImageSnapshotPlugin = (on, config) => {
    on('task', {
        [COMPARE]: (name, options) => {
            matchImageSnapshotPlugin(name, options, config)
        }
    })
    on('after:screenshot', (details) => {
        screenshotDetails = details;
    })
}

export {addMatchImageSnapshotPlugin};