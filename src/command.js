import kebabCase from 'lodash.kebabcase';

const screenshotsFolder = Cypress.config('screenshotsFolder');
const fileServerFolder = Cypress.config('fileServerFolder');
const updateSnapshots = Cypress.config('updateSnapshots') || false;

const defaultFileNameTransform = (name = '', test) =>
  kebabCase(`${test.parent.title}-${test.title}-${name}`);

export function matchImageSnapshotCommand(defaultOptions) {
  return function matchImageSnapshot(subject, name, commandOptions) {
    const options = {
      ...defaultOptions,
      ...((typeof name === 'string' ? commandOptions : name) || {}),
    };

    const { fileNameTransform = defaultFileNameTransform } = options;
    const fileName = fileNameTransform(name, this.test);

    const target = subject ? subject : cy;
    target.screenshot(fileName, options);

    cy.task('matchImageSnapshotPlugin', {
      fileName,
      screenshotsFolder,
      fileServerFolder,
      updateSnapshots,
      options,
    }).then(
      ({ pass, added, updated, diffRatio, diffPixelCount, diffOutputPath }) => {
        const differencePercentage = diffRatio * 100;
        if (!pass && !added && !updated) {
          throw new Error(
            `Expected image to match or be a close match to snapshot but was ${differencePercentage}% different from snapshot (${diffPixelCount} differing pixels).\n` +
              `See diff for details: ${diffOutputPath}`
          );
        }
      }
    );
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
