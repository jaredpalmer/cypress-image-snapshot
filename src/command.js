/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import kebabCase from 'lodash.kebabcase';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const fileServerFolder = Cypress.config('fileServerFolder');
const updateSnapshots = Cypress.config('updateSnapshots') || false;

const defaultFileNameTransform = (name = '', test) =>
  kebabCase(`${test.parent.title}-${test.title}-${name}`);

export function matchImageSnapshotCommand(defaultOptions) {
  return async function matchImageSnapshot(subject, name, commandOptions) {
    const options = {
      ...defaultOptions,
      ...((typeof name === 'string' ? commandOptions : name) || {}),
    };

    const { fileNameTransform = defaultFileNameTransform } = options;
    const fileName = fileNameTransform(name, this.test);
    const target = subject ? subject : cy;
    target.screenshot(fileName, options);

    const {
      pass,
      added,
      updated,
      diffRatio,
      diffPixelCount,
      diffOutputPath,
    } = await cy.task('matchImageSnapshot', {
      fileName,
      screenshotsFolder,
      fileServerFolder,
      updateSnapshots,
      options,
    });

    const differencePercentage = diffRatio * 100;
    if (!pass && !added && !updated) {
      throw new Error(
        `Screenshot was ${differencePercentage}% different from saved snapshot with ${diffPixelCount} different pixels.\n  See diff for details: ${diffOutputPath}`
      );
    }
  };
}

export function addMatchImageSnapshotCommand(
  name = 'matchImageSnapshot',
  options
) {
  const defaultOptions = typeof name === 'string' ? options : name;
  Cypress.Commands.add(name, matchImageSnapshotCommand(defaultOptions), {
    prevSubject: 'optional',
  });
}
