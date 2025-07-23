// Set up clients using environment variables
import { JiraClient } from './JiraClient.js';
import dotenv from 'dotenv';
dotenv.config();

const setupClient = () => {
  const { ATLASSIAN_DOMAIN, ATLASSIAN_USER, ATLASSIAN_TOKEN } = process.env;

  return ATLASSIAN_DOMAIN && ATLASSIAN_USER && ATLASSIAN_TOKEN
    ? new JiraClient(ATLASSIAN_DOMAIN, ATLASSIAN_USER, ATLASSIAN_TOKEN)
    : null;
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
        const issue = searchResults.issues[0];
        const issueKey = issue.key;
        console.log(
          `Testing with issue: ${issueKey} - ${issue.fields.summary}`
        );

        // 4. Get issue details
        console.log('\n--- Getting issue details ---');
        const issueDetails = await client.getIssue(issueKey);
        console.log(`Issue summary: ${issueDetails.fields.summary}`);
        console.log(`Status: ${issueDetails.fields.status?.name}`);
        console.log(`Issue type: ${issueDetails.fields.issuetype?.name}`);
        console.log(
          `Assignee: ${issueDetails.fields.assignee?.displayName || 'Unassigned'}`
        );

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

          if (sprintIssues.issues.length > 0) {
            const firstIssue = sprintIssues.issues[0];
            console.log(
              `Testing with issue: ${firstIssue.key} - ${firstIssue.fields.summary}`
            );
            console.log(
              '\n--- Getting issue details ---\n',
              JSON.stringify(firstIssue.fields.description, null, 2)
            );
          }
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
