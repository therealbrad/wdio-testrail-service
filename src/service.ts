import TestRail, { CaseFilters } from "@dlenroc/testrail";
import { Options, Services } from "@wdio/types";
import type { TestRailServiceOptions, TestRailServer } from "./types";
import logger from "@wdio/logger";
const log = logger("wdio-testrail-service");
var mochaOptsGrepOriginal: String | RegExp;
export default class TestRailService implements Services.ServiceInstance {
  constructor(private _options: TestRailServiceOptions) {}

  // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
  async beforeSession(config: Options.Testrunner) {
    log.debug("Starting TestRail Service");
    log.debug(`TestRail Service Options: ${JSON.stringify(this._options)}`);

    if (config.mochaOpts instanceof Object) {
      if (config.mochaOpts.grep) {
        const originalGrep =
          config.mochaOpts.grep instanceof RegExp
            ? config.mochaOpts.grep.source
            : config.mochaOpts.grep;
        const tags = originalGrep
          .split(/[^a-z0-9@]/i)
          .filter((item) => item.includes("@"));
        const noTags = originalGrep
          .split(/[^a-z0-9@]/i)
          .filter((item) => !item.includes("@") && item.length > 0);
        if (tags.length > 0 && !config.mochaOpts.invert) {
          log.debug("There are tags");
          if (noTags.length === 0) {
            log.debug("There are only tags");
            const tr_grep = await this.selectCases(
              await this.connectToTestRail()
            );
            config.mochaOpts["grep"] =
              "/^(((?!@)|(" +
              tags.join("|") +
              ")).)*(" +
              tr_grep.substring(1, tr_grep.length - 1) +
              ")/";
          } else {
            log.debug("Mix of tags and no tags");
            config.mochaOpts["grep"] =
              "/^(((?!@)|(" +
              tags.join("|") +
              ")).)*(" +
              originalGrep
                .replace(/^(?:\/|\s)*|\B@[a-z0-9_-]+|(?:\/|\s)*$/gi, "")
                .trim() +
              ")/";
          }
        } else {
          log.debug(
            "mochaOpts.grep supplied without tags. Ignoring what TestRail says..."
          );
        }
      } else {
        log.debug("No mochaOpts.grep defined. Setting...");
        config.mochaOpts["grep"] = await this.selectCases(
          await this.connectToTestRail()
        );
      }
    } else {
      log.debug("No mochaOpts defined. Setting mochaOpts.grep...");
      config.mochaOpts = {
        grep: await this.selectCases(await this.connectToTestRail()),
      };
    }

    log.info("TestRail Service done");
    log.debug(`Updated mochaOpts.grep: ${config.mochaOpts.grep}`);
  }

  async selectCases(api: TestRail) {
    log.info("Getting cases from TestRail");
    const caseFields = await api.getCaseFields();
    const automatedId = Number(
      caseFields
        .filter((field) => field.name === "automation")[0]
        .configs[0].options.items?.match(/(\d+), Automated/)?.[1]
    );
    if (!automatedId) {
      log.warn(
        `Either custom field named "automated" or option named "Automated" was not found. Will not filter test cases based on Automation status.`
      );
    }
    const allPriorities = await api.getPriorities();
    const automatedCases: string[][] = [];

    const projects = await api.getProjects();
    for (const project of projects.filter((project) =>
      this._options.projects.includes(project.name)
    )) {
      const suites = await api.getSuites(project.id);
      for (const suite of suites.filter((suite) =>
        this._options.suites.includes(suite.name)
      )) {
        const caseFilters: CaseFilters = {
          suite_id: suite.id,
          priority_id: allPriorities
            .filter((priority) =>
              this._options.priorities.includes(priority.short_name)
            )
            .map((priority) => {
              return priority.id;
            }),
        };
        const cases = await api.getCases(project.id, caseFilters);
        automatedCases.push(
          cases
            .filter((testcase) => testcase.custom_automation === automatedId)
            .map((testcase) => {
              return "C" + testcase.id;
            })
        );
      }
    }
    if (automatedCases.length === 0) {
      log.error(
        `No test case selected! Check your service options:
        ${JSON.stringify(this._options)}`
      );
    }
    return `/${automatedCases.flat().join("|")}/`;
  }

  async connectToTestRail() {
    log.info("Connecting to TestRail");
    return new TestRail({
      host: this._options.testrailServer.domain,
      username: this._options.testrailServer.username,
      password: this._options.testrailServer.apiToken,
    });
  }
}
