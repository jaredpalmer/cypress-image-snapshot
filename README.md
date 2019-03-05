# Cypress Image Snapshot

Cypress Image Snapshot binds [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)'s image diffing logic to [Cypress.io](https://cypress.io) commands. **The goal is to catch visual regressions during integration tests.**

<details>
<summary>See it in action!</summary>

### Cypress GUI

When using `cypress open`, errors are displayed in the GUI.

<img width="500px" src="https://user-images.githubusercontent.com/4060187/41942389-5a6705ae-796d-11e8-8003-fadbf7ccf43d.gif" alt="Cypress Image Snapshot in action"/>

### Composite Image Diff

When an image diff fails, a composite image is constructed.

<img width="500px" src="https://user-images.githubusercontent.com/4060187/41942163-72c8c20a-796c-11e8-9149-c295341864d3.png" alt="Cypress Image Snapshot diff"/>

### Test Reporter

When using `cypress run` and `--reporter cypress-image-snapshot/reporter`, diffs are output to your terminal.

<img width="500px" src="https://user-images.githubusercontent.com/1153686/48518011-303d4580-e836-11e8-83ed-776acae78f9f.png" alt="Cypress Image Snapshot reporter"/>

</details>

## Installation

Install from npm

```bash
npm install --save-dev cypress-image-snapshot
```

then add the following in your project's `<rootDir>/cypress/plugins/index.js`:

```js
const {
  addMatchImageSnapshotPlugin,
} = require('cypress-image-snapshot/plugin');

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
};
```

and in `<rootDir>/cypress/support/commands.js` add:

```js
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand();
```

## Syntax

```js
// addMatchImageSnapshotPlugin
addMatchImageSnapshotPlugin(on, config);

// addMatchImageSnapshotCommand
addMatchImageSnapshotCommand();
addMatchImageSnapshotCommand(commandName);
addMatchImageSnapshotCommand(options);
addMatchImageSnapshotCommand(commandName, options);

// matchImageSnapshot
.matchImageSnapshot();
.matchImageSnapshot(name);
.matchImageSnapshot(options);
.matchImageSnapshot(name, options);

// ---or---

cy.matchImageSnapshot();
cy.matchImageSnapshot(name);
cy.matchImageSnapshot(options);
cy.matchImageSnapshot(name, options);
```

## Usage

### In your tests

```js
describe('Login', () => {
  it('should be publicly accessible', () => {
    cy.visit('/login');

    // snapshot name will be the test title
    cy.matchImageSnapshot();

    // snapshot name will be the name passed in
    cy.matchImageSnapshot('login');

    // options object passed in
    cy.matchImageSnapshot(options);

    // match element snapshot
    cy.get('#login').matchImageSnapshot();
  });
});
```

### Updating snapshots

Run Cypress with `--env updateSnapshots=true` in order to update the base image files for all of your tests.

### Preventing failures

Run Cypress with `--env failOnSnapshotDiff=false` in order to prevent test failures when an image diff does not pass.

### Reporter

Run Cypress with `--reporter cypress-image-snapshot/reporter` in order to report snapshot diffs in your test results. This can be helpful to use with `--env failOnSnapshotDiff=false` in order to quickly view all failing snapshots and their diffs.

If you using [iTerm2](https://www.iterm2.com/version3.html), the reporter will output any image diffs right in your terminal 😎.

#### Multiple reporters

Similar use case to: https://github.com/cypress-io/cypress-example-docker-circle#spec--xml-reports

If you want to report snapshot diffs as well as generate XML junit reports, you can use [mocha-multi-reporters](https://github.com/stanleyhlng/mocha-multi-reporters).

```
npm install --save-dev mocha mocha-multi-reporters mocha-junit-reporter
```

You'll then want to set up a `cypress-reporters.json` which may look a little like this:

```json
{
  "reporterEnabled": "spec, mocha-junit-reporter, cypress-image-snapshot/reporter",
  "mochaJunitReporterReporterOptions": {
    "mochaFile": "cypress/results/results-[hash].xml"
  }
}
```

where `reporterEnabled` is a comma-separated list of reporters.

You can then run cypress like this:

`cypress run --reporter mocha-multi-reporters --reporter-options configFile=cypress-reporters.json`

or add the following to your `cypress.json`

```
{
  ..., //other options
  "reporter": "mocha-multi-reporters",
  "reporterOptions": {
    "configFile": "cypress-reporters.json"
  }
}
```

## Options

- `customSnapshotsDir` : Path to the directory that snapshot images will be written to, defaults to `<rootDir>/cypress/snapshots`.
- `customDiffDir`: Path to the directory that diff images will be written to, defaults to a sibling `__diff_output__` directory alongside each snapshot.

Additionally, any options for [`cy.screenshot()`](https://docs.cypress.io/api/commands/screenshot.html#Arguments) and [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot#optional-configuration) can be passed in the `options` argument to `addMatchImageSnapshotCommand` and `cy.matchImageSnapshot()`. The local options in `cy.matchImageSnapshot()` will overwrite the default options set in `addMatchImageSnapshot`.

For example, the default options we use in `<rootDir>/cypress/support/commands.js` are:

```js
addMatchImageSnapshotCommand({
  failureThreshold: 0.03, // threshold for entire image
  failureThresholdType: 'percent', // percent of image or number of pixels
  customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
  capture: 'viewport', // capture viewport in screenshot
});
```

## How it works

We really enjoy the diffing workflow of jest-image-snapshot and wanted to have a similar workflow when using Cypress. Because of this, under the hood we use some of jest-image-snapshot's internals and simply bind them to Cypress's commands and plugins APIs.

The workflow of `cy.matchImageSnapshot()` when running Cypress is:

1.  Take a screenshot with `cy.screenshot()` named according to the current test.
2.  Check if a saved snapshot exists in `<rootDir>/cypress/snapshots` and if so diff against that snapshot.
3.  If there is a resulting diff, save it to `<rootDir>/cypress/snapshots/__diff_output__`.

## Cypress Version Requirements

Cypress's screenshot functionality has changed significantly across `3.x.x` versions. In order to avoid buggy behavior, please use the following version ranges:

- `cypress-image-snapshot@>=1.0.0 <2.0.0` for `cypress@>=3.0.0 <3.0.2`
- `cypress-image-snapshot@>2.0.0` for `cypress@>3.0.2`.
