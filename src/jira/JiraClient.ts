import axios, { AxiosInstance } from 'axios';
import {
  JiraIssue,
  JiraIssueListResponse,
  JiraProject,
  JiraProjectListResponse,
  JiraBoard,
  JiraBoardListResponse,
  JiraSprint,
  JiraSprintListResponse,
  JiraUser,
  JiraComment,
  JiraCommentListResponse,
  JiraWorklog,
  JiraWorklogListResponse,
  JiraSearchResponse,
  JiraTransition,
} from './jiraTypes.js';
import { JiraIssueExtractor } from './JiraIssueExtractor.js';
import https from 'https';

export class JiraClient {
  private readonly client: AxiosInstance;
  private readonly issueExtractor: JiraIssueExtractor;

  constructor(
    private readonly domain: string,
    private readonly user: string,
    private readonly token: string
  ) {
    const authToken = Buffer.from(`${user}:${token}`).toString('base64');
    this.client = axios.create({
      baseURL: `https://${domain}/rest/api/3`,
      headers: {
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
    this.issueExtractor = new JiraIssueExtractor();
  }

  // TODO: default active sprint, MCP use prompt to rewrite this issue discription
  /**
   * Get a Jira issue by its key
   * @param issueKey The key of the issue to retrieve (e.g., PROJECT-123)
   * @param fields Optional array of field names to include
   * @returns The issue data
   */
  async getIssue(issueKey: string, fields?: string[]): Promise<JiraIssue> {
    try {
      const params: Record<string, any> = {};
      if (fields && fields.length > 0) {
        params.fields = fields.join(',');
      }
      const config = {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      };
      const response = await this.client.get(`/issue/${issueKey}`, {
        params,
        ...config,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search for Jira issues using JQL (Jira Query Language)
   * @param jql The JQL search query string
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @param fields Optional array of field names to include
   * @returns Search results matching the query
   * @example
   * // Search for issues in the PROJECT project
   * client.searchIssues('project = PROJECT')
   * // Search for open bugs assigned to the current user
   * client.searchIssues('type = Bug AND status = "Open" AND assignee = currentUser()')
   */
  async searchIssues(
    jql: string,
    startAt: number = 0,
    maxResults: number = 50,
    fields?: string[]
  ): Promise<JiraSearchResponse> {
    try {
      const params: Record<string, any> = {
        jql,
        startAt,
        maxResults,
      };

      if (fields && fields.length > 0) {
        params.fields = fields.join(',');
      }

      const response = await this.client.get('/search', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all projects the user has access to
   * @param recent Get only recently accessed projects
   * @returns List of projects
   */
  async getProjects(recent: boolean = false): Promise<JiraProjectListResponse> {
    try {
      const endpoint = recent ? '/project/recent' : '/project';
      const response = await this.client.get(endpoint);
      return { projects: response.data };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get a specific project by its key
   * @param projectKey The key of the project to retrieve
   * @returns The project data
   */
  async getProject(projectKey: string): Promise<JiraProject> {
    try {
      const response = await this.client.get(`/project/${projectKey}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all boards visible to the user
   * @param projectKeyOrId Optional project key to filter boards
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of boards
   */
  async getBoards(
    projectKeyOrId?: string,
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraBoardListResponse> {
    try {
      const params: Record<string, any> = {
        startAt,
        maxResults,
      };

      if (projectKeyOrId) {
        params.projectKeyOrId = projectKeyOrId;
      }

      // Note: Boards use a different API endpoint
      const response = await this.client.get('/board', {
        baseURL: `https://${this.domain}/rest/agile/1.0`,
        params,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all sprints in a board
   * @param boardId The ID of the board
   * @param state Optional filter for sprint state (future, active, closed)
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of sprints
   */
  async getSprints(
    boardId: number,
    state?: 'future' | 'active' | 'closed',
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraSprintListResponse> {
    try {
      const params: Record<string, any> = {
        startAt,
        maxResults,
      };

      if (state) {
        params.state = state;
      }

      const response = await this.client.get(`/board/${boardId}/sprint`, {
        baseURL: `https://${this.domain}/rest/agile/1.0`,
        params,
      });

      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all issues in a sprint, optionally filtered by a list of issue types
   * @param sprintId The ID of the sprint
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @param issueTypes Optional array of issue types to filter (e.g., ['Story', 'Bug', 'Epic', 'Sub-task'])
   * @returns List of issues (filtered if issueTypes is provided)
   */
  async getSprintIssues(
    sprintId: number,
    startAt: number = 0,
    maxResults: number = 50,
    issueTypes?: string[]
  ): Promise<JiraIssueListResponse> {
    try {
      const params = {
        startAt,
        maxResults,
      };

      const response = await this.client.get(`/sprint/${sprintId}/issue`, {
        baseURL: `https://${this.domain}/rest/agile/1.0`,
        params,
      });

      let issues = response.data.issues;
      if (issueTypes && Array.isArray(issueTypes) && issueTypes.length > 0) {
        issues = issues.filter((issue: any) =>
          issueTypes.includes(issue.fields.issuetype?.name)
        );
      }
      return { ...response.data, issues };
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all users in the Jira instance
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of users
   */
  async getUsers(
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraUser[]> {
    try {
      const params = {
        startAt,
        maxResults,
      };

      const response = await this.client.get('/users/search', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Search for users by query string
   * @param query The search query
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of matching users
   */
  async searchUsers(
    query: string,
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraUser[]> {
    try {
      const params = {
        query,
        startAt,
        maxResults,
      };

      const response = await this.client.get('/user/search', { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get comments for an issue
   * @param issueKey The key of the issue
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of comments
   */
  async getIssueComments(
    issueKey: string,
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraCommentListResponse> {
    try {
      const params = {
        startAt,
        maxResults,
      };

      const response = await this.client.get(`/issue/${issueKey}/comment`, {
        params,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all work logs for an issue
   * @param issueKey The key of the issue
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of work logs
   */
  async getIssueWorklogs(
    issueKey: string,
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<JiraWorklogListResponse> {
    try {
      const params = {
        startAt,
        maxResults,
      };

      const response = await this.client.get(`/issue/${issueKey}/worklog`, {
        params,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get issue types for a project
   * @param projectIdOrKey The ID or key of the project
   * @returns List of issue types
   */
  async getIssueTypes(projectIdOrKey: string): Promise<any[]> {
    try {
      const response = await this.client.get(
        `/project/${projectIdOrKey}/statuses`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get available transitions for an issue
   * @param issueKey The key of the issue
   * @returns List of available transitions
   */
  async getIssueTransitions(issueKey: string): Promise<JiraTransition[]> {
    try {
      const response = await this.client.get(`/issue/${issueKey}/transitions`);
      return response.data.transitions;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Find related issues for a given issue
   * @param issueKey The key of the issue to find related issues for
   * @returns List of related issues
   */
  async getRelatedIssues(issueKey: string): Promise<JiraIssue[]> {
    try {
      // First get the issue to extract project, labels, etc.
      const issue = await this.getIssue(issueKey, [
        'summary',
        'labels',
        'project',
      ]);

      // Build a JQL query to find related issues
      const relatedQueries = [];

      // Issues in the same project
      relatedQueries.push(`project = ${issue.fields.project.key}`);

      // Issues with similar summary (extract keywords)
      if (issue.fields.summary) {
        const keywords = issue.fields.summary
          .split(/\s+/)
          .filter(word => word.length > 3)
          .map(word => word.replace(/[^\w\s]/g, ''));

        if (keywords.length > 0) {
          const keywordQuery = keywords
            .map(word => `summary ~ "${word}"`)
            .join(' OR ');
          relatedQueries.push(`(${keywordQuery})`);
        }
      }

      // Issues with shared labels
      if (issue.fields.labels && issue.fields.labels.length > 0) {
        const labelQuery = issue.fields.labels
          .map(label => `labels = "${label}"`)
          .join(' OR ');
        relatedQueries.push(`(${labelQuery})`);
      }

      // Combine queries and exclude the original issue
      const jql = `(${relatedQueries.join(' OR ')}) AND issuekey != ${issueKey} ORDER BY updated DESC`;

      // Execute search with the constructed JQL
      const searchResult = await this.searchIssues(jql, 0, 10);
      return searchResult.issues;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Get all dashboards available to the user
   * @param startAt Starting index for pagination
   * @param maxResults Maximum number of results to return
   * @returns List of dashboards
   */
  async getDashboards(
    startAt: number = 0,
    maxResults: number = 50
  ): Promise<any> {
    try {
      const params = {
        startAt,
        maxResults,
      };

      const response = await this.client.get('/dashboard', { params });
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
      } else if (error.response.status === 403) {
        console.error(
          'Permission denied. You do not have access to this resource.'
        );
      } else if (error.response.status === 404) {
        console.error(
          'Resource not found. Please check the requested resource exists.'
        );
      }
    } else {
      console.error('An unexpected error occurred:', error.message);
    }
    throw error;
  }

  /**
   * Extract formatted details from a Jira issue
   * @param issue The Jira issue to extract details from
   * @returns Formatted string with issue details
   */
  extractIssueDetails(issue: JiraIssue): string {
    return this.issueExtractor.extractIssueDetails(issue);
  }
}
