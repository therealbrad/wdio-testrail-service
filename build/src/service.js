"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testrail_1 = __importDefault(require("@dlenroc/testrail"));
class TestRailService {
    _options;
    constructor(_options) {
        this._options = _options;
    }
    // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
    async beforeSession(config) {
        const cases = await this.selectCases(await this.connectToTestRail());
        const casesRegex = `/${cases.flat().join("|")}/`;
        if (config.mochaOpts instanceof Object) {
            if (config.mochaOpts.grep) {
                // User specified cases to run. Ignoring what TestRail says..."
            }
            else {
                config.mochaOpts["grep"] = casesRegex;
            }
        }
        else {
            config.mochaOpts = { grep: casesRegex };
        }
    }
    async selectCases(api) {
        const caseFields = await api.getCaseFields();
        const automatedId = Number(caseFields
            .filter((field) => field.name === "automation")[0]
            .configs[0].options.items?.match(/(\d+), Automated/)?.[1]);
        const allPriorities = await api.getPriorities();
        const automatedCases = [];
        const projects = await api.getProjects();
        for (const project of projects.filter((project) => this._options.projects.includes(project.name))) {
            const suites = await api.getSuites(project.id);
            for (const suite of suites.filter((suite) => this._options.suites.includes(suite.name))) {
                const caseFilters = {
                    suite_id: suite.id,
                    priority_id: allPriorities
                        .filter((priority) => this._options.priorities.includes(priority.short_name))
                        .map((priority) => {
                        return priority.id;
                    }),
                };
                const cases = await api.getCases(project.id, caseFilters);
                automatedCases.push(cases
                    .filter((testcase) => testcase.custom_automation === automatedId)
                    .map((testcase) => {
                    return "C" + testcase.id;
                }));
            }
        }
        return automatedCases;
    }
    async connectToTestRail() {
        return new testrail_1.default({
            host: this._options.testrailServer.domain,
            username: this._options.testrailServer.username,
            password: this._options.testrailServer.apiToken,
        });
    }
}
exports.default = TestRailService;
