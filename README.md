# wdio-testrail-service

With this plugin for [webdriver.io](https://webdriver.io/) you can choose test cases to execute based on Priority and Automation Status in TestRail.

Currently, the service only works with [mocha](https://mochajs.org/) test framework and assumes the TestRail Case ID is included in your mocha `describe` or `it` (or `suite`, `test` for TDD) blocks.

## Installation

The easiest way to install this module as a (dev-)dependency is by using the following command:

```sh
npm install wdio-testrail-service --save
```

Or:

```sh
npm install wdio-testrail-service --save-dev
```

## Usage

Add wdio-testrail-service and required options to your `wdio.conf.js`:

```javascript
exports.config = {
  // ...
 services: [
  [
   "testrail",
   {
    testrailServer: {
     domain: "https://xxxx.testrail.io",
     username: "TestRailUsername",
     apiToken: "TestRailAPIToken",
    },
    projects: ["Web Application"],
    suites: ["Smoke Tests", "Regression Tests"],
    priorities: ["Critical", "High"],
   },
  ],
 ],
  // ...
};
```

## Options

### testrailServer <sub>*(required)*</sub>

Object containing information required to connect to your TestRail instance:

* domain: "https://xxxx.testrail.io"
* username: "TestRailUsername"
* apiToken: "TestRailAPIToken"

### projects <sub>*(required)*</sub>

Array of Project Names to choose tests from.

### suites <sub>*(required)*</sub>

Array of Suite Names to choose tests from.

### priorities <sub>*(required)*</sub>

Array of Priority Names to choose tests from. Use the short name (also called *Abbreviation* in TestRail).

## Notes

1. The service assume you have a custom Dropdown or Multi-select case field named `automation` with an option named `Automated`. With this case field, any case not marked as `Automated` will be excluded from running.

1. The service considers cucumber-like tagging. For example, supplying `mocha-opts.grep "@sanity @smoke"` will only include test cases with either `@sanity` or `@smoke` in the describe or it blocks in addition to filtering by Priority and Automated status.

1. Specifying mochaOpts.grep without a tag (no `@` in the string) will override this service completely.

1. If you enter invalid Priorities, all Priorities will be included.

For more information on WebdriverIO see the [homepage](https://webdriver.io).
