import path from 'path';
import { COMPARE_OPTIONS, COMPARE_RESULT } from './constants';
import compare from './compare';

let compareOptions = {};
let compareResult = {};

const matchImageSnapshotPlugin = (details, config) => {
    // Check if we should skip the comparison, for example while debugging a case.
    if (compareOptions.skipCompare.call()) {
      return Promise.resolve('Snapshot Compare skipped.');
    }

    // Set all paths needed in our plugin.
    const relativePath = process.cwd();
    const screenshotPath = details.path.replace(
      config.screenshotsFolder,
      ''
    );
    const screenshotFolder = details.path
      .replace(relativePath, '')
      .replace(screenshotPath, '');

    const diffPath = path.join(
      relativePath,
      compareOptions.diffFolder || screenshotFolder,
      screenshotPath.replace('.png', compareOptions.dotDiff)
    );

    const snapPath = path.join(
      relativePath,
      compareOptions.snapshotFolder || screenshotFolder,
      screenshotPath.replace('.png', compareOptions.dotSnap)
    );

    return compare(snapPath, details.path, diffPath, config.env.updateSnapshots || false, compareOptions.onDiffFinished).then(({ diff, total, message }) => {
        if (message) {
          compareResult.message = message;
          return { path: snapPath }
        }

        if (compareOptions.thresholdType === 'pixel') {
            if(diff > compareOptions.threshold) {
                compareResult.error = `Image comparison failed, the change of ${diff} is higher than the allowed ${compareOptions.threshold} pixels.`;
                return { path: diffPath };
            }
        } else if (compareOptions.threshold === 'percentage') {
            const percentage = ((total - diff) / total) * 100;

            if(percentage > compareOptions.threshold) {
              compareResult.error = `Image comparison failed, the change of ${diff} is higher than the allowed ${compareOptions.threshold} percentage.`;
              return { path: diffPath };
            }
        }

        compareResult.message = 'Screenshot matched';
        return { path: snapPath };
    });
  };

const addMatchImageSnapshotPlugin = (on, config, pluginOptions) => {
  const pluginDefaults = {
    dotSnap: '.snap.png',
    dotDiff: '.diff.png',
    snapshotFolder: undefined,
    diffFolder: undefined,
    skipCompare: () => false,
    threshold: 0,
    thresholdType: 'pixel',
    onDiffFinished: undefined
  };
  on('task', {
    [COMPARE_OPTIONS]: (options) => {
      compareOptions = { ...pluginDefaults, ...pluginOptions, ...options };
      compareResult = {error: null, message: null}
      return null;
    },
    [COMPARE_RESULT]: () => {
      if(compareResult.error) {
        throw new Error(compareResult.error)
      }

      return Promise.resolve(compareResult.message);
    }
  });
  on('after:screenshot', details => matchImageSnapshotPlugin(details, config));
};

export default addMatchImageSnapshotPlugin
export { addMatchImageSnapshotPlugin };
