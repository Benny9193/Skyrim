import { execSync } from "child_process";

export class GitHubClient {
  private ghPath: string;

  constructor() {
    // On Windows, gh might be in Program Files
    this.ghPath = process.platform === "win32"
      ? '"C:\\Program Files\\GitHub CLI\\gh.exe"'
      : "gh";
  }

  private checkGitHubAuth() {
    try {
      execSync(`${this.ghPath} auth status`, { stdio: "pipe" });
    } catch {
      throw new Error(
        "GitHub CLI not authenticated. Run 'gh auth login' first."
      );
    }
  }

  private sanitizeInput(input: string | number): string {
    const str = String(input);
    // Basic sanitization to prevent command injection
    if (!/^[\w\-\.\/]+$/.test(str)) {
      // Allow alphanumeric, hyphens, dots, and slashes only
      throw new Error(`Invalid input format: ${str}`);
    }
    return str;
  }

  async getPRInfo(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safePR = this.sanitizeInput(prNumber);

      const output = execSync(
        `${this.ghPath} pr view ${safePR} --repo ${safeOwner}/${safeRepo} --json title,state,author,body,additions,deletions,headRefName,baseRefName,url`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to get PR info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listIssues(
    owner: string,
    repo: string,
    state: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safeState = ["open", "closed", "all"].includes(state) ? state : "open";

      const output = execSync(
        `${this.ghPath} issue list --repo ${safeOwner}/${safeRepo} --state ${safeState} --json number,title,state,author,url --limit 50`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to list issues: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);

      // Escape quotes in title and body
      const escapedTitle = title.replace(/"/g, '\\"');
      const escapedBody = body.replace(/"/g, '\\"');

      const output = execSync(
        `${this.ghPath} issue create --repo ${safeOwner}/${safeRepo} --title "${escapedTitle}" --body "${escapedBody}"`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to create issue: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listPRs(
    owner: string,
    repo: string,
    state: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safeState = ["open", "closed", "merged", "all"].includes(state) ? state : "open";

      const output = execSync(
        `${this.ghPath} pr list --repo ${safeOwner}/${safeRepo} --state ${safeState} --json number,title,state,author,url,headRefName --limit 50`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to list PRs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async mergePR(
    owner: string,
    repo: string,
    prNumber: number,
    mergeMethod: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safePR = this.sanitizeInput(prNumber);
      const safeMethod = ["merge", "squash", "rebase"].includes(mergeMethod) ? mergeMethod : "merge";

      const output = execSync(
        `${this.ghPath} pr merge ${safePR} --repo ${safeOwner}/${safeRepo} --${safeMethod}`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to merge PR: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createPR(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safeHead = this.sanitizeInput(head);
      const safeBase = this.sanitizeInput(base);

      // Escape quotes in title and body
      const escapedTitle = title.replace(/"/g, '\\"');
      const escapedBody = body.replace(/"/g, '\\"');

      const output = execSync(
        `${this.ghPath} pr create --repo ${safeOwner}/${safeRepo} --title "${escapedTitle}" --body "${escapedBody}" --head ${safeHead} --base ${safeBase}`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to create PR: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getRepoInfo(
    owner: string,
    repo: string
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);

      const output = execSync(
        `${this.ghPath} repo view ${safeOwner}/${safeRepo} --json name,description,url,stargazerCount,forkCount,createdAt,updatedAt,defaultBranchRef,isPrivate,owner`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to get repo info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listReleases(
    owner: string,
    repo: string,
    limit: number
  ): Promise<string> {
    this.checkGitHubAuth();

    try {
      const safeOwner = this.sanitizeInput(owner);
      const safeRepo = this.sanitizeInput(repo);
      const safeLimit = Math.min(Math.max(1, limit), 100); // Between 1 and 100

      const output = execSync(
        `${this.ghPath} release list --repo ${safeOwner}/${safeRepo} --json tagName,name,publishedAt,url,isPrerelease --limit ${safeLimit}`,
        { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
      );
      return output;
    } catch (error) {
      throw new Error(
        `Failed to list releases: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
