import TestRail from "@dlenroc/testrail";
import { Options, Services } from "@wdio/types";
import type { TestRailServiceOptions } from "./types";
export default class TestRailService implements Services.ServiceInstance {
    private _options;
    constructor(_options: TestRailServiceOptions);
    beforeSession(config: Options.Testrunner): Promise<void>;
    selectCases(api: TestRail): Promise<string>;
    connectToTestRail(): Promise<TestRail>;
}
