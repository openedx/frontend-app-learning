# Changes

The purpose of this file is to document any changes done over upstream (https://github.com/openedx/frontend-app-learning).

## 2023-09-06

- Added `src/testExports.js` to export anything that needs to be reused for testing but we don't want to be on production builds.
- Added "exports" entry to package.json to expose test exports.
- Exported testing utils.
- Exported i18n messages.

## 2023-08-28

- Exported components required for using Sequence.
- Moved the following dependencies in package.json to peerDependencies and devDependencies in order to avoid conflicts when used as a library:
  - @edx/paragon
  - prop-types
  - react
  - react-dom
  - react-redux
  - react-router-dom
  - redux

## 2023-08-21

- Added `.github/pull_request_template.md`.

## 2023-08-17

- Added `src/exports.js` to export individual components and use this repo as a library.
- Added build command to Makefile, based on https://github.com/edx/frontend-component-header-edx/blob/v7.8.0/Makefile
- Added npm package: patch-package
- Added to package.json: Specify main script to enable this package to be used as a library ("main": "dist/exports.js")
- Added to package.json: Specify dist files
- Added to package.json: Postinstall script ("postinstall": "patch-package")
- Created patch for @edx/frontend-lib-special-exams which fixes import issues caused by bad "exports" entry in its package.json
- Added CHANGES.md (this file)
