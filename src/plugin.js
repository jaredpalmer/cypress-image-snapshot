/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';

export const TASK = {
  OPTIONS: 'Matching image snapshot',
  RESULTS: 'Recording snapshot results',
};

let snapshotOptions = {};
let snapshotResults = {};

export function matchImageSnapshotOptions(options) {
  snapshotOptions = options;
  return null;
}

export function matchImageSnapshotResults() {
  snapshotOptions = {};
  return snapshotResults;
}

export function matchImageSnapshotPlugin({
  path: screenshotsPath,
  name: snapshotIdentifier,
}) {
  const {
    screenshotsFolder,
    fileServerFolder,
    updateSnapshots,
    options: {
      failureThreshold = 0,
      failureThresholdType = 'pixel',
      ...options
    } = {},
  } = snapshotOptions;

  const receivedImageBuffer = fs.readFileSync(screenshotsPath);
  const snapshotsPath = screenshotsPath.replace('screenshots', 'snapshots');
  const snapshotsDir = snapshotsPath.replace(`/${snapshotIdentifier}.png`, '');

  snapshotResults = diffImageToSnapshot({
    snapshotsDir,
    receivedImageBuffer,
    snapshotIdentifier,
    failureThreshold,
    failureThresholdType,
    updateSnapshot: updateSnapshots,
    ...options,
  });

  const { pass, added, updated, diffOutputPath } = snapshotResults;

  if (!pass && !added && !updated) {
    return {
      path: diffOutputPath,
    };
  }

  return {
    path: snapshotsPath,
  };
}

export function addMatchImageSnapshotPlugin(on) {
  on('task', {
    [TASK.OPTIONS]: matchImageSnapshotOptions,
    [TASK.RESULTS]: matchImageSnapshotResults,
  });
  on('after:screenshot', matchImageSnapshotPlugin);
}
