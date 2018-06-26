# Cypress Image Snapshot

Cypress Image Snapshot binds [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot)'s image diffing logic to [Cypress.io](https://cypress.io) commands.

![Cypress Image Snapshot Diff](https://user-images.githubusercontent.com/4060187/41942163-72c8c20a-796c-11e8-9149-c295341864d3.png)


## Installation

Install from npm

```bash
npm install cypress-image-snapshot
```

then add the following in your project's `<rootDir>/cypress/plugins/index.js`:

```js
const { addMatchImageSnapshotPlugin } = require('cypress-image-snapshot/plugin');

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

Any options for [`cy.screenshot()`](https://docs.cypress.io/api/commands/screenshot.html#Arguments) and [jest-image-snapshot](https://github.com/americanexpress/jest-image-snapshot#optional-configuration) can be passed in the `options` argument to `addMatchImageSnapshotCommand` and `cy.matchImageSnapshot()`.  The local options in `cy.matchImageSnapshot()` will overwrite the default options set in `addMatchImageSnapshot`.

For example, the default options we use in `<rootDir>/cypress/support/commands.js` are:

```js
import kebabCase from 'lodash/kebabcase';

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
3.  If there is a resulting diff, save it to `<rootDir>/cypress/snapshots/__diff_output__` and `<rootDir>/cypress/screenshots` (so that the diff is uploaded to Cypress' dashboard).
4.  If the diff is intended, run Cypress again with `--config updateSnapshots=true` to update the snapshots.
