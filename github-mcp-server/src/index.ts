import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { GitHubClient } from "./github/client.js";

// Initialize the MCP server
const server = new Server(
  {
    name: "github-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize GitHub client
const github = new GitHubClient();

// Define available tools
const tools: Tool[] = [
  {
    name: "get_pr_info",
    description: "Get detailed information about a GitHub pull request",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner (username or organization)",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        pr_number: {
          type: "number",
          description: "Pull request number",
        },
      },
      required: ["owner", "repo", "pr_number"],
    },
  },
  {
    name: "list_issues",
    description: "List issues in a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        state: {
          type: "string",
          enum: ["open", "closed", "all"],
          description: "Filter by state (default: open)",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "create_issue",
    description: "Create a new GitHub issue",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        title: {
          type: "string",
          description: "Issue title",
        },
        body: {
          type: "string",
          description: "Issue description",
        },
      },
      required: ["owner", "repo", "title"],
    },
  },
  {
    name: "list_prs",
    description: "List pull requests in a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        state: {
          type: "string",
          enum: ["open", "closed", "merged", "all"],
          description: "Filter by state (default: open)",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "merge_pr",
    description: "Merge a GitHub pull request",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        pr_number: {
          type: "number",
          description: "Pull request number",
        },
        merge_method: {
          type: "string",
          enum: ["merge", "squash", "rebase"],
          description: "Merge strategy (default: merge)",
        },
      },
      required: ["owner", "repo", "pr_number"],
    },
  },
  {
    name: "create_pr",
    description: "Create a new GitHub pull request",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        title: {
          type: "string",
          description: "Pull request title",
        },
        body: {
          type: "string",
          description: "Pull request description",
        },
        head: {
          type: "string",
          description: "The branch that contains changes (e.g., 'feature-branch')",
        },
        base: {
          type: "string",
          description: "The branch to merge into (default: main)",
        },
      },
      required: ["owner", "repo", "title", "head"],
    },
  },
  {
    name: "get_repo_info",
    description: "Get detailed information about a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
      },
      required: ["owner", "repo"],
    },
  },
  {
    name: "list_releases",
    description: "List releases in a GitHub repository",
    inputSchema: {
      type: "object",
      properties: {
        owner: {
          type: "string",
          description: "Repository owner",
        },
        repo: {
          type: "string",
          description: "Repository name",
        },
        limit: {
          type: "number",
          description: "Maximum number of releases to return (default: 10)",
        },
      },
      required: ["owner", "repo"],
    },
  },
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    let result: string;

    switch (name) {
      case "get_pr_info":
        result = await github.getPRInfo(
          args.owner as string,
          args.repo as string,
          args.pr_number as number
        );
        break;

      case "list_issues":
        result = await github.listIssues(
          args.owner as string,
          args.repo as string,
          (args.state as string) || "open"
        );
        break;

      case "create_issue":
        result = await github.createIssue(
          args.owner as string,
          args.repo as string,
          args.title as string,
          (args.body as string) || ""
        );
        break;

      case "list_prs":
        result = await github.listPRs(
          args.owner as string,
          args.repo as string,
          (args.state as string) || "open"
        );
        break;

      case "merge_pr":
        result = await github.mergePR(
          args.owner as string,
          args.repo as string,
          args.pr_number as number,
          (args.merge_method as string) || "merge"
        );
        break;

      case "create_pr":
        result = await github.createPR(
          args.owner as string,
          args.repo as string,
          args.title as string,
          args.head as string,
          (args.base as string) || "main",
          (args.body as string) || ""
        );
        break;

      case "get_repo_info":
        result = await github.getRepoInfo(
          args.owner as string,
          args.repo as string
        );
        break;

      case "list_releases":
        result = await github.listReleases(
          args.owner as string,
          args.repo as string,
          (args.limit as number) || 10
        );
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server started on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
