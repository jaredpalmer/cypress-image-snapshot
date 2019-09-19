import 'cypress';
import 'cypress/types';
import 'jest.d.ts';

import * as JestImageSnapshot from 'jest-image-snapshot';

declare global {
  interface cy {}
  namespace Cypress {
    interface Chainable {
      matchImageSnapshot: (
        options?:
          | string
          | (Partial<
              JestImageSnapshot.MatchImageSnapshotOptions &
                Loggable &
                Timeoutable &
                ScreenshotOptions
            >)
      ) => void;
    }
  }
}
