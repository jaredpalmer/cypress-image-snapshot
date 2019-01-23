import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

Cypress.Commands.add('matchImageSnapshot', options => {
    addMatchImageSnapshotCommand(options);
});
