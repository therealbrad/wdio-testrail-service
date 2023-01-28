import type { Options } from "@wdio/types";

export interface TestRailServer {
  domain: string; // your-domain.testrail.io
  username: string; // TestRail username
  apiToken: string; // TestRail API Token
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
