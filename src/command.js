/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MATCH, RECORD } from './constants';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const updateSnapshots = Cypress.env('updateSnapshots') || false;
const failOnSnapshotDiff =
  typeof Cypress.env('failOnSnapshotDiff') === 'undefined';

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
            const message = `Screenshot was ${diffRatio *
              100}% different from saved snapshot with ${diffPixelCount} different pixels.\n  See diff for details: ${diffOutputPath}`;

            if (failOnSnapshotDiff) {
              throw new Error(message);
            } else {
              Cypress.log({ message });
            }
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
