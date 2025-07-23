import axios, { AxiosInstance } from 'axios';
import {
  ConfluencePage,
  ConfluencePageListResponse,
  ConfluenceSpaceListResponse,
  ConfluenceCommentListResponse,
  ConfluenceAttachmentListResponse,
  ConfluenceAttachment,
} from './types.js';

export class ConfluenceClient {
  private readonly client: AxiosInstance;

  constructor(
    private readonly domain: string,
    private readonly user: string,
    private readonly token: string
  ) {
    const authToken = Buffer.from(`${user}:${token}`).toString('base64');
    this.client = axios.create({
      baseURL: `https://${domain}/wiki/rest/api`,
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json',
      },
    });
  }

  /**
   * Get a Confluence page by its ID
   * @param pageId The ID of the page to retrieve
   * @param expand Fields to expand in the response (default: body.storage)
   * @returns The page data
   */
  async getPageById(
    pageId: string,
    expand: string[] = ['body.storage']
  ): Promise<ConfluencePage> {
    try {
      const response = await this.client.get(`/content/${pageId}`, {
        params: { expand: expand.join(',') },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search for content in Confluence using CQL (Confluence Query Language)
   * @param cql The CQL search query string
   * @returns Search results matching the query
   * @example
   * // Search for pages with title containing "API"
   * client.search('title ~ "API"')
   * // Search for pages in the DOCS space
   * client.search('space = "DOCS"')
   * // Search for pages updated by a specific user
   * client.search('contributor = "username"')
   */
  async search(cql: string): Promise<ConfluencePageListResponse> {
    try {
      const response = await this.client.get('/content/search', {
        params: { cql },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get pages by title
   * @param title The title to search for
   * @param spaceKey Optional space key to limit the search
   * @param expand Fields to expand in the response
   */
  async getPagesByTitle(
    title: string,
    spaceKey?: string,
    expand: string[] = ['body.storage']
  ): Promise<ConfluencePageListResponse> {
    try {
      let cql = `title ~ "${title}"`;
      if (spaceKey) {
        cql += ` AND space = "${spaceKey}"`;
      }

      const response = await this.client.get('/content/search', {
        params: {
          cql,
          expand: expand.join(','),
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all pages in a specific space
   * @param spaceKey The key of the space
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   * @param expand Fields to expand in the response
   */
  async getPagesBySpaceKey(
    spaceKey: string,
    limit: number = 25,
    start: number = 0,
    expand: string[] = []
  ): Promise<ConfluencePageListResponse> {
    try {
      const response = await this.client.get('/content', {
        params: {
          spaceKey,
          type: 'page',
          limit,
          start,
          expand: expand.join(','),
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get child pages of a specific page
   * @param pageId The ID of the parent page
   * @param expand Fields to expand in the response
   */
  async getPageChildren(
    pageId: string,
    expand: string[] = []
  ): Promise<ConfluencePageListResponse> {
    try {
      const response = await this.client.get(`/content/${pageId}/child/page`, {
        params: {
          expand: expand.join(','),
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all spaces the user has access to
   * @param type Type of spaces to return (global, personal)
   * @param status Status of spaces to return (current, archived)
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   */
  async getSpaces(
    type?: 'global' | 'personal',
    status?: 'current' | 'archived',
    limit: number = 25,
    start: number = 0
  ): Promise<ConfluenceSpaceListResponse> {
    try {
      const response = await this.client.get('/space', {
        params: {
          type,
          status,
          limit,
          start,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get the version history of a page
   * @param pageId The ID of the page
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   */
  async getPageHistory(
    pageId: string,
    limit: number = 25,
    start: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(`/content/${pageId}/history`, {
        params: {
          limit,
          start,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get comments associated with a page
   * @param pageId The ID of the page
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   * @param expand Fields to expand in the response
   */
  async getPageComments(
    pageId: string,
    limit: number = 25,
    start: number = 0,
    expand: string[] = []
  ): Promise<ConfluenceCommentListResponse> {
    try {
      const response = await this.client.get(
        `/content/${pageId}/child/comment`,
        {
          params: {
            limit,
            start,
            expand: expand.join(','),
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get attachments for a page
   * @param pageId The ID of the page
   * @param filename Optional filename to filter attachments
   * @param mediaType Optional media type to filter attachments
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   * @param expand Fields to expand in the response
   */
  async getAttachments(
    pageId: string,
    filename?: string,
    mediaType?: string,
    limit: number = 25,
    start: number = 0,
    expand: string[] = []
  ): Promise<ConfluenceAttachmentListResponse> {
    try {
      const response = await this.client.get(
        `/content/${pageId}/child/attachment`,
        {
          params: {
            filename,
            mediaType,
            limit,
            start,
            expand: expand.join(','),
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a specific attachment
   * @param attachmentId The ID of the attachment
   */
  async getAttachment(attachmentId: string): Promise<ConfluenceAttachment> {
    try {
      const response = await this.client.get(`/content/${attachmentId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Download attachment content
   * @param attachmentId The ID of the attachment
   */
  async downloadAttachment(attachmentId: string): Promise<{
    data: ArrayBuffer;
    contentType: string;
    filename: string;
  }> {
    try {
      const attachment = await this.getAttachment(attachmentId);
      const downloadUrl = attachment?._links?.download;

      if (!downloadUrl) {
        throw new Error('Download link not available');
      }

      const response = await this.client.get(downloadUrl, {
        responseType: 'arraybuffer',
      });

      return {
        data: response.data,
        contentType: response.headers['content-type'],
        filename: attachment.title,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get recently updated content
   * @param spaceKey Optional space key to filter results
   * @param type Content type to filter by
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   * @param expand Fields to expand in the response
   */
  async getRecentlyUpdated(
    spaceKey?: string,
    type: 'page' | 'blogpost' | 'comment' | 'attachment' = 'page',
    limit: number = 25,
    start: number = 0,
    expand: string[] = []
  ): Promise<ConfluencePageListResponse> {
    try {
      const params: any = {
        type,
        limit,
        start,
        expand: expand.join(','),
        orderby: 'modified',
      };

      if (spaceKey) {
        params.spaceKey = spaceKey;
      }

      const response = await this.client.get('/content', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get content by label
   * @param labelName The name of the label to search for
   * @param spaceKey Optional space key to filter results
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   */
  async getContentByLabel(
    labelName: string,
    spaceKey?: string,
    limit: number = 25,
    start: number = 0
  ): Promise<ConfluencePageListResponse> {
    try {
      const params: any = {
        labelName,
        limit,
        start,
      };

      if (spaceKey) {
        params.spaceKey = spaceKey;
      }

      const response = await this.client.get('/content/search', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get labels for content
   * @param contentId The ID of the content
   * @param prefix Optional prefix to filter labels
   * @param limit Maximum number of results to return
   * @param start Start index for pagination
   */
  async getContentLabels(
    contentId: string,
    prefix?: string,
    limit: number = 25,
    start: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(`/content/${contentId}/label`, {
        params: {
          prefix,
          limit,
          start,
        },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.response) {
      console.error(
        `Error: ${error.response.status} - ${error.response.statusText}`
      );
      if (error.response.status === 401) {
        console.error(
          'Authentication failed. Please check your email and API token.'
        );
      } else if (error.response.status === 404) {
        console.error(
          'Resource not found. Please check your Confluence domain and the requested resource.'
        );
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
    throw error;
  }
}
