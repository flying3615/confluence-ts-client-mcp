import { JiraIssue } from './jiraTypes.js';

/**
 * Class to extract and format data from Jira issues
 * Handles parsing of Atlassian Document Format (ADF) content and other Jira structures
 */
export class JiraIssueExtractor {
  /**
   * Extract formatted details from a Jira issue
   * @param issue The Jira issue to extract details from
   * @returns Formatted string with key issue details
   */
  extractIssueDetails(issue: JiraIssue): string {
    if (!issue || !issue.fields) {
      return 'No issue data available';
    }

    const { key, fields } = issue;
    const { summary, status, issuetype, assignee, reporter } = fields;

    // Start building result with basic issue details
    const result = [
      `Issue Key: ${key}`,
      `Summary: ${summary || 'No summary'}`,
      `Status: ${status?.name || 'Unknown'}`,
      `Type: ${issuetype?.name || 'Unknown'}`,
      `Assignee: ${assignee?.displayName || 'Unassigned'}`,
      `Reporter: ${reporter?.displayName || 'Unknown'}`,
    ];

    // Extract description content if available
    if (fields.description) {
      result.push('', 'Description:');
      const descriptionText = this.extractADFContent(fields.description);
      result.push(descriptionText);
    }

    // Look for common custom fields and add them if present
    const customFields = Object.keys(fields).filter(field =>
      field.startsWith('customfield_')
    );
    if (customFields.length > 0) {
      result.push('', 'Custom Fields:');

      customFields.forEach(fieldKey => {
        const fieldValue = fields[fieldKey];
        // Skip null/undefined fields
        if (fieldValue === null || fieldValue === undefined) return;

        // If it's an ADF content
        if (
          fieldValue &&
          typeof fieldValue === 'object' &&
          fieldValue.content
        ) {
          const extractedText = this.extractADFContent(fieldValue);
          if (extractedText.trim()) {
            result.push(`${fieldKey}:`);
            result.push(extractedText);
          }
        }
        // For array values like labels, components, etc.
        else if (Array.isArray(fieldValue)) {
          if (fieldValue.length > 0) {
            const values = fieldValue
              .map(item => {
                if (typeof item === 'string') return item;
                if (item && item.name) return item.name;
                if (item && item.value) return item.value;
                return JSON.stringify(item);
              })
              .filter(Boolean)
              .join(', ');

            if (values) {
              result.push(`${fieldKey}: ${values}`);
            }
          }
        }
        // For object values that have a name/value/displayName property
        else if (typeof fieldValue === 'object') {
          const value =
            fieldValue.name || fieldValue.value || fieldValue.displayName;
          if (value) {
            result.push(`${fieldKey}: ${value}`);
          }
        }
        // For simple values
        else if (typeof fieldValue !== 'object') {
          result.push(`${fieldKey}: ${fieldValue}`);
        }
      });
    }

    return result.join('\n');
  }

  /**
   * Extract plain text from Atlassian Document Format (ADF) content
   * Handles various content types: paragraphs, panels, lists, code blocks, etc.
   * @param adf The ADF content object
   * @returns Extracted plain text
   */
  extractADFContent(adf: any): string {
    if (!adf || !adf.content || !Array.isArray(adf.content)) {
      return '';
    }

    const result: string[] = [];

    // Process each top-level content node
    adf.content.forEach(node => {
      if (!node) return;

      switch (node.type) {
        case 'paragraph': {
          const paragraphText = this.extractTextFromNode(node);
          if (paragraphText) result.push(paragraphText);
          break;
        }

        case 'heading': {
          const headingText = this.extractTextFromNode(node);
          if (headingText) {
            const level = node.attrs?.level || 1;
            const prefix = '#'.repeat(level) + ' ';
            result.push(`${prefix}${headingText}`);
          }
          break;
        }
        case 'bulletList':
        case 'orderedList': {
          const listText = this.extractListContent(node);
          if (listText) result.push(listText);
          break;
        }

        case 'panel': {
          const panelTitle = node.attrs?.panelType
            ? `[${node.attrs.panelType}] `
            : '';
          const panelContent = this.extractTextFromNode(node);
          if (panelContent) result.push(`${panelTitle}${panelContent}`);
          break;
        }

        case 'codeBlock': {
          const language = node.attrs?.language
            ? `[${node.attrs.language}]\n`
            : '';
          const codeContent = this.extractTextFromNode(node);
          if (codeContent) {
            result.push(`${language}\`\`\`\n${codeContent}\n\`\`\``);
          }
          break;
        }
        case 'table': {
          const tableContent = this.extractTableContent(node);
          if (tableContent) result.push(tableContent);
          break;
        }

        case 'blockquote': {
          const quoteContent = this.extractTextFromNode(node);
          if (quoteContent) {
            result.push(`> ${quoteContent.replace(/\n/g, '\n> ')}`);
          }
          break;
        }
        case 'mediaGroup':
          if (node.content && Array.isArray(node.content)) {
            node.content.forEach(media => {
              if (media.type === 'media' && media.attrs) {
                const fileName = media.attrs.filename || 'Attached file';
                result.push(`[${fileName}]`);
              }
            });
          }
          break;

        // For any other node types, try to extract text if it has content
        default:
          if (node.content && Array.isArray(node.content)) {
            const defaultText = this.extractTextFromNode(node);
            if (defaultText) result.push(defaultText);
          }
          break;
      }
    });

    return result.join('\n\n');
  }

