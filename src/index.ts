#!/usr/bin/env node

import { FastMCP, UserError } from 'fastmcp';
import { z } from 'zod';
import { ConfluenceClient } from './ConfluenceClient.js';
import { SimplePageResult } from './types.js';
import 'dotenv/config';

// Initialize Confluence client
const initConfluenceClient = () => {
  const { CONFLUENCE_DOMAIN, CONFLUENCE_USER, CONFLUENCE_TOKEN } = process.env;
  if (!CONFLUENCE_DOMAIN || !CONFLUENCE_USER || !CONFLUENCE_TOKEN) {
    throw new UserError(
      'Please set CONFLUENCE_DOMAIN, CONFLUENCE_USER, and CONFLUENCE_TOKEN in the .env file'
    );
  }
  return new ConfluenceClient(
    CONFLUENCE_DOMAIN,
    CONFLUENCE_USER,
    CONFLUENCE_TOKEN
  );
};

// Create FastMCP server
const server = new FastMCP({
  name: 'ConfluenceAssistant',
  version: '1.0.0',
  instructions: `This is a Confluence Assistant providing the following functions:
  - Get page by ID
  - Search pages by title
  - Get all pages in a specific space
  - Get child pages of a page
  - Get all accessible spaces
  - Get page history versions
  - Get page comments
  - Get page attachments
  - Download specific attachments
  - Get recently updated content
  - Get content by label`,
});

// Initialize client
let client: ConfluenceClient;

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
      if (!client) client = initConfluenceClient();
      const page = await client.getPageById(args.pageId, ['body.storage']);

      // Create a simplified page result with only the requested fields
      const simpleResult: SimplePageResult = {
        id: page.id,
        status: page.status,
        title: page.title,
        content: page.body?.storage?.value || '',
      };

      return simpleResult;
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
      if (!client) client = initConfluenceClient();
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

// Add MCP tool: Get all pages in a specific space
server.addTool({
  name: 'getPagesInSpace',
  description: 'Get all pages in a specific Confluence space',
  parameters: z.object({
    spaceKey: z.string().describe('Key of the Confluence space'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 25'),
    start: z
      .number()
      .optional()
      .describe('Starting index for pagination, default is 0'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client) client = initConfluenceClient();
      const pagesResponse = await client.getPagesBySpaceKey(
        args.spaceKey,
        args.limit,
        args.start,
        ['body.storage'] // Always request body.storage
      );

      // Transform the results to SimplePageResult format
      const simpleResults: SimplePageResult[] = pagesResponse.results.map(
        page => ({
          id: page.id,
          status: page.status,
          title: page.title,
          content: page.body?.storage?.value || '',
        })
      );

      return {
        results: simpleResults,
        size: pagesResponse.size,
        start: pagesResponse.start,
        limit: pagesResponse.limit,
      };
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get child pages of a page
server.addTool({
  name: 'getChildPages',
  description: 'Get child pages of a Confluence page',
  parameters: z.object({
    pageId: z.string().describe('ID of the parent page'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client) client = initConfluenceClient();
      const pagesResponse = await client.getPageChildren(
        args.pageId,
        ['body.storage'] // Always request body.storage
      );

      // Transform the results to SimplePageResult format
      const simpleResults: SimplePageResult[] = pagesResponse.results.map(
        page => ({
          id: page.id,
          status: page.status,
          title: page.title,
          content: page.body?.storage?.value || '',
        })
      );

      return {
        results: simpleResults,
        size: pagesResponse.size,
        start: pagesResponse.start,
        limit: pagesResponse.limit,
      };
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get all accessible spaces
server.addTool({
  name: 'getAllSpaces',
  description: 'Get all accessible Confluence spaces',
  parameters: z.object({
    type: z
      .enum(['global', 'personal'])
      .optional()
      .describe('Space type: global or personal'),
    status: z
      .enum(['current', 'archived'])
      .optional()
      .describe('Space status: current or archived'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 25'),
    start: z
      .number()
      .optional()
      .describe('Starting index for pagination, default is 0'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client) client = initConfluenceClient();
      const spaces = await client.getSpaces(
        args.type as any,
        args.status as any,
        args.limit,
        args.start
      );
      return JSON.stringify(spaces, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get page history versions
server.addTool({
  name: 'getPageHistory',
  description: 'Get history versions of a Confluence page',
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
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client) client = initConfluenceClient();
      const history = await client.getPageHistory(
        args.pageId,
        args.limit,
        args.start
      );
      return JSON.stringify(history, null, 2);
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
      if (!client) client = initConfluenceClient();
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
      if (!client) client = initConfluenceClient();
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

// Add MCP tool: Get recently updated content
server.addTool({
  name: 'getRecentlyUpdated',
  description: 'Get recently updated content in Confluence',
  parameters: z.object({
    spaceKey: z
      .string()
      .optional()
      .describe('Optional space key to limit results'),
    type: z
      .enum(['page', 'blogpost', 'comment', 'attachment'])
      .optional()
      .describe('Content type filter'),
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
      if (!client) client = initConfluenceClient();
      const content = await client.getRecentlyUpdated(
        args.spaceKey,
        args.type as any,
        args.limit,
        args.start,
        args.expand || []
      );
      return JSON.stringify(content, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

// Add MCP tool: Get content by label
server.addTool({
  name: 'getContentByLabel',
  description: 'Get Confluence content by label',
  parameters: z.object({
    labelName: z.string().describe('Name of the label'),
    spaceKey: z
      .string()
      .optional()
      .describe('Optional space key to limit results'),
    limit: z
      .number()
      .optional()
      .describe('Maximum number of results to return, default is 25'),
    start: z
      .number()
      .optional()
      .describe('Starting index for pagination, default is 0'),
  }),
  annotations: {
    readOnlyHint: true,
    openWorldHint: true,
  },
  execute: async args => {
    try {
      if (!client) client = initConfluenceClient();
      const content = await client.getContentByLabel(
        args.labelName,
        args.spaceKey,
        args.limit,
        args.start
      );
      return JSON.stringify(content, null, 2);
    } catch (error) {
      handleError(error);
    }
  },
});

await server.start({
  transportType: 'stdio',
});
