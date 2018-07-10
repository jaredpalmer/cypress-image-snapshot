/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

global.Cypress = {
  config: () => 'cheese',
  env: () => false,
  Commands: {
    add: jest.fn(),
  },
};

const {
  matchImageSnapshotCommand,
  addMatchImageSnapshotCommand,
} = require('../src/command');

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
  it('should pass options through', () => {
    global.cy = {
      task: jest.fn().mockResolvedValue({ pass: true }),
    };

    boundMatchImageSnapshot(subject, commandOptions);

    expect(cy.task).toHaveBeenCalledWith('Matching image snapshot', {
      screenshotsFolder: 'cheese',
      fileServerFolder: 'cheese',
      updateSnapshots: false,
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

  it('should add command', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand();
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'matchImageSnapshot',
      expect.any(Function),
      { prevSubject: 'optional' }
    );
  });

  it('should add command with custom name', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand('sayCheese');
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'sayCheese',
      expect.any(Function),
      { prevSubject: 'optional' }
    );
  });

  it('should add command with options', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand({ failureThreshold: 0.1 });
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'matchImageSnapshot',
      expect.any(Function),
      { prevSubject: 'optional' }
    );
  });
});
