#!/usr/bin/env node

import { FastMCP, UserError } from 'fastmcp';
import { z } from 'zod';
import { ConfluenceClient } from './confluence/ConfluenceClient.js';
import { SimplePageResult } from './confluence/confluenceTypes.js';
import { JiraClient } from './jira/JiraClient.js';
import 'dotenv/config';

// Initialize clients
let client: ConfluenceClient;
let jiraClient: JiraClient;

export enum AtlassianServiceType {
  Confluence = 'confluence',
  Jira = 'jira',
}

function initAtlassianClient<T extends AtlassianServiceType>(
  type: T
): T extends AtlassianServiceType.Confluence ? ConfluenceClient : JiraClient {
  const { ATLASSIAN_DOMAIN, ATLASSIAN_USER, ATLASSIAN_TOKEN } = process.env;
  if (!ATLASSIAN_DOMAIN || !ATLASSIAN_USER || !ATLASSIAN_TOKEN) {
    throw new UserError(
      'Please set ATLASSIAN_DOMAIN, ATLASSIAN_USER, and ATLASSIAN_TOKEN in the .env file'
    );
  }
  if (type === AtlassianServiceType.Confluence) {
    return new ConfluenceClient(
      ATLASSIAN_DOMAIN,
      ATLASSIAN_USER,
      ATLASSIAN_TOKEN
    ) as any;
  } else {
    return new JiraClient(
      ATLASSIAN_DOMAIN,
      ATLASSIAN_USER,
      ATLASSIAN_TOKEN
    ) as any;
  }
}

// Create FastMCP server
const server = new FastMCP({
  name: 'ConfluenceAssistant',
  version: '1.0.0',
  instructions: `This assistant provides the following MCP tools for Atlassian Confluence and Jira:

  Confluence:
  - getPageById: Get a Confluence page by its ID
  - searchPagesByTitle: Search for Confluence pages by title (optionally within a space)
  - getPageComments: Get comments on a Confluence page
  - getPageAttachments: Get attachments on a Confluence page (with optional filters)
  - getRelatedPages: Find pages that are topically related to a given page
  
  Jira:
  - getJiraIssue: Get a Jira issue by its key (e.g., PROJECT-123)
  - getSprintIssues: Get all issues in a sprint, optionally filtered by issue types
  - getRelatedIssues: Find related issues for a given Jira issue
  - getActiveSprintIssues: Get all issues in the current active sprint for a given Jira board
  
  Refer to the README for parameter details.`,
});

// Error handling function
const handleError = (error: any): never => {
  if (error.response) {
    const status = error.response.status;
    const statusText = error.response.statusText;

    if (status === 401) {
      throw new UserError(
        'Authentication Error: Failed to authenticate with Confluence. Please check your credentials.'
      );
    } else if (status === 403) {
      throw new UserError(
        'Permission Error: You do not have permission to access this resource in Confluence.'
      );
    } else if (status === 404) {
      throw new UserError(
        'Not Found Error: The requested Confluence resource could not be found. Please check the provided ID or parameters.'
      );
    } else {
      throw new UserError(`Confluence API Error: ${status} ${statusText}`);
    }
  } else if (error instanceof UserError) {
    // Pass through UserError instances
    throw error;
  } else {
    throw new UserError(`An unexpected error occurred: ${error.message}`);
  }
};

