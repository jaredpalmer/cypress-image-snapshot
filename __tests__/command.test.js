/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

global.Cypress = {
  config: () => 'cheese',
};

const { matchImageSnapshotCommand } = require('../src/command');

const defaultOptions = {
  failureThreshold: 0,
  failureThresholdType: 'pixel',
  fileNameTransform: () => 'snap',
};

const boundMatchImageSnapshot = matchImageSnapshotCommand(defaultOptions).bind({
  test: 'snap',
});
const subject = { screenshot: jest.fn() };
const commandOptions = {
  failureThreshold: 10,
};

describe('command', () => {
  it('should pass options through', async () => {
    global.cy = {
      task: jest.fn().mockResolvedValue({ pass: true }),
    };

    await boundMatchImageSnapshot(subject, commandOptions);

    expect(cy.task).toHaveBeenCalledWith('matchImageSnapshot', {
      fileName: 'snap',
      screenshotsFolder: 'cheese',
      fileServerFolder: 'cheese',
      updateSnapshots: 'cheese',
      options: {
        failureThreshold: 10,
        failureThresholdType: 'pixel',
        fileNameTransform: expect.any(Function),
      },
    });
  });

  it('should pass', () => {
    global.cy = {
      task: jest.fn().mockResolvedValue({ pass: true }),
    };

    expect(
      boundMatchImageSnapshot(subject, commandOptions)
    ).resolves.not.toThrow();
  });

  it('should fail', () => {
    global.cy = {
      task: jest.fn().mockResolvedValue({
        pass: false,
        added: false,
        updated: false,
        diffRatio: 0.1,
        diffPixelCount: 10,
        diffOutputPath: 'cheese',
      }),
    };

    expect(
      boundMatchImageSnapshot(subject, commandOptions)
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
