import { describe, expect, test, beforeAll } from '@jest/globals';
import { JiraClient } from './JiraClient.js';
import path from 'path';
import dotenv from 'dotenv';
import { JiraIssue } from './jiraTypes.js';

// Load environment variables from the project root (one level up from src)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

describe('JiraClient', () => {
  let client: JiraClient | null;
  const mockIssue = {
    key: 'TEST-123',
    fields: {
      summary: 'Test Issue',
      status: { name: 'Open' },
      issuetype: { name: 'Story' },
      assignee: { displayName: 'Test User' },
      reporter: { displayName: 'Test Reporter' },
      description: {
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'This is a test description.' }],
          },
        ],
      },
      project: { key: 'TEST', name: 'Test Project' },
    },
  } as JiraIssue;

  beforeAll(() => {
    // Try both naming conventions for environment variables
    const domain = process.env.ATLASSIAN_DOMAIN;
    const user = process.env.ATLASSIAN_USER;
    const token = process.env.ATLASSIAN_TOKEN;

    if (domain && user && token) {
      client = new JiraClient(domain, user, token);
    } else {
      console.log('Skipping live Jira tests - missing credentials');
      console.log(
        'Set JIRA_DOMAIN, JIRA_USER, and JIRA_TOKEN environment variables to run these tests'
      );

      // Create a test client with dummy values for non-API tests
      client = new JiraClient('test-domain', 'test-user', 'test-token');
    }
  });

  test('should extract issue details correctly', () => {
    // Use the JiraClient instance instead of creating a separate extractor
    const details = client!.extractIssueDetails(mockIssue);
    expect(details).toContain('Issue Key: TEST-123');
    expect(details).toContain('Summary: Test Issue');
    expect(details).toContain('Status: Open');
    expect(details).toContain('Type: Story');
    expect(details).toContain('This is a test description.');
  });

  // Only run API tests if valid credentials are available
  (process.env.ATLASSIAN_DOMAIN ? describe : describe.skip)(
    'API Integration Tests',
    () => {
      test('should get projects', async () => {
        const result = await client!.getProjects();
        expect(result).toBeDefined();
        expect(Array.isArray(result.projects)).toBeTruthy();
      }, 10000); // Increase timeout for API calls

      test('should search for issues', async () => {
        const result = await client!.searchIssues('created >= -30d', 0, 5);
        expect(result).toBeDefined();
        expect(result.issues).toBeDefined();
        expect(Array.isArray(result.issues)).toBeTruthy();
      }, 10000);

      test('should get sprint issues filtered by type', async () => {
        // This test assumes you have a valid board and sprint
        const boards = await client!.getBoards('SURVEY', 0, 5);

        if (boards.values && boards.values.length > 0) {
          const boardId = boards.values[0].id;
          const sprints = await client!.getSprints(boardId, 'active');

          if (sprints.values && sprints.values.length > 0) {
            const sprintId = sprints.values[0].id;
            // Test with multiple issue types
            const result = await client!.getSprintIssues(sprintId, 0, 10, [
              'Story',
              'Bug',
            ]);

            expect(result).toBeDefined();
            expect(Array.isArray(result.issues)).toBeTruthy();

            // All issues should be either Story or Bug
            result.issues.forEach(issue => {
              expect(['Story', 'Bug']).toContain(issue.fields.issuetype?.name);
            });
          } else {
            console.log('No active sprints found, skipping sprint issues test');
          }
        } else {
          console.log('No boards found, skipping sprint issues test');
        }
      }, 15000);
    }
  );
});
