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

    let cypressContext = Cypress.mocha.getRunner().suite.ctx.test;
    let cypressPath = [cypressContext.title];
    let rootCypressContext = cypressContext;
    while (rootCypressContext.parent != null) {
      rootCypressContext = rootCypressContext.parent;
      cypressPath.push(rootCypressContext.title);
    }

    var name = typeof maybeName === 'string' ? maybeName : undefined;
    const rawSnapshotFilepath = cypressContext.titlePath();
    const snapshotFilepath = rawSnapshotFilepath.map(str =>
      str.replace(/[/\\?%*:| "<>]/g, '-').toLowerCase()
    );
    if (name == undefined && snapshotFilepath.length > 0) {
      // if the snapshot name is not specified use the name of the test case
      name = snapshotFilepath.pop();
    }
    let forceWaiting = false;

    const match = () => {
      cy.task(MATCH, {
        screenshotsFolder,
        updateSnapshots,
        snapshotFilepath,
        snapshotName: name,
        options,
      }).then(ret => {
        forceWaiting = !ret.snapshotExists;
        if (forceWaiting) {
          // if we are recording a test case for the first time we
          // need to wait for the result to be correct instead of retrying
          cy.wait(timeout);
        }

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
                  if (currentTime - startTime < timeout && !forceWaiting) {
                    // retry matching the image
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
      });
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
