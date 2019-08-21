/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import { removeSync } from 'fs-extra';
import {
  matchImageSnapshotOptions,
  matchImageSnapshotPlugin,
  cleanScreenshots,
} from '../src/plugin';

jest.mock('jest-image-snapshot/src/diff-snapshot', () => ({
  diffImageToSnapshot: jest
    .fn()
    .mockReturnValue({ diffOutputPath: '/path/to/diff' }),
}));
jest.mock('fs-extra', () => ({
  readFileSync: () => 'cheese',
  pathExistsSync: () => false,
  copySync: () => null,
  removeSync: jest.fn().mockReturnValue(null),
}));

describe('plugin', () => {
  const originalCwd = process.cwd;

  beforeEach(() => {
    process.cwd = () => '';
  });

  afterEach(() => {
    process.cwd = originalCwd;

    // We need to call `cleanScreenshots` after each test, because:
    // 1. Each test which calls `matchImageSnapshotPlugin` pushes paths into
    //    a module-level `screenshotPaths` array. This will be stale in the next
    //    test if we have not cleaned it up.
    // 2. Calling `cleanScreenshots` after each test is analogous to what we want
    //    the Cypress runner to do.
    cleanScreenshots();
  });

  it('should pass options through', () => {
    const options = {
      screenshotsFolder: '/cypress/screenshots',
      updateSnapshots: true,
    };

    matchImageSnapshotOptions()(options);

    const result = matchImageSnapshotPlugin({
      path: '/cypress/screenshots/path/to/cheese',
    });
    expect(result).toEqual({
      path: '/cypress/snapshots/path/to/__diff_output__/cheese.diff.png',
    });
    expect(diffImageToSnapshot).toHaveBeenCalledWith({
      snapshotsDir: '/cypress/snapshots/path/to',
      diffDir: '/cypress/snapshots/path/to/__diff_output__',
      updateSnapshot: true,
      receivedImageBuffer: 'cheese',
      snapshotIdentifier: 'cheese',
      failureThreshold: 0,
      failureThresholdType: 'pixel',
    });
  });

  it('should keep track of and clean up multiple snapshots when matchImageSnapshot is called multiple times during a test run', () => {
    const options = {
      screenshotsFolder: '/cypress/screenshots',
      updateSnapshots: true,
    };

    matchImageSnapshotOptions()(options);

    // When `matchImageSnapshot` is called, we append to `screenshotPaths`.
    matchImageSnapshotPlugin({
      path: '/cypress/screenshots/path/to/cheese-snap.png',
    });
    matchImageSnapshotPlugin({
      path: '/cypress/screenshots/path/to/cheese (1)-snap.png',
    });
    matchImageSnapshotPlugin({
      path: '/cypress/screenshots/path/to/cheese (2)-snap.png',
    });
    matchImageSnapshotPlugin({
      path: '/cypress/screenshots/path/to/cheese (3)-snap.png',
    });

    removeSync.mockClear();

    // Since calling `matchImageSnapshot` multiple times, `screenshotPaths` will contain multiple paths.
    // Calling `cleanScreenshots` will remove these paths and empty `screenshotPaths`.
    cleanScreenshots();
    expect(removeSync).toHaveBeenCalledTimes(4);
    expect(removeSync).toHaveBeenNthCalledWith(
      1,
      '/cypress/screenshots/path/to/cheese-snap.png'
    );
    expect(removeSync).toHaveBeenNthCalledWith(
      2,
      '/cypress/screenshots/path/to/cheese (1)-snap.png'
    );
    expect(removeSync).toHaveBeenNthCalledWith(
      3,
      '/cypress/screenshots/path/to/cheese (2)-snap.png'
    );
    expect(removeSync).toHaveBeenNthCalledWith(
      4,
      '/cypress/screenshots/path/to/cheese (3)-snap.png'
    );

    removeSync.mockClear();

    // We then test that `screenshotPaths` was emptied by the previous call to `cleanScreenshots`.
    // We do this by calling `cleanScreenshots` again and checking that it does not try to delete any paths.
    cleanScreenshots();
    expect(removeSync).toHaveBeenCalledTimes(0);
  });
});
