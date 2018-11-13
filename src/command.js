import { COMPARE_OPTIONS, COMPARE_RESULT } from "./constants";

const matchImageSnapshotCommand = (subject, maybeName, maybeOptions) => {
    // Check if first parameter is a string, if so use it as the snapshot name, if not assume it are the options.
  const name = typeof maybeName === 'string' ? maybeName : undefined;
  const options = (name) ? maybeOptions : maybeName

  cy.task(COMPARE_OPTIONS, options)

  const target = subject ? cy.wrap(subject) : cy;
  target.screenshot(name, options);

  return cy.task(COMPARE_RESULT)
};

const addMatchImageSnapshotCommand = (
  name = 'matchImageSnapshot'
) => {
  Cypress.Commands.add(
    name,
    {
      prevSubject: ['optional', 'element', 'window', 'document'],
    },
    matchImageSnapshotCommand
  );
}

export {
    addMatchImageSnapshotCommand
}