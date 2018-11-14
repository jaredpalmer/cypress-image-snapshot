# Cypress Image Snapshot

Cypress Image Snapshot binds [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)'s image diffing logic to [Cypress.io](https://cypress.io) commands. **The goal is to catch visual regressions during integration tests.**

<details>
<summary>See it in action!</summary>

Here's what it looks like when tests run with the Cypress GUI.

<img width="500px" src="https://user-images.githubusercontent.com/4060187/41942389-5a6705ae-796d-11e8-8003-fadbf7ccf43d.gif" alt="Cypress Image Snapshot in action"/>

This then constructs/uploads an image diff for analysis.

<img width="500px" src="https://user-images.githubusercontent.com/4060187/41942163-72c8c20a-796c-11e8-9149-c295341864d3.png" alt="Cypress Image Snapshot Diff"/>

Boom! Turns out you probably can't delete that intern's CSS from 6 months ago that somehow made its way to prod. :see_no_evil:

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

module.exports = on => {
  addMatchImageSnapshotPlugin(on);
};
```

and in `<rootDir>/cypress/support/commands.js` add:

```js
import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand(options);
```

## Syntax

```js
// addMatchImageSnapshotPlugin
addMatchImageSnapshotPlugin(on);

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
4.  If the diff is intended, run Cypress again with `--env updateSnapshots=true` to update the snapshots.
