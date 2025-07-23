# Confluence TypeScript Client

A modern TypeScript client for interacting with Atlassian Confluence's REST API. This library provides a convenient way to access Confluence pages, spaces, and other content programmatically.

## Features

- 🔄 Complete TypeScript support with proper type definitions
- 📄 Simple page retrieval and searching
- 🏷️ Content categorization with labels
- 🔍 Advanced search capabilities
- 📎 Attachment handling
- 🧠 AI-ready with MCP (Model Context Protocol) integration

## Installation

```bash
npm install confluence-ts-client
```

## Basic Usage

```typescript
import { ConfluenceClient } from 'confluence-ts-client';

// Initialize the client
const client = new ConfluenceClient(
  'your-domain.atlassian.net',
  'your-email@example.com',
  'your-api-token'
);

// Get a page by ID
const page = await client.getPageById('123456789');
console.log(`Page title: ${page.title}`);
console.log(`Page content: ${page.body.storage.value}`);

// Search for pages by title
const searchResults = await client.getPagesByTitle('Meeting Notes');
console.log(`Found ${searchResults.results.length} pages`);
```

## Environment Variables

You can also configure the client using environment variables:

```typescript
import { ConfluenceClient } from 'confluence-ts-client';
import dotenv from 'dotenv';

dotenv.config();

const client = new ConfluenceClient(
  process.env.CONFLUENCE_DOMAIN,
  process.env.CONFLUENCE_USER,
  process.env.CONFLUENCE_TOKEN
);
```

## API Reference

### Core Methods

#### `getPageById(pageId: string, expand?: string[]): Promise<ConfluencePage>`
Get a Confluence page by its ID.

#### `search(cql: string): Promise<ConfluencePageListResponse>`
Search for content using Confluence Query Language (CQL).

#### `getPagesByTitle(title: string, spaceKey?: string, expand?: string[]): Promise<ConfluencePageListResponse>`
Find pages with titles containing the search term.

#### `getPagesBySpaceKey(spaceKey: string, limit?: number, start?: number, expand?: string[]): Promise<ConfluencePageListResponse>`
List all pages within a specific space.

#### `getPageChildren(pageId: string, expand?: string[]): Promise<ConfluencePageListResponse>`
Get all child pages of a specific page.

### Space Methods

#### `getSpaces(type?: 'global' | 'personal', status?: 'current' | 'archived', limit?: number, start?: number): Promise<ConfluenceSpaceListResponse>`
List all spaces the user has access to.

### Content Organization

#### `getContentByLabel(labelName: string, spaceKey?: string, limit?: number, start?: number): Promise<ConfluencePageListResponse>`
Find content with a specific label.

#### `getContentLabels(contentId: string, prefix?: string, limit?: number, start?: number): Promise<any>`
Get all labels for a specific content item.

### Comments & Attachments

#### `getPageComments(pageId: string, limit?: number, start?: number, expand?: string[]): Promise<ConfluenceCommentListResponse>`
Get comments for a page.

#### `getAttachments(pageId: string, filename?: string, mediaType?: string, limit?: number, start?: number, expand?: string[]): Promise<ConfluenceAttachmentListResponse>`
Get attachments for a page.

#### `getAttachment(attachmentId: string): Promise<ConfluenceAttachment>`
Get a specific attachment by ID.

#### `downloadAttachment(attachmentId: string): Promise<{data: ArrayBuffer, contentType: string, filename: string}>`
Download the binary content of an attachment.

### Related Content

#### `getTopicallyRelatedPages(pageId: string, limit?: number, expand?: string[]): Promise<ConfluencePageListResponse>`
Find pages that are topically related to a given page based on title similarity and shared labels.

#### `getRecentlyUpdated(spaceKey?: string, type?: 'page' | 'blogpost' | 'comment' | 'attachment', limit?: number, start?: number, expand?: string[]): Promise<ConfluencePageListResponse>`
Get recently updated content.

#### `getPageHistory(pageId: string, limit?: number, start?: number): Promise<any>`
Get the version history of a page.

## MCP Integration

This library includes a ready-to-use Model Context Protocol (MCP) server that makes all Confluence API capabilities available to AI models like Anthropic's Claude.

### Starting the MCP Server

```bash
# Install dependencies
npm install fastmcp zod

# Create a .env file with your Confluence credentials
echo "CONFLUENCE_DOMAIN=your-domain.atlassian.net
CONFLUENCE_USER=your-email@example.com
CONFLUENCE_TOKEN=your-api-token" > .env

# Start the server
npx ts-node --esm src/index.ts
```

### Available MCP Tools

- `getPageById`: Get a Confluence page by its ID
- `searchPagesByTitle`: Search for pages by title
- `getPagesInSpace`: Get all pages in a specific space
- `getChildPages`: Get child pages of a page
- `getAllSpaces`: Get all accessible spaces
- `getPageHistory`: Get page history versions
- `getPageComments`: Get page comments
- `getPageAttachments`: Get page attachments
- `getRelatedPages`: Find topically related pages
- `getRecentlyUpdated`: Get recently updated content
- `getContentByLabel`: Get content by label

## Error Handling

The client includes comprehensive error handling with detailed error messages for common issues like authentication failures or missing resources.

## Types

All response types are fully documented with TypeScript interfaces for excellent IDE integration and type safety.

## License

MIT
