/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import childProcess from 'child_process';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import { matchImageSnapshotPlugin } from '../src/plugin';

jest.mock('jest-image-snapshot/src/diff-snapshot', () => ({
  diffImageToSnapshot: jest
    .fn()
    .mockReturnValue({ diffOutputPath: '/path/to/diff' }),
}));
jest.mock('child_process');
jest.mock('fs', () => ({ readFileSync: () => 'cheese' }));

describe('plugin', () => {
  it('should pass options through', () => {
    const options = {
      fileName: 'snap',
      screenshotsFolder: '/screenshots',
      fileServerFolder: '/fileserver',
      updateSnapshots: true,
    };

    matchImageSnapshotPlugin(options);

    expect(diffImageToSnapshot).toHaveBeenCalledWith({
      snapshotsDir: '/fileserver/cypress/snapshots',
      updateSnapshot: true,
      receivedImageBuffer: 'cheese',
      snapshotIdentifier: 'snap',
      failureThreshold: 0,
      failureThresholdType: 'pixel',
    });

    expect(childProcess.spawnSync).toHaveBeenCalledWith('cp', [
      '/path/to/diff',
      '/screenshots/snap.png',
    ]);
  });
});
