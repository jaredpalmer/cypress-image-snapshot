/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MATCH, RECORD } from './constants';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const updateSnapshots = Cypress.env('updateSnapshots') || false;

export function matchImageSnapshotCommand(defaultOptions) {
  return function matchImageSnapshot(subject, maybeName, commandOptions) {
    const options = {
      ...defaultOptions,
      ...((typeof maybeName === 'string' ? commandOptions : maybeName) || {}),
    };

    cy.task(MATCH, {
      screenshotsFolder,
      updateSnapshots,
      options,
    });

    const name = typeof maybeName === 'string' ? maybeName : undefined;
    const target = subject ? cy.wrap(subject) : cy;
    target.screenshot(name, options);

    return cy
      .task(RECORD)
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
  Cypress.Commands.add(
    name,
    {
      prevSubject: ['optional', 'element', 'window', 'document'],
    },
    matchImageSnapshotCommand(options)
  );
}
