const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const {
  diffImageToSnapshot,
} = require('jest-image-snapshot/src/diff-snapshot');

export function matchImageSnapshotPlugin({
  fileName,
  screenshotsFolder,
  fileServerFolder,
  updateSnapshots,
  options,
}) {
  const snapshotPath = path.join(screenshotsFolder, `${fileName}.png`);
  const receivedImageBuffer = fs.readFileSync(snapshotPath);

  const result = diffImageToSnapshot({
    snapshotsDir: path.join(fileServerFolder, 'cypress', 'snapshots'),
    updateSnapshot: updateSnapshots,
    receivedImageBuffer,
    snapshotIdentifier: fileName,
    ...options,
  });

  childProcess.spawnSync('cp', [result.diffOutputPath, snapshotPath]);

  return result;
}

export function addMatchImageSnapshotPlugin(on) {
  on('task', { matchImageSnapshotPlugin });
}
