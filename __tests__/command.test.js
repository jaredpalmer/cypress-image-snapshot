/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

global.Cypress = {
  env: envName => {
    switch (envName) {
      default:
      case 'failOnSnapshotDiff':
        return undefined;
      case 'updateSnapshots':
        return false;
    }
  },
  log: () => null,
  config: () => '/cypress/screenshots',
  Commands: {
    add: jest.fn(),
  },
};

global.cy = {
  wrap: subject => subject,
};

const {
  matchImageSnapshotCommand,
  addMatchImageSnapshotCommand,
} = require('../src/command');
const { CLEAN_SCREENSHOTS } = require('../src/constants');

const defaultOptions = {
  failureThreshold: 0,
  failureThresholdType: 'pixel',
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
    global.cy.task = jest.fn().mockResolvedValue({ pass: true });

    boundMatchImageSnapshot(subject, commandOptions);

    expect(cy.task).toHaveBeenCalledWith('Matching image snapshot', {
      screenshotsFolder: '/cypress/screenshots',
      updateSnapshots: false,
      options: {
        failureThreshold: 10,
        failureThresholdType: 'pixel',
      },
    });
  });

  it('should pass', async () => {
    global.cy.task = jest.fn().mockResolvedValue({ pass: true });

    await expect(
      boundMatchImageSnapshot(subject, commandOptions)
    ).resolves.not.toThrow();
  });

  it('should fail', async () => {
    global.cy.task = jest.fn().mockResolvedValue({
      pass: false,
      added: false,
      updated: false,
      diffRatio: 0.1,
      diffPixelCount: 10,
      diffOutputPath: 'cheese',
    });

    await expect(
      boundMatchImageSnapshot(subject, commandOptions)
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should add command', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand();
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'matchImageSnapshot',
      { prevSubject: ['optional', 'element', 'window', 'document'] },
      expect.any(Function)
    );
  });

  it('should add command with custom name', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand('sayCheese');
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'sayCheese',
      { prevSubject: ['optional', 'element', 'window', 'document'] },
      expect.any(Function)
    );
  });

  it('should add command with options', () => {
    Cypress.Commands.add.mockReset();
    addMatchImageSnapshotCommand({ failureThreshold: 0.1 });
    expect(Cypress.Commands.add).toHaveBeenCalledWith(
      'matchImageSnapshot',
      { prevSubject: ['optional', 'element', 'window', 'document'] },
      expect.any(Function)
    );
  });

  it('should setup a global afterEach when the command is added that cleans up screenshots', () => {
    const afterEach = jest.spyOn(global, 'afterEach');

    try {
      addMatchImageSnapshotCommand();
      expect(afterEach).toHaveBeenCalledWith(expect.any(Function));

      const [afterEachCallback] = afterEach.mock.calls[0];

      global.cy.task = jest.fn();
      afterEachCallback();

      expect(global.cy.task).toHaveBeenCalledWith(CLEAN_SCREENSHOTS, null, {
        log: false,
      });
    } finally {
      afterEach.mockRestore();
    }
  });
});
