import TestRail, { CaseFilters } from "@dlenroc/testrail";
import { Options, Services } from "@wdio/types";
import type { TestRailServiceOptions, TestRailServer } from "./types";

export default class TestRailService implements Services.ServiceInstance {
  constructor(private _options: TestRailServiceOptions) {}

  // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
  async beforeSession(config: Options.Testrunner) {
    const cases = await this.selectCases(await this.connectToTestRail());
    const casesRegex = `/${cases.flat().join("|")}/`;

    if (config.mochaOpts instanceof Object) {
      if (config.mochaOpts.grep) {
        // User specified cases to run. Ignoring what TestRail says..."
      } else {
        config.mochaOpts["grep"] = casesRegex;
      }
    } else {
      config.mochaOpts = { grep: casesRegex };
    }
  }

  async selectCases(api: TestRail) {
    const caseFields = await api.getCaseFields();
    const automatedId = Number(
      caseFields
        .filter((field) => field.name === "automation")[0]
        .configs[0].options.items?.match(/(\d+), Automated/)?.[1]
    );
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
    return automatedCases;
  }

  async connectToTestRail() {
    return new TestRail({
      host: this._options.testrailServer.domain,
      username: this._options.testrailServer.username,
      password: this._options.testrailServer.apiToken,
    });
  }
}
