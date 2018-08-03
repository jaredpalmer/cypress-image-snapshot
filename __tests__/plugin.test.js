/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import childProcess from 'child_process';
import { diffImageToSnapshot } from 'jest-image-snapshot/src/diff-snapshot';
import {
  matchImageSnapshotPlugin,
  matchImageSnapshotOptions,
} from '../src/plugin';

jest.mock('jest-image-snapshot/src/diff-snapshot', () => ({
  diffImageToSnapshot: jest
    .fn()
    .mockReturnValue({ diffOutputPath: '/path/to/diff' }),
}));
jest.mock('fs', () => ({ readFileSync: () => 'cheese' }));

describe('plugin', () => {
  it('should pass options through', () => {
    const options = {
      updateSnapshots: true,
    };

    matchImageSnapshotOptions(options);

    const result = matchImageSnapshotPlugin({ path: '/path/to/cheese' });
    expect(result).toEqual({ path: '/path/to/diff' });
    expect(diffImageToSnapshot).toHaveBeenCalledWith({
      snapshotsDir: '/path/to',
      updateSnapshot: true,
      receivedImageBuffer: 'cheese',
      snapshotIdentifier: 'cheese',
      failureThreshold: 0,
      failureThresholdType: 'pixel',
    });
  });
});
