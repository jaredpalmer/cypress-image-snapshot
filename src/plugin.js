/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from 'fs-extra';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import path from 'path';
import pkgDir from 'pkg-dir';
import { MATCH, RECORD } from './constants';

let snapshotOptions = {};
let snapshotResult = {};
let snapshotRunning = false;
const kebabSnap = '-snap.png';
const dotSnap = '.snap.png';
const dotDiff = '.diff.png';

export const cachePath = path.join(
  pkgDir.sync(process.cwd()),
  'cypress',
  '.snapshot-report'
);

export function matchImageSnapshotOptions() {
  return (options = {}) => {
    snapshotOptions = options;
    snapshotRunning = true;
    return null;
  };
}

export function matchImageSnapshotResult() {
  return () => {
    snapshotRunning = false;

    const { pass, added, updated } = snapshotResult;

    // @todo is there a less expensive way to share state between test and reporter?
    if (!pass && !added && !updated && fs.existsSync(cachePath)) {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      cache.push(snapshotResult);
      fs.writeFileSync(cachePath, JSON.stringify(cache), 'utf8');
    }

    return snapshotResult;
  };
}

export function matchImageSnapshotPlugin({ path: screenshotPath }) {
  if (!snapshotRunning) {
    return null;
  }

  const {
    screenshotsFolder,
    updateSnapshots,
    options: {
      failureThreshold = 0,
      failureThresholdType = 'pixel',
      customSnapshotsDir,
      customDiffDir,
      ...options
    } = {},
  } = snapshotOptions;

  const receivedImageBuffer = fs.readFileSync(screenshotPath);
  fs.removeSync(screenshotPath);

  const { dir: screenshotDir, name } = path.parse(
    screenshotPath
  );

  // remove the cypress v5+ native retries suffix from the file name
  const snapshotIdentifier = name.replace(/ \(attempt [0-9]+\)/, '');

  const relativePath = path.relative(screenshotsFolder, screenshotDir);
  const snapshotsDir = customSnapshotsDir
    ? path.join(process.cwd(), customSnapshotsDir, relativePath)
    : path.join(screenshotsFolder, '..', 'snapshots', relativePath);

  const snapshotKebabPath = path.join(
    snapshotsDir,
    `${snapshotIdentifier}${kebabSnap}`
  );
  const snapshotDotPath = path.join(
    snapshotsDir,
    `${snapshotIdentifier}${dotSnap}`
  );

  const diffDir = customDiffDir
    ? path.join(process.cwd(), customDiffDir, relativePath)
    : path.join(snapshotsDir, '__diff_output__');
  const diffDotPath = path.join(diffDir, `${snapshotIdentifier}${dotDiff}`);

  if (fs.pathExistsSync(snapshotDotPath)) {
    fs.copySync(snapshotDotPath, snapshotKebabPath);
  }

  snapshotResult = diffImageToSnapshot({
    snapshotsDir,
    diffDir,
    receivedImageBuffer,
    snapshotIdentifier,
    failureThreshold,
    failureThresholdType,
    updateSnapshot: updateSnapshots,
    ...options,
  });

  const { pass, added, updated, diffOutputPath } = snapshotResult;

  if (!pass && !added && !updated) {
    fs.copySync(diffOutputPath, diffDotPath);
    fs.removeSync(diffOutputPath);
    fs.removeSync(snapshotKebabPath);
    snapshotResult.diffOutputPath = diffDotPath;

    return {
      path: diffDotPath,
    };
  }

  fs.copySync(snapshotKebabPath, snapshotDotPath);
  fs.removeSync(snapshotKebabPath);
  snapshotResult.diffOutputPath = snapshotDotPath;

  return {
    path: snapshotDotPath,
  };
}

export function addMatchImageSnapshotPlugin(on, config) {
  on('task', {
    [MATCH]: matchImageSnapshotOptions(config),
    [RECORD]: matchImageSnapshotResult(config),
  });
  on('after:screenshot', matchImageSnapshotPlugin);
}
