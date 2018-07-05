/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import kebabCase from 'lodash.kebabcase';
import { TASK } from './plugin';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const fileServerFolder = Cypress.config('fileServerFolder');
const updateSnapshots = Cypress.config('updateSnapshots') || false;

const defaultFileNameTransform = (name = '', test) =>
  kebabCase(`${test.title}-${name}`);

export function matchImageSnapshotCommand(defaultOptions) {
  return function matchImageSnapshot(subject, name, commandOptions) {
    const options = {
      ...defaultOptions,
      ...((typeof name === 'string' ? commandOptions : name) || {}),
    };

    const { fileNameTransform = defaultFileNameTransform } = options;
    const fileName = fileNameTransform(name, this.test);
    cy.task(TASK.OPTIONS, {
      screenshotsFolder,
      fileServerFolder,
      updateSnapshots,
      options,
    });

    const target = subject ? subject : cy;
    target.screenshot(fileName, options);

    return cy
      .task(TASK.RESULTS)
      .then(
        ({
          pass,
          added,
          updated,
          diffRatio,
          diffPixelCount,
          diffOutputPath,
        }) => {
          if (!pass && !added && !updated) {
            const differencePercentage = diffRatio * 100;
            throw new Error(
              `Screenshot was ${differencePercentage}% different from saved snapshot with ${diffPixelCount} different pixels.\n  See diff for details: ${diffOutputPath}`
            );
          }
        }
      );
  };
}

export function addMatchImageSnapshotCommand(
  maybeName = 'matchImageSnapshot',
  maybeOptions
) {
  const options = typeof maybeName === 'string' ? maybeOptions : maybeName;
  const name = typeof maybeName === 'string' ? maybeName : 'matchImageSnapshot';
  Cypress.Commands.add(name, matchImageSnapshotCommand(options), {
    prevSubject: 'optional',
  });
}
