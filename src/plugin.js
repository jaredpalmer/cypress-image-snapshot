/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import kebabCase from 'lodash.kebabcase';

let snapshotOptions = {};
let snapshotResults = {};
let snapshotRunning = false;

export function matchImageSnapshotOptions(options = {}) {
  snapshotOptions = options;
  snapshotRunning = true;
  return null;
}

export function matchImageSnapshotResults() {
  snapshotRunning = false;
  return snapshotResults;
}

export function matchImageSnapshotPlugin({ path: screenshotPath }) {
  if (!snapshotRunning) {
    return null;
  }

  const {
    updateSnapshots,
    options: {
      failureThreshold = 0,
      failureThresholdType = 'pixel',
      ...options
    } = {},
  } = snapshotOptions;

  const receivedImageBuffer = fs.readFileSync(screenshotPath);
  const screenshotFileName = screenshotPath.slice(
    screenshotPath.lastIndexOf('/')
  );
  const screenshotDir = screenshotPath.replace(screenshotFileName, '');
  const snapshotIdentifier = kebabCase(screenshotFileName.replace('.png', ''));
  const snapshotsDir = screenshotDir.replace('screenshots', 'snapshots');
  const snapshotPath = `${snapshotsDir}/${snapshotIdentifier}-snap.png`;

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
    path: snapshotPath,
  };
}

export function addMatchImageSnapshotPlugin(on) {
  on('task', {
    'Matching image snapshot': matchImageSnapshotOptions,
    'Recording snapshot results': matchImageSnapshotResults,
  });
  on('after:screenshot', matchImageSnapshotPlugin);
}
