export interface TestRailServer {
    domain: string;
    username: string;
    apiToken: string;
}
export interface TestRailServiceOptions {
    /**
     * TestRail Server info
     */
    testrailServer: TestRailServer;
    /**
     * Array of project names
     */
    projects: string[];
    /**
     * Array of Suite Names
     */
    suites: string[];
    /**
     * Array of Priority Short Names
     */
    priorities: string[];
}
