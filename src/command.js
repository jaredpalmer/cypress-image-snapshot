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

    const timeout = options.timeout || Cypress.config('defaultCommandTimeout');

    const startTime = Date.now();

    const match = () => {
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
            diffSize,
            imageDimensions,
            diffRatio,
            diffPixelCount,
            diffOutputPath,
          }) => {
            if (!pass && !added && !updated) {
              const message = diffSize
                ? `Image size (${imageDimensions.baselineWidth}x${
                    imageDimensions.baselineHeight
                  }) different than saved snapshot size (${
                    imageDimensions.receivedWidth
                  }x${
                    imageDimensions.receivedHeight
                  }).\nSee diff for details: ${diffOutputPath}`
                : `Image was ${diffRatio *
                    100}% different from saved snapshot with ${diffPixelCount} different pixels.\nSee diff for details: ${diffOutputPath}`;

              if (failOnSnapshotDiff) {
                const currentTime = Date.now();
                if (currentTime - startTime < timeout) {
                  match();
                } else {
                  throw new Error(message);
                }
              } else {
                Cypress.log(message);
              }
            }
          }
        );
    };
    match();
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