// Add MCP tool: Get Confluence page by ID
server.addTool({
  name: 'getPageById',
  description: 'Get a Confluence page by its ID',
  parameters: z.object({
    pageId: z.string().describe('ID of the Confluence page'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client)
        client = initAtlassianClient(AtlassianServiceType.Confluence);
      const page = await client.getPageById(args.pageId, ['body.storage']);

      // Create a simplified page result with only the requested fields
      const simpleResult: SimplePageResult = {
        id: page.id,
        status: page.status,
        title: page.title,
        content: page.body?.storage?.value || '',
      };

      return JSON.stringify(simpleResult, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Search pages by title
server.addTool({
  name: 'searchPagesByTitle',
  description: 'Search for Confluence pages by title',
  parameters: z.object({
    title: z.string().describe('Page title or title fragment'),
    spaceKey: z
      .string()
      .optional()
      .describe('Optional space key to limit search scope'),
    expand: z
      .array(z.string())
      .optional()
      .describe("Fields to expand, e.g. ['body.storage']"),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client)
        client = initAtlassianClient(AtlassianServiceType.Confluence);
      const pages = await client.getPagesByTitle(
        args.title,
        args.spaceKey,
        args.expand || ['body.storage']
      );
      return JSON.stringify(pages, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get page comments
server.addTool({
  name: 'getPageComments',
  description: 'Get comments on a Confluence page',
  parameters: z.object({
    pageId: z.string().describe('ID of the page'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 25'),
    start: z
      .number()
      .optional()
      .describe('Starting index for pagination, default is 0'),
    expand: z.array(z.string()).optional().describe('Fields to expand'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client)
        client = initAtlassianClient(AtlassianServiceType.Confluence);
      const comments = await client.getPageComments(
        args.pageId,
        args.limit,
        args.start,
        args.expand || []
      );
      return JSON.stringify(comments, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get page attachments
server.addTool({
  name: 'getPageAttachments',
  description: 'Get attachments on a Confluence page',
  parameters: z.object({
    pageId: z.string().describe('ID of the page'),
    filename: z.string().optional().describe('Optional filename filter'),
    mediaType: z.string().optional().describe('Optional media type filter'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 25'),
    start: z
      .number()
      .optional()
      .describe('Starting index for pagination, default is 0'),
    expand: z.array(z.string()).optional().describe('Fields to expand'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client)
        client = initAtlassianClient(AtlassianServiceType.Confluence);
      const attachments = await client.getAttachments(
        args.pageId,
        args.filename,
        args.mediaType,
        args.limit,
        args.start,
        args.expand || []
      );
      return JSON.stringify(attachments, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get topically related pages
server.addTool({
  name: 'getRelatedPages',
  description: 'Find pages that are topically related to a given page',
  parameters: z.object({
    pageId: z.string().describe('ID of the reference page'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 10'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client)
        client = initAtlassianClient(AtlassianServiceType.Confluence);
      const pagesResponse = await client.getTopicallyRelatedPages(
        args.pageId,
        args.limit || 10,
        ['body.storage']
      );

      // Transform the results to SimplePageResult format
      const simpleResults = pagesResponse.results.map(page => ({
        id: page.id,
        status: page.status,
        title: page.title,
        content: page.body?.storage?.value || '',
      }));

      // Return in the format expected by FastMCP
      return JSON.stringify(
        {
          content: simpleResults,
          totalCount: pagesResponse.size,
          relatedToPageId: args.pageId,
        },
        null,
        2
      );
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get Jira issue by key
server.addTool({
  name: 'getJiraIssue',
  description: 'Get a Jira issue by its key',
  parameters: z.object({
    issueKey: z
      .string()
      .describe('The key of the Jira issue (e.g., PROJECT-123)'),
    fields: z
      .array(z.string())
      .optional()
      .describe('Optional array of field names to include'),
  }),
  execute: async args => {
    try {
      if (!jiraClient)
        jiraClient = initAtlassianClient(AtlassianServiceType.Jira);
      const issue = await jiraClient.getIssue(args.issueKey, args.fields);
      // Only return extractedDetails (use type assertion to avoid TS error)
      const extractedDetails = (issue as any).extractedDetails;
      return typeof extractedDetails === 'string'
        ? extractedDetails
        : JSON.stringify(extractedDetails, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get all issues in a sprint, optionally filtered by a list of issue types
server.addTool({
  name: 'getSprintIssues',
  description:
    'Get all issues in a sprint, optionally filtered by a list of issue types',
  parameters: z.object({
    sprintId: z.number().describe('The ID of the sprint'),
    startAt: z.number().optional().describe('Starting index for pagination'),
    maxResults: z
      .number()
      .optional()
      .describe('Maximum number of results to return'),
    issueTypes: z
      .array(z.string())
      .optional()
      .describe(
        'Optional array of issue types to filter (e.g., ["Story", "Bug"])'
      ),
  }),
  execute: async args => {
    try {
      if (!jiraClient)
        jiraClient = initAtlassianClient(AtlassianServiceType.Jira);
      const issues = await jiraClient.getSprintIssues(
        args.sprintId,
        args.startAt || 0,
        args.maxResults || 50,
        args.issueTypes
      );
      return JSON.stringify(issues, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get related issues for a given issue
server.addTool({
  name: 'getRelatedIssues',
  description: 'Find related issues for a given Jira issue',
  parameters: z.object({
    issueKey: z
      .string()
      .describe('The key of the Jira issue to find related issues for'),
  }),
  execute: async args => {
    try {
      if (!jiraClient)
        jiraClient = initAtlassianClient(AtlassianServiceType.Jira);
      const related = await jiraClient.getRelatedIssues(args.issueKey);
      return JSON.stringify(related, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get all issues in the active sprint for a board
server.addTool({
  name: 'getActiveSprintIssues',
  description:
    'Get all issues in the current active sprint for a given Jira board',
  parameters: z.object({
    boardId: z.number().describe('The ID of the Jira board'),
    issueTypes: z
      .array(z.string())
      .optional()
      .describe(
        'Optional array of issue types to filter (e.g., ["Story", "Bug"])'
      ),
    startAt: z.number().optional().describe('Starting index for pagination'),
    maxResults: z
      .number()
      .optional()
      .describe('Maximum number of results to return'),
  }),
  execute: async args => {
    try {
      if (!jiraClient)
        jiraClient = initAtlassianClient(AtlassianServiceType.Jira);
      // Get the active sprint for the board
      const sprintsResp = await jiraClient.getSprints(
        args.boardId,
        'active',
        0,
        1
      );
      const activeSprint =
        sprintsResp.values && sprintsResp.values.length > 0
          ? sprintsResp.values[0]
          : null;
      if (!activeSprint) {
        return JSON.stringify(
          { error: 'No active sprint found for this board.' },
          null,
          2
        );
      }
      // Use default issueTypes if not provided
      const issueTypes =
        args.issueTypes && args.issueTypes.length > 0
          ? args.issueTypes
          : ['Story', 'Bug'];
      // Get issues in the active sprint
      const issues = await jiraClient.getSprintIssues(
        activeSprint.id,
        args.startAt || 0,
        args.maxResults || 50,
        issueTypes
      );
      return JSON.stringify({ sprint: activeSprint, issues }, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

await server.start({
  transportType: 'stdio',
});
