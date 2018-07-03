/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const {
  diffImageToSnapshot,
} = require('jest-image-snapshot/src/diff-snapshot');

export function matchImageSnapshotPlugin({
  fileName,
  screenshotsFolder,
  fileServerFolder,
  updateSnapshots,
  options: {
    failureThreshold = 0,
    failureThresholdType = 'pixel',
    ...options
  } = {},
}) {
  const snapshotPath = path.join(screenshotsFolder, `${fileName}.png`);
  const receivedImageBuffer = fs.readFileSync(snapshotPath);

  const result = diffImageToSnapshot({
    snapshotsDir: path.join(fileServerFolder, 'cypress', 'snapshots'),
    updateSnapshot: updateSnapshots,
    receivedImageBuffer,
    snapshotIdentifier: fileName,
    failureThreshold,
    failureThresholdType,
    ...options,
  });

  childProcess.spawnSync('cp', [result.diffOutputPath, snapshotPath]);

  return result;
}

export function addMatchImageSnapshotPlugin(on) {
  on('task', { matchImageSnapshot: matchImageSnapshotPlugin });
}
