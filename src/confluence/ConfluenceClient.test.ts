// ConfluenceClient.test.ts
import { describe, expect, test, beforeAll } from '@jest/globals';
import { ConfluenceClient } from './ConfluenceClient.js';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from the project root (one level up from src)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

describe('ConfluenceClient', () => {
  let client: ConfluenceClient | null;
  let testSpaceKey: string | null = null;
  let testPageId: string | null = null;

  beforeAll(() => {
    // Try both naming conventions for environment variables
    const domain = process.env.ATLASSIAN_DOMAIN;
    const user = process.env.ATLASSIAN_USER;
    const token = process.env.ATLASSIAN_TOKEN;

    if (domain && user && token) {
      client = new ConfluenceClient(domain, user, token);
    } else {
      console.log('Skipping live Confluence tests - missing credentials');
      console.log(
        'Set CONFLUENCE_DOMAIN, CONFLUENCE_USER, and CONFLUENCE_TOKEN environment variables to run these tests'
      );
    }
  });

  // Mock tests that don't require credentials
  test('should initialize with correct base URL', () => {
    const testClient = new ConfluenceClient(
      'test-domain.atlassian.net',
      'test-user',
      'test-token'
    );
    // We can't directly access private properties, but we can test indirectly
    expect(testClient).toBeDefined();
  });

  // Only run these tests if credentials are available
  (process.env.ATLASSIAN_DOMAIN ? describe : describe.skip)(
    'API Integration Tests',
    () => {
      test('should get spaces', async () => {
        const spaces = await client!.getSpaces();
        expect(spaces).toBeDefined();
        expect(Array.isArray(spaces.results)).toBeTruthy();
        expect(spaces.results.length).toBeGreaterThan(0);

        // Save a space key for further tests
        if (spaces.results.length > 0) {
          testSpaceKey = spaces.results[0].key;
        }
      }, 10000); // Increase timeout for API calls

      test('should get pages in a space', async () => {
        if (!testSpaceKey) {
          console.log('No space key available, skipping test');
          return;
        }

        const pages = await client!.getPagesBySpaceKey(testSpaceKey, 5);
        expect(pages).toBeDefined();
        expect(Array.isArray(pages.results)).toBeTruthy();

        // Save a page ID for further tests
        if (pages.results.length > 0) {
          testPageId = pages.results[0].id;
        }
      }, 10000);

      test('should get page by ID', async () => {
        if (!testPageId) {
          console.log('No page ID available, skipping test');
          return;
        }

        const page = await client!.getPageById(testPageId);
        expect(page).toBeDefined();
        expect(page.id).toBe(testPageId);
        expect(page.title).toBeDefined();
      }, 10000);

      test('should get child pages', async () => {
        if (!testPageId) {
          console.log('No page ID available, skipping test');
          return;
        }

        const children = await client!.getPageChildren(testPageId);
        expect(children).toBeDefined();
        expect(Array.isArray(children.results)).toBeTruthy();
      }, 10000);

      test('should get page comments', async () => {
        if (!testPageId) {
          console.log('No page ID available, skipping test');
          return;
        }

        const comments = await client!.getPageComments(testPageId);
        expect(comments).toBeDefined();
        expect(Array.isArray(comments.results)).toBeTruthy();
      }, 10000);

      test('should get page attachments', async () => {
        if (!testPageId) {
          console.log('No page ID available, skipping test');
          return;
        }

        const attachments = await client!.getAttachments(testPageId);
        expect(attachments).toBeDefined();
        expect(Array.isArray(attachments.results)).toBeTruthy();
      }, 10000);

      test('should get related pages', async () => {
        if (!testPageId) {
          console.log('No page ID available, skipping test');
          return;
        }

        const related = await client!.getTopicallyRelatedPages(testPageId, 3);
        expect(related).toBeDefined();
        expect(Array.isArray(related.results)).toBeTruthy();
      }, 10000);
    }
  );
});
