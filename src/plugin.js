import path from 'path';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import fs from 'fs-extra';
import { COMPARE } from './constants';
import compare from './compare';

let screenshotDetails = {};

const matchImageSnapshotPlugin = (name, options, config) =>
  new Promise((resolve, reject) => {
    // Check if we should skip the comparison, for example while debugging a case.
    if (options.skipCompare.call()) {
      resolve('Snapshot Compare skipped.');
    }

    // Set all paths needed in our plugin.
    const relativePath = process.cwd();
    const screenshotPath = screenshotDetails.path.replace(
      config.screenshotsFolder,
      ''
    );
    const screenshotFolder = screenshotDetails.path
      .replace(relativePath, '')
      .replace(screenshotPath, '');

    const diffPath = path.join(
      relativePath,
      options.diffFolder || screenshotFolder,
      screenshotPath.replace('.png', options.dotDiff)
    );

    const snapPath = path.join(
      relativePath,
      options.snapshotFolder || screenshotFolder,
      screenshotPath.replace('.png', options.dotSnap)
    );

    compare(snapPath, screenshotDetails.path, diffPath, config.env.updateSnapshots || false).then(({diff, total, msg}) => {
        if(msg) {
          resolve(msg);
        }

        if(options.thresholdType === 'pixel') {
            if(diff > options.threshold) {
                reject(new Error(`Image comparison failed, the change of ${diff} is higher then the allowed ${options.threshold} pixels.`))
            }
        } else if(options.threshold === 'percentage') {
            const percentage = ((total - diff) / total) * 100;

            if(percentage > options.threshold) {
                reject(new Error(`Image comparison failed, the change of ${diff} is higher then the allowed ${options.threshold} percentage.`))
            }
        }

        resolve("Screenshot matched")
    }).catch((reason) => reject(reason));
  });

const addMatchImageSnapshotPlugin = (on, config, pluginOptions) => {
  const pluginDefaults = {
    kebabSnap: '-snap.png',
    dotSnap: '.snap.png',
    dotDiff: '.diff.png',
    snapshotFolder: undefined,
    diffFolder: undefined,
    skipCompare: () => false,
    threshold: 0,
    thresholdType: 'pixel'
  };
  on('task', {
    [COMPARE]: (name, options) =>
      matchImageSnapshotPlugin(name, { ...pluginDefaults, ...pluginOptions, ...options }, config),
  });
  on('after:screenshot', details => {
    screenshotDetails = details;
  });
};

export { addMatchImageSnapshotPlugin };
