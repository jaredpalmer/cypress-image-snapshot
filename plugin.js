'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.cachePath = undefined;

var _extends =
  Object.assign ||
  function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };

exports.matchImageSnapshotOptions = matchImageSnapshotOptions;
exports.matchImageSnapshotResult = matchImageSnapshotResult;
exports.matchImageSnapshotPlugin = matchImageSnapshotPlugin;
exports.addMatchImageSnapshotPlugin = addMatchImageSnapshotPlugin;

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _diffSnapshot = require('jest-image-snapshot/src/diff-snapshot');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pkgDir = require('pkg-dir');

var _pkgDir2 = _interopRequireDefault(_pkgDir);

var _constants = require('./constants');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _objectWithoutProperties(obj, keys) {
  var target = {};
  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }
  return target;
}
/**
 * Copyright (c) 2018-present The Palmer Group
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let snapshotOptions = {};
let snapshotResult = {};
let snapshotRunning = false;
const kebabSnap = '-snap.png';
const dotSnap = '.snap.png';
const dotDiff = '.diff.png';

const cachePath = (exports.cachePath = _path2.default.join(
  _pkgDir2.default.sync(process.cwd()),
  'cypress',
  '.snapshot-report'
));

function matchImageSnapshotOptions() {
  return (options = {}) => {
    snapshotOptions = options;
    snapshotRunning = true;
    return null;
  };
}

function matchImageSnapshotResult() {
  return () => {
    snapshotRunning = false;

    const { pass, added, updated } = snapshotResult;

    // @todo is there a less expensive way to share state between test and reporter?
    if (
      !pass &&
      !added &&
      !updated &&
      _fsExtra2.default.existsSync(cachePath)
    ) {
      const cache = JSON.parse(
        _fsExtra2.default.readFileSync(cachePath, 'utf8')
      );
      cache.push(snapshotResult);
      _fsExtra2.default.writeFileSync(cachePath, JSON.stringify(cache), 'utf8');
    }

    return snapshotResult;
  };
}

function matchImageSnapshotPlugin({ path: screenshotPath }) {
  if (!snapshotRunning) {
    return null;
  }

  const {
      screenshotsFolder,
      updateSnapshots,
      options: {
        failureThreshold = 0,
        failureThresholdType = 'pixel',
        customSnapshotsDir,
        customDiffDir,
      } = {},
    } = snapshotOptions,
    options = _objectWithoutProperties(snapshotOptions.options, [
      'failureThreshold',
      'failureThresholdType',
      'customSnapshotsDir',
      'customDiffDir',
    ]);

  const receivedImageBuffer = _fsExtra2.default.readFileSync(screenshotPath);
  _fsExtra2.default.removeSync(screenshotPath);

  const { dir: screenshotDir, name: snapshotIdentifier } = _path2.default.parse(
    screenshotPath
  );

  const relativePath = _path2.default.relative(
    screenshotsFolder,
    screenshotDir
  );
  const snapshotsDir = customSnapshotsDir
    ? _path2.default.join(process.cwd(), customSnapshotsDir, relativePath)
    : _path2.default.join(screenshotsFolder, '..', 'snapshots', relativePath);

  const snapshotKebabPath = _path2.default.join(
    snapshotsDir,
    `${snapshotIdentifier}${kebabSnap}`
  );
  const snapshotDotPath = _path2.default.join(
    snapshotsDir,
    `${snapshotIdentifier}${dotSnap}`
  );

  const diffDir = customDiffDir
    ? _path2.default.join(process.cwd(), customDiffDir, relativePath)
    : _path2.default.join(snapshotsDir, '__diff_output__');
  const diffDotPath = _path2.default.join(
    diffDir,
    `${snapshotIdentifier}${dotDiff}`
  );

  if (_fsExtra2.default.pathExistsSync(snapshotDotPath)) {
    _fsExtra2.default.copySync(snapshotDotPath, snapshotKebabPath);
  }

  snapshotResult = (0, _diffSnapshot.diffImageToSnapshot)(
    _extends(
      {
        snapshotsDir,
        diffDir,
        receivedImageBuffer,
        snapshotIdentifier,
        failureThreshold,
        failureThresholdType,
        updateSnapshot: updateSnapshots,
      },
      options
    )
  );

  const { pass, added, updated, diffOutputPath } = snapshotResult;

  if (!pass && !added && !updated) {
    _fsExtra2.default.copySync(diffOutputPath, diffDotPath);
    _fsExtra2.default.removeSync(diffOutputPath);
    _fsExtra2.default.removeSync(snapshotKebabPath);
    snapshotResult.diffOutputPath = diffDotPath;

    return {
      path: diffDotPath,
    };
  }

  _fsExtra2.default.copySync(snapshotKebabPath, snapshotDotPath);
  _fsExtra2.default.removeSync(snapshotKebabPath);
  snapshotResult.diffOutputPath = snapshotDotPath;

  return {
    path: snapshotDotPath,
  };
}

function addMatchImageSnapshotPlugin(on, config) {
  on('task', {
    [_constants.MATCH]: matchImageSnapshotOptions(config),
    [_constants.RECORD]: matchImageSnapshotResult(config),
  });
  on('after:screenshot', matchImageSnapshotPlugin);
}
