// Set up clients using environment variables
import { JiraClient } from './JiraClient.js';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get the directory name properly in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(rootDir, '.env') });

const setupClient = () => {
  // Try both naming conventions for environment variables
  const domain = process.env.JIRA_DOMAIN || process.env.ATLASSIAN_DOMAIN;
  const user = process.env.JIRA_USER || process.env.ATLASSIAN_USER;
  const token = process.env.JIRA_TOKEN || process.env.ATLASSIAN_TOKEN;

  if (!domain || !user || !token) {
    console.log('Skipping Jira tests - missing credentials');
    console.log(
      'Set JIRA_DOMAIN, JIRA_USER, and JIRA_TOKEN environment variables to run these tests'
    );
    return null;
  }

  return new JiraClient(domain, user, token);
};

/**
 * Test the Jira client's capabilities
 */
async function testJiraClient(client: JiraClient) {
  console.log('\n=== TESTING JIRA CLIENT ===');

  try {
    // 1. Get projects
    console.log('\n--- Getting projects ---');
    const projects = await client.getProjects();
    console.log(`Found ${projects.projects.length} projects`);

    if (projects.projects.length > 0) {
      const projectKey = 'SURVEY';
      console.log(
        `Using project: ${projectKey} (${projects.projects.find(p => p.name === projectKey)})`
      );

      // 2. Get project details
      console.log('\n--- Getting project details ---');
      const project = await client.getProject(projectKey);
      console.log(`Project name: ${project.name}`);
      console.log(`Project lead: ${project.lead.displayName}`);

      // 3. Search for issues in the project
      console.log('\n--- Searching for issues ---');
      const searchResults = await client.searchIssues(
        `project = ${projectKey}`,
        0,
        5
      );
      console.log(
        `Found ${searchResults.total} issues, displaying ${searchResults.issues.length}`
      );

      if (searchResults.issues.length > 0) {
        const firstIssue = searchResults.issues[0];
        const issueKey = firstIssue.key;
        console.log(
          `Testing with issue: ${issueKey} - ${firstIssue.fields.summary}`
        );

        // 4. Get issue details
        console.log('\n--- Getting issue details ---');
        const issue = await client.getIssue(issueKey);
        console.log(
          `Found ${issueKey} issue details ---`,
          JSON.stringify(issue, null, 2)
        );
        console.log(`Issue description: ${client.extractIssueDetails(issue)}`);

        // 5. Get issue comments
        console.log('\n--- Getting issue comments ---');
        const comments = await client.getIssueComments(issueKey);
        console.log(
          `Found ${comments.total} comments, displaying ${comments.comments.length}`
        );

        // 6. Get issue transitions
        console.log('\n--- Getting issue transitions ---');
        const transitions = await client.getIssueTransitions(issueKey);
        console.log(
          `Available transitions: ${transitions.map(t => `"${t.name}"`).join(', ')}`
        );

        // 7. Get related issues
        console.log('\n--- Getting related issues ---');
        const relatedIssues = await client.getRelatedIssues(issueKey);
        console.log(`Found ${relatedIssues.length} related issues`);
        if (relatedIssues.length > 0) {
          console.log(
            `Related issues: ${relatedIssues.map(i => `${i.key} (${i.fields.summary})`).join(', ')}`
          );
        }
      }

      // 8. Get boards
      console.log('\n--- Getting boards ---');
      const boards = await client.getBoards(projectKey);
      console.log(
        `Found ${boards.values.length} boards for project ${projectKey}`
      );

      if (boards.values.length > 0) {
        const boardId = 407;
        console.log(
          `Testing with board: ${boards.values.find(value => value.id == boardId).name} (${boardId})`
        );

        // 9. Get sprints
        console.log('\n--- Getting sprints ---');
        const sprints = await client.getSprints(boardId, 'active');
        console.log(
          `Found ${sprints.values.length} sprints for board ${boardId}`
        );

        if (sprints.values.length > 0) {
          const currentSprint = sprints.values[0];
          console.log(`Sprint: ${currentSprint.name} (${currentSprint.id})`);

          // 10. Get sprint issues
          console.log('\n--- Getting sprint issues ---');
          const sprintIssues = await client.getSprintIssues(
            currentSprint.id,
            0,
            50,
            ['Story', 'Bug']
          );
          console.log(
            `Found ${sprintIssues.issues.length} issues in sprint ${currentSprint.id}`
          );
          sprintIssues.issues.forEach(issue => {
            console.log(
              `- ${issue.key}: ${issue.fields.summary}, Status: ${issue.fields.status?.name}, Type: ${issue.fields.issuetype?.name}`
            );
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in Jira client tests:', error.message);
  }
}

/**
 * Main test function
 */
async function main() {
  const jiraClient = setupClient();

  // Test Jira client if credentials are provided
  if (jiraClient) {
    await testJiraClient(jiraClient);
  } else {
    console.log('\nSkipping Jira tests - missing credentials');
    console.log('Set environment variables to run these tests');
  }

  console.log('\n=== TESTS COMPLETE ===');
}

// Run the tests
main().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
