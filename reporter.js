'use strict';

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _termImg = require('term-img');

var _termImg2 = _interopRequireDefault(_termImg);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _plugin = require('./plugin');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function fallback() {
  // do nothing
}

function reporter(runner) {
  _fsExtra2.default.writeFileSync(
    _plugin.cachePath,
    JSON.stringify([]),
    'utf8'
  );

  runner.on('end', () => {
    const cache = JSON.parse(
      _fsExtra2.default.readFileSync(_plugin.cachePath, 'utf8')
    );
    if (cache.length) {
      console.log(
        _chalk2.default.red(
          `\n  (${_chalk2.default.underline.bold('Snapshot Diffs')})`
        )
      );

      cache.forEach(({ diffRatio, diffPixelCount, diffOutputPath }) => {
        console.log(
          `\n  - ${diffOutputPath}\n    Screenshot was ${diffRatio *
            100}% different from saved snapshot with ${diffPixelCount} different pixels.\n`
        );
        (0, _termImg2.default)(diffOutputPath, { fallback });
      });
    }

    _fsExtra2.default.removeSync(_plugin.cachePath);
  });
}

module.exports = reporter;
