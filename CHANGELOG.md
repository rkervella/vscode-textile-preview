# Change Log
All notable changes to the "vscode-textile-preview" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [0.3.1] - 2017-10-20
### Fixed
- [INTERNAL] Build process was broken (I was using a patched version of vscode-nls-dev)
- [CSS] Fix : #23, #27

## Added
- [INTERNAL] Add Travis CI, to launch test suite after each push to the repository : Linux & OS X

## Changed
- [CSS] Splitted to ease future updates


## [0.3.0] - 2019-10-17
### Added
- [DOC] Adhere to CII best practices
- [DOC] Create code of conduct
- [DOC] Add features summary

### Fixed
- [DOC] Bigger icon

### Changed
- [DOC] Roadmap updated


## [0.2.8] - 2019-10-13
### Changed
- Update to vscode-1.39.1


## [0.2.7] - 2019-10-11
### Changed
- [INTERNAL] pack the extension with webpack

### Added
- [DOC] Add more stats

## Fixed
- [INTERNAL] Reactivate src processing, in the tool to import sources from vscode
- [INTERNAL] Improve src processing, in the tool to import sources from vscode
- [CSS] corrections // vscode


## [0.2.6] - 2019-10-09
### Changed
- Udate translations from vscode-loc repo

### Fixed
- [INTERNAL] vscode-nls : use 1 file bundle


## [0.2.5] - 2019-10-08
### Added
- [INTERNAL] : Add .d.ts for textile-js library
- [INTERNAL] : Imports the tests from mardown preview, when they are coherent for Textile.
- [DOC] : Add screencast to show some features

### Fixed
- [INTERNAL] : in root tsconfig.json file, reactivate : noImplicitAny

### Changed
- bugs/enhancements are now reported on GitHub issues
- roadmap is now in GitHub project


## [0.2.4] - 2019-10-06
### Added
- translations : DE, ES, IT, KO, RU, ZH-TW, ZH-CN. Now, all the 9 core languages are imported : https://github.com/microsoft/vscode-loc/#visual-studio-code-language-packs


## [0.2.3] - 2019-10-06
### Changed
- [INTERNAL] : prepare the import tool for batch processing of translations.
- Update FR and EN translations

### Added
- JA translation


## [0.2.2] - 2019-09-27
### Fixed
- Initialize correctly vscode-nls
- Checked : dependencies are now recent enough depencies (gulp, ... ?)

### Changed
- Remove Telemetry Reporter, as it requires a non free Azure account
- update to vscode-nls-dev > 2.0.1


## [0.2.1] - 2019-09-26
### Fixed
- webpack generated files were missing from the VSIX package
- correctly depends on vscode
- correct VSIX file was broken due to dependencies not installed by vscode


## [0.2.0] - 2019-09-26
### Fixed
- vscode-nls : integrate French entirely
- add LICENSES directory, and change links from ./README.md
- check all links in ./README.md
- fix github security alerts

### Changed
- change logo, remove old png/svg
- choose publisher
- update version to 0.2.0, compile, publish to marketplace, publish to github


## [0.1.2] - 2019-09-25
- Initial release