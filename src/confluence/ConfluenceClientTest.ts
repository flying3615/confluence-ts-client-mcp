// Set up clients using environment variables
import { ConfluenceClient } from './ConfluenceClient.js';

import dotenv from 'dotenv';
dotenv.config();

const setupClient = () => {
  const { ATLASSIAN_DOMAIN, ATLASSIAN_USER, ATLASSIAN_TOKEN } = process.env;

  return ATLASSIAN_DOMAIN && ATLASSIAN_USER && ATLASSIAN_TOKEN
    ? new ConfluenceClient(ATLASSIAN_DOMAIN, ATLASSIAN_USER, ATLASSIAN_TOKEN)
    : null;
};

/**
 * Test the Confluence client's capabilities
 */
async function testConfluenceClient(client: ConfluenceClient) {
  console.log('\n=== TESTING CONFLUENCE CLIENT ===');

  try {
    // 1. Get spaces
    console.log('\n--- Getting spaces ---');
    const spaces = await client.getSpaces();
    console.log(`Found ${spaces.results.length} spaces`);

    if (spaces.results.length > 0) {
      const spaceKey = spaces.results[0].key;
      console.log(`Using space: ${spaceKey} (${spaces.results[0].name})`);

      // 2. Get pages in the space
      console.log('\n--- Getting pages in space ---');
      const pages = await client.getPagesBySpaceKey(spaceKey, 5);
      console.log(`Found ${pages.results.length} pages in space`);

      if (pages.results.length > 0) {
        const pageId = pages.results[0].id;
        const pageTitle = pages.results[0].title;
        console.log(`Testing with page: "${pageTitle}" (${pageId})`);

        // 3. Get page by ID
        console.log('\n--- Getting page by ID ---');
        const page = await client.getPageById(pageId);
        console.log(`Retrieved page: "${page.title}"`);
        console.log(
          `Content snippet: ${page.body?.storage?.value.substring(0, 100)}...`
        );

        // 4. Get child pages
        console.log('\n--- Getting child pages ---');
        const children = await client.getPageChildren(pageId);
        console.log(`Found ${children.results.length} child pages`);

        // 5. Get page comments
        console.log('\n--- Getting page comments ---');
        const comments = await client.getPageComments(pageId);
        console.log(`Found ${comments.results.length} comments`);

        // 6. Get page attachments
        console.log('\n--- Getting page attachments ---');
        const attachments = await client.getAttachments(pageId);
        console.log(`Found ${attachments.results.length} attachments`);

        // 7. Get related pages
        console.log('\n--- Getting topically related pages ---');
        const related = await client.getTopicallyRelatedPages(pageId, 3);
        console.log(`Found ${related.results.length} related pages`);
        if (related.results.length > 0) {
          console.log(
            `Related page titles: ${related.results.map(p => `"${p.title}"`).join(', ')}`
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in Confluence client tests:', error.message);
  }
}

/**
 * Main test function
 */
async function main() {
  const confluenceClient = setupClient();

  // Test Confluence client if credentials are provided
  if (confluenceClient) {
    await testConfluenceClient(confluenceClient);
  } else {
    console.log('\nSkipping Confluence tests - missing credentials');
    console.log('Set environment variables to run these tests');
  }

  console.log('\n=== TESTS COMPLETE ===');
}

// Run the tests
main().catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
