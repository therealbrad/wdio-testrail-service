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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var testrail_1 = __importDefault(require("@dlenroc/testrail"));
var logger_1 = __importDefault(require("@wdio/logger"));
var log = (0, logger_1.default)("wdio-testrail-service");
var TestRailService = /** @class */ (function () {
    function TestRailService(_options) {
        this._options = _options;
    }
    // If a hook returns a promise, WebdriverIO will wait until that promise is resolved to continue.
    TestRailService.prototype.beforeSession = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d, _e;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        log.debug("Starting TestRail Service");
                        log.debug("TestRail Service Options: ".concat(JSON.stringify(this._options)));
                        if (!(config.mochaOpts instanceof Object)) return [3 /*break*/, 5];
                        if (!config.mochaOpts.grep) return [3 /*break*/, 1];
                        log.debug("mochaOpts.grep already defined. Leaving it unchanged.");
                        return [3 /*break*/, 4];
                    case 1:
                        log.debug("mochaOpts.grep not defined. Getting cases to run...");
                        _a = config.mochaOpts;
                        _b = "grep";
                        _c = this.selectCases;
                        return [4 /*yield*/, this.connectToTestRail()];
                    case 2: return [4 /*yield*/, _c.apply(this, [_g.sent()])];
                    case 3:
                        _a[_b] = _g.sent();
                        log.debug("mochaOpts.grep = ".concat(config.mochaOpts.grep));
                        _g.label = 4;
                    case 4: return [3 /*break*/, 8];
                    case 5:
                        log.debug("No mochaOpts defined. Setting mochaOpts.grep...");
                        _d = config;
                        _f = {};
                        _e = this.selectCases;
                        return [4 /*yield*/, this.connectToTestRail()];
                    case 6: return [4 /*yield*/, _e.apply(this, [_g.sent()])];
                    case 7:
                        _d.mochaOpts = (_f.grep = _g.sent(),
                            _f);
                        log.debug("mochaOpts.grep = ".concat(config.mochaOpts.grep));
                        _g.label = 8;
                    case 8:
                        log.debug("TestRail Service done");
                        return [2 /*return*/];
                }
            });
        });
    };
    TestRailService.prototype.selectCases = function (api) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var caseFields, automatedId, allPriorities, automatedCases, projects, _i, _c, project, suites, _d, _e, suite_1, caseFilters, cases;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        log.info("Getting cases from TestRail");
                        return [4 /*yield*/, api.getCaseFields()];
                    case 1:
                        caseFields = _f.sent();
                        automatedId = Number((_b = (_a = caseFields
                            .filter(function (field) { return field.name === "automation"; })[0]
                            .configs[0].options.items) === null || _a === void 0 ? void 0 : _a.match(/(\d+), Automated/)) === null || _b === void 0 ? void 0 : _b[1]);
                        if (!automatedId) {
                            log.warn("Either custom field named \"automated\" or option named \"Automated\" was not found. Will not filter test cases based on Automation status.");
                        }
                        return [4 /*yield*/, api.getPriorities()];
                    case 2:
                        allPriorities = _f.sent();
                        automatedCases = [];
                        return [4 /*yield*/, api.getProjects()];
                    case 3:
                        projects = _f.sent();
                        _i = 0, _c = projects.filter(function (project) {
                            return _this._options.projects.includes(project.name);
                        });
                        _f.label = 4;
                    case 4:
                        if (!(_i < _c.length)) return [3 /*break*/, 10];
                        project = _c[_i];
                        return [4 /*yield*/, api.getSuites(project.id)];
                    case 5:
                        suites = _f.sent();
                        _d = 0, _e = suites.filter(function (suite) {
                            return _this._options.suites.includes(suite.name);
                        });
                        _f.label = 6;
                    case 6:
                        if (!(_d < _e.length)) return [3 /*break*/, 9];
                        suite_1 = _e[_d];
                        caseFilters = {
                            suite_id: suite_1.id,
                            priority_id: allPriorities
                                .filter(function (priority) {
                                return _this._options.priorities.includes(priority.short_name);
                            })
                                .map(function (priority) {
                                return priority.id;
                            }),
                        };
                        return [4 /*yield*/, api.getCases(project.id, caseFilters)];
                    case 7:
                        cases = _f.sent();
                        automatedCases.push(cases
                            .filter(function (testcase) { return testcase.custom_automation === automatedId; })
                            .map(function (testcase) {
                            return "C" + testcase.id;
                        }));
                        _f.label = 8;
                    case 8:
                        _d++;
                        return [3 /*break*/, 6];
                    case 9:
                        _i++;
                        return [3 /*break*/, 4];
                    case 10:
                        if (automatedCases.length === 0) {
                            log.error("No test case selected! Check your service options:\n        ".concat(JSON.stringify(this._options)));
                        }
                        return [2 /*return*/, "/".concat(automatedCases.flat().join("|"), "/")];
                }
            });
        });
    };
    TestRailService.prototype.connectToTestRail = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                log.info("Connecting to TestRail");
                return [2 /*return*/, new testrail_1.default({
                        host: this._options.testrailServer.domain,
                        username: this._options.testrailServer.username,
                        password: this._options.testrailServer.apiToken,
                    })];
            });
        });
    };
    return TestRailService;
}());
exports.default = TestRailService;
