"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testrail_1 = __importDefault(require("@dlenroc/testrail"));
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)("wdio-testrail-service");
class TestRailService {
    _options;
    constructor(_options) {
        this._options = _options;
    }
    // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
    async beforeSession(config) {
        log.debug("Starting TestRail Service");
        log.debug(`TestRail Service Options: ${JSON.stringify(this._options)}`);
        if (config.mochaOpts instanceof Object) {
            if (config.mochaOpts.grep) {
                log.debug("mochaOpts.grep already defined. Leaving it unchanged.");
            }
            else {
                log.debug("mochaOpts.grep not defined. Getting cases to run...");
                config.mochaOpts["grep"] = await this.selectCases(await this.connectToTestRail());
                log.debug(`mochaOpts.grep = ${config.mochaOpts.grep}`);
            }
        }
        else {
            log.debug("No mochaOpts defined. Setting mochaOpts.grep...");
            config.mochaOpts = {
                grep: await this.selectCases(await this.connectToTestRail()),
            };
            log.debug(`mochaOpts.grep = ${config.mochaOpts.grep}`);
        }
        log.debug("TestRail Service done");
    }
    async selectCases(api) {
        log.info("Getting cases from TestRail");
        const caseFields = await api.getCaseFields();
        const automatedId = Number(caseFields
            .filter((field) => field.name === "automation")[0]
            .configs[0].options.items?.match(/(\d+), Automated/)?.[1]);
        if (!automatedId) {
            log.warn(`Either custom field named "automated" or option named "Automated" was not found. Will not filter test cases based on Automation status.`);
        }
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
        if (automatedCases.length === 0) {
            log.error(`No test case selected! Check your service options:
        ${JSON.stringify(this._options)}`);
        }
        return `/${automatedCases.flat().join("|")}/`;
    }
    async connectToTestRail() {
        log.info("Connecting to TestRail");
        return new testrail_1.default({
            host: this._options.testrailServer.domain,
            username: this._options.testrailServer.username,
            password: this._options.testrailServer.apiToken,
        });
    }
}
exports.default = TestRailService;
