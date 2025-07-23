import { ConfluenceClient } from './ConfluenceClient.js';
import * as dotenv from 'dotenv';

dotenv.config();

const { CONFLUENCE_DOMAIN, CONFLUENCE_USER, CONFLUENCE_TOKEN } = process.env;

if (!CONFLUENCE_DOMAIN || !CONFLUENCE_USER || !CONFLUENCE_TOKEN) {
  console.error(
    'Please set CONFLUENCE_DOMAIN, CONFLUENCE_USER, and CONFLUENCE_TOKEN in your .env file'
  );
  process.exit(1);
}
const client = new ConfluenceClient(
  CONFLUENCE_DOMAIN,
  CONFLUENCE_USER,
  CONFLUENCE_TOKEN
);
client.getPageById('717750536').then(page => {
  console.log(JSON.stringify(page, null, 2));
});
// client.getPagesByTitle('Oncall tips').then(page => {
//   console.log(JSON.stringify(page, null, 2));
// });
