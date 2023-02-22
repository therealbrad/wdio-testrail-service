"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const testrail_1 = __importDefault(require("@dlenroc/testrail"));
const logger_1 = __importDefault(require("@wdio/logger"));
const log = (0, logger_1.default)("wdio-testrail-service");
var mochaOptsGrepOriginal;
class TestRailService {
    constructor(_options) {
        this._options = _options;
    }
    // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
    beforeSession(config) {
        return __awaiter(this, void 0, void 0, function* () {
            log.debug("Starting TestRail Service");
            log.debug(`TestRail Service Options: ${JSON.stringify(this._options)}`);
            if (config.mochaOpts instanceof Object) {
                if (config.mochaOpts.grep) {
                    const originalGrep = config.mochaOpts.grep instanceof RegExp
                        ? config.mochaOpts.grep.source
                        : config.mochaOpts.grep;
                    const tags = originalGrep
                        .split(/[^a-z0-9@]/i)
                        .filter((item) => item.includes("@"));
                    const noTags = originalGrep
                        .split(/[^a-z0-9@]/i)
                        .filter((item) => !item.includes("@") && item.length > 0);
                    if (tags.length > 0) {
                        // log.debug("There are tags");
                        if (noTags.length === 0) {
                            // log.debug("There are only tags");
                            const tr_grep = yield this.selectCases(yield this.connectToTestRail());
                            config.mochaOpts["grep"] =
                                "/^(((?!@)|(" +
                                    tags.join("|") +
                                    ")).)*(" +
                                    tr_grep.substring(1, tr_grep.length - 1) +
                                    ")/";
                        }
                        else {
                            // log.debug("Mix of tags and no tags");
                            config.mochaOpts["grep"] =
                                "/^(((?!@)|(" +
                                    tags.join("|") +
                                    ")).)*(" +
                                    originalGrep.replace(/^(?:\/|\s)*|\B@[a-z0-9_-]+|(?:\/|\s)*$/gi, "") +
                                    ")/";
                        }
                    }
                    else {
                        // log.debug(
                        //   "mochaOpts.grep has no tags. Ignoring what TestRail says..."
                        // );
                    }
                }
                else {
                    // log.debug("No mochaOpts.grep defined. Setting...");
                    config.mochaOpts["grep"] = yield this.selectCases(yield this.connectToTestRail());
                }
            }
            else {
                // log.debug("No mochaOpts defined. Setting mochaOpts.grep...");
                config.mochaOpts = {
                    grep: yield this.selectCases(yield this.connectToTestRail()),
                };
            }
            log.info("TestRail Service done");
        });
    }
    selectCases(api) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            log.info("Getting cases from TestRail");
            const caseFields = yield api.getCaseFields();
            const automatedId = Number((_b = (_a = caseFields
                .filter((field) => field.name === "automation")[0]
                .configs[0].options.items) === null || _a === void 0 ? void 0 : _a.match(/(\d+), Automated/)) === null || _b === void 0 ? void 0 : _b[1]);
            if (!automatedId) {
                log.warn(`Either custom field named "automated" or option named "Automated" was not found. Will not filter test cases based on Automation status.`);
            }
            const allPriorities = yield api.getPriorities();
            const automatedCases = [];
            const projects = yield api.getProjects();
            for (const project of projects.filter((project) => this._options.projects.includes(project.name))) {
                const suites = yield api.getSuites(project.id);
                for (const suite of suites.filter((suite) => this._options.suites.includes(suite.name))) {
                    const caseFilters = {
                        suite_id: suite.id,
                        priority_id: allPriorities
                            .filter((priority) => this._options.priorities.includes(priority.short_name))
                            .map((priority) => {
                            return priority.id;
                        }),
                    };
                    const cases = yield api.getCases(project.id, caseFilters);
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
        });
    }
    connectToTestRail() {
        return __awaiter(this, void 0, void 0, function* () {
            log.info("Connecting to TestRail");
            return new testrail_1.default({
                host: this._options.testrailServer.domain,
                username: this._options.testrailServer.username,
                password: this._options.testrailServer.apiToken,
            });
        });
    }
}
exports.default = TestRailService;