  /**
   * Extract text from a node with content array
   * @param node Node with potential content array
   * @returns Extracted text
   */
  private extractTextFromNode(node: any): string {
    if (!node || !node.content || !Array.isArray(node.content)) {
      return '';
    }

    return node.content
      .map(childNode => {
        if (childNode.type === 'text' && childNode.text) {
          let text = childNode.text;

          // Apply text formatting if available
          if (childNode.marks && Array.isArray(childNode.marks)) {
            childNode.marks.forEach((mark: any) => {
              if (mark.type === 'strong') text = `**${text}**`;
              if (mark.type === 'em') text = `*${text}*`;
              if (mark.type === 'code') text = `\`${text}\``;
              if (mark.type === 'link' && mark.attrs && mark.attrs.href) {
                text = `[${text}](${mark.attrs.href})`;
              }
            });
          }

          return text;
        } else if (childNode.content && Array.isArray(childNode.content)) {
          // Recursively extract text from nested content
          return this.extractTextFromNode(childNode);
        }
        return '';
      })
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Extract content from lists (bullet or ordered)
   * @param listNode List node with items
   * @returns Formatted list text
   */
  private extractListContent(listNode: any): string {
    if (!listNode || !listNode.content || !Array.isArray(listNode.content)) {
      return '';
    }

    const result: string[] = [];
    const isOrdered = listNode.type === 'orderedList';

    listNode.content.forEach((listItem: any, index: number) => {
      if (listItem.type === 'listItem' && listItem.content) {
        const itemContent = this.extractTextFromNode(listItem);
        if (itemContent) {
          const prefix = isOrdered ? `${index + 1}. ` : '• ';
          result.push(`${prefix}${itemContent}`);
        }
      }
    });

    return result.join('\n');
  }

  /**
   * Extract content from table nodes
   * @param tableNode Table node
   * @returns Formatted table text
   */
  private extractTableContent(tableNode: any): string {
    if (!tableNode || !tableNode.content || !Array.isArray(tableNode.content)) {
      return '';
    }

    const rows: string[][] = [];

    // Process table rows
    tableNode.content.forEach((row: any) => {
      if (
        row.type === 'tableRow' &&
        row.content &&
        Array.isArray(row.content)
      ) {
        const cells: string[] = [];

        // Process cells in the row
        row.content.forEach((cell: any) => {
          if (
            (cell.type === 'tableCell' || cell.type === 'tableHeader') &&
            cell.content &&
            Array.isArray(cell.content)
          ) {
            const cellContent = this.extractTextFromNode(cell);
            cells.push(cellContent || '');
          }
        });

        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    });

    // If no valid rows, return empty string
    if (rows.length === 0) {
      return '';
    }

    // Format as a simplified table
    const result: string[] = [];
    rows.forEach((row, index) => {
      result.push(`| ${row.join(' | ')} |`);

      // Add separator after header row
      if (index === 0) {
        result.push(`| ${row.map(() => '---').join(' | ')} |`);
      }
    });

    return result.join('\n');
  }
}
