/**
 * Jira API types
 */

/**
 * Represents a simplified Jira issue
 */
export interface SimpleJiraIssue {
  /** The key of the issue (e.g., PROJECT-123) */
  key: string;
  /** Issue summary/title */
  summary: string;
  /** Issue status */
  status: string;
  /** Issue type */
  issueType: string;
  /** Description content */
  description?: string;
}

/**
 * Represents a Jira issue
 */
export interface JiraIssue {
  /** Issue ID */
  id: string;
  /** Issue key (e.g., PROJECT-123) */
  key: string;
  /** Self URI */
  self: string;
  /** All issue fields */
  fields: {
    /** Issue summary/title */
    summary: string;
    /** Issue description */
    description?: {
      /** Content of the description */
      content: Array<{
        /** Content type */
        type: string;
        /** Content elements */
        content: Array<{
          /** Element type */
          type: string;
          /** Text content */
          text?: string;
          /** Attributes */
          attrs?: Record<string, any>;
          /** Child content */
          content?: any[];
        }>;
      }>;
      /** Format of the description */
      type: string;
      /** Version */
      version: number;
    };
    /** Issue status */
    status: {
      /** Status ID */
      id: string;
      /** Status name */
      name: string;
      /** Status description */
      description: string;
      /** Status category */
      statusCategory: {
        /** Category ID */
        id: number;
        /** Category key */
        key: string;
        /** Category name */
        name: string;
      };
    };
    /** Issue type */
    issuetype: {
      /** Type ID */
      id: string;
      /** Type name (e.g., Bug, Story) */
      name: string;
      /** Type description */
      description: string;
      /** Type icon URL */
      iconUrl: string;
      /** Whether it's a subtask type */
      subtask: boolean;
    };
    /** Project the issue belongs to */
    project: {
      /** Project ID */
      id: string;
      /** Project key */
      key: string;
      /** Project name */
      name: string;
    };
    /** Issue assignee */
    assignee?: {
      /** User self URI */
      self: string;
      /** Account ID */
      accountId: string;
      /** Display name */
      displayName: string;
      /** Email address */
      emailAddress?: string;
      /** Avatar URLs */
      avatarUrls: {
        [key: string]: string;
      };
    };
    /** Issue reporter */
    reporter?: {
      /** User self URI */
      self: string;
      /** Account ID */
      accountId: string;
      /** Display name */
      displayName: string;
      /** Email address */
      emailAddress?: string;
      /** Avatar URLs */
      avatarUrls: {
        [key: string]: string;
      };
    };
    /** Issue priority */
    priority?: {
      /** Priority ID */
      id: string;
      /** Priority name */
      name: string;
    };
    /** Issue labels */
    labels?: string[];
    /** Creation date */
    created: string;
    /** Last update date */
    updated: string;
    /** Due date for the issue */
    duedate?: string;
    /** Resolution if the issue is resolved */
    resolution?: {
      /** Resolution ID */
      id: string;
      /** Resolution name */
      name: string;
    };
    /** Fix versions */
    fixVersions?: Array<{
      /** Version ID */
      id: string;
      /** Version name */
      name: string;
      /** Whether version is released */
      released: boolean;
    }>;
    /** Affected versions */
    versions?: Array<{
      /** Version ID */
      id: string;
      /** Version name */
      name: string;
      /** Whether version is released */
      released: boolean;
    }>;
    /** Components associated with the issue */
    components?: Array<{
      /** Component ID */
      id: string;
      /** Component name */
      name: string;
    }>;
    /** Time tracking information */
    timetracking?: {
      /** Original estimate */
      originalEstimate?: string;
      /** Remaining estimate */
      remainingEstimate?: string;
      /** Time spent */
      timeSpent?: string;
      /** Original estimate in seconds */
      originalEstimateSeconds?: number;
      /** Remaining estimate in seconds */
      remainingEstimateSeconds?: number;
      /** Time spent in seconds */
      timeSpentSeconds?: number;
    };
    /** Subtasks of this issue */
    subtasks?: JiraIssue[];
    /** Parent issue if this is a subtask */
    parent?: {
      /** Parent ID */
      id: string;
      /** Parent key */
      key: string;
      /** Parent self URI */
      self: string;
      /** Parent fields */
      fields: {
        /** Parent summary */
        summary: string;
        /** Parent status */
        status: {
          /** Status name */
          name: string;
        };
        /** Parent issue type */
        issuetype: {
          /** Type ID */
          id: string;
          /** Type name */
          name: string;
          /** Whether it's a subtask type */
          subtask: boolean;
        };
      };
    };
    /** Comments on the issue */
    comment?: {
      /** Comments array */
      comments: JiraComment[];
      /** Maximum results */
      maxResults: number;
      /** Total comments count */
      total: number;
      /** Starting index */
      startAt: number;
    };
    /** Issue links to other issues */
    issuelinks?: Array<{
      /** Link ID */
      id: string;
      /** Link self URI */
      self: string;
      /** Link type */
      type: {
        /** Link type ID */
        id: string;
        /** Link type name */
        name: string;
        /** Inward description */
        inward: string;
        /** Outward description */
        outward: string;
      };
      /** Inward issue */
      inwardIssue?: {
        /** Issue ID */
        id: string;
        /** Issue key */
        key: string;
        /** Issue self URI */
        self: string;
        /** Issue fields */
        fields: {
          /** Issue summary */
          summary: string;
          /** Issue status */
          status: {
            /** Status name */
            name: string;
          };
          /** Issue type */
          issuetype: {
            /** Type ID */
            id: string;
            /** Type name */
            name: string;
            /** Type icon URL */
            iconUrl: string;
          };
        };
      };
      /** Outward issue */
      outwardIssue?: {
        /** Issue ID */
        id: string;
        /** Issue key */
        key: string;
        /** Issue self URI */
        self: string;
        /** Issue fields */
        fields: {
          /** Issue summary */
          summary: string;
          /** Issue status */
          status: {
            /** Status name */
            name: string;
          };
          /** Issue type */
          issuetype: {
            /** Type ID */
            id: string;
            /** Type name */
            name: string;
            /** Type icon URL */
            iconUrl: string;
          };
        };
      };
    }>;
    /** Work logs */
    worklog?: {
      /** Work logs array */
      worklogs: JiraWorklog[];
      /** Maximum results */
      maxResults: number;
      /** Total work logs count */
      total: number;
      /** Starting index */
      startAt: number;
    };
    /** Custom fields */
    [key: string]: any;
  };
  /** Issue changelog */
  changelog?: {
    /** History entries */
    histories: Array<{
      /** ID of the history entry */
      id: string;
      /** Author of the change */
      author: {
        /** Account ID */
        accountId: string;
        /** Display name */
        displayName: string;
      };
      /** Created date */
      created: string;
      /** Changed items */
      items: Array<{
        /** Field that was changed */
        field: string;
        /** Field type */
        fieldtype: string;
        /** Field ID */
        fieldId?: string;
        /** From value */
        from?: string;
        /** From string value */
        fromString?: string;
        /** To value */
        to?: string;
        /** To string value */
        toString?: string;
      }>;
    }>;
  };
  /** Editmeta for issue */
  editmeta?: {
    /** Fields metadata */
    fields: Record<
      string,
      {
        /** Whether field is required */
        required: boolean;
        /** Operations that can be performed */
        operations: string[];
        /** Schema of the field */
        schema: {
          /** Field type */
          type: string;
          /** Field items */
          items?: string;
          /** Field system */
          system?: string;
          /** Field custom ID */
          custom?: string;
          /** Field custom name */
          customId?: number;
        };
        /** Allowed values */
        allowedValues?: any[];
      }
    >;
  };
}

/**
 * Response structure for issue list requests
 */
export interface JiraIssueListResponse {
  /** The list of issues */
  issues: JiraIssue[];
  /** Maximum results */
  maxResults: number;
  /** Total issues count */
  total: number;
  /** Starting index */
  startAt: number;
}

/**
 * Response structure for search requests
 */
export interface JiraSearchResponse extends JiraIssueListResponse {
  /** Names of the fields that were expanded */
  names?: Record<string, string>;
  /** Schema for the fields */
  schema?: Record<string, any>;
}

/**
 * Represents a Jira project
 */
export interface JiraProject {
  /** Project ID */
  id: string;
  /** Project key */
  key: string;
  /** Project name */
  name: string;
  /** Project description */
  description?: string;
  /** Project lead */
  lead: {
    /** Account ID */
    accountId: string;
    /** Display name */
    displayName: string;
    /** Self URI */
    self: string;
  };
  /** Components in the project */
  components?: Array<{
    /** Component ID */
    id: string;
    /** Component name */
    name: string;
    /** Component description */
    description?: string;
    /** Component lead */
    lead?: {
      /** Account ID */
      accountId: string;
      /** Display name */
      displayName: string;
    };
  }>;
  /** Issue types available in the project */
  issueTypes?: Array<{
    /** Issue type ID */
    id: string;
    /** Issue type name */
    name: string;
    /** Issue type description */
    description: string;
    /** Whether it's a subtask type */
    subtask: boolean;
  }>;
  /** URL for the project avatar */
  avatarUrls: Record<string, string>;
  /** Project category */
  projectCategory?: {
    /** Category ID */
    id: string;
    /** Category name */
    name: string;
    /** Category description */
    description?: string;
  };
  /** Project URL */
  url: string;
  /** Project email */
  email?: string;
  /** Whether archiving is enabled */
  archived: boolean;
  /** Project style (next-gen or classic) */
  style?: 'next-gen' | 'classic';
}

/**
 * Response structure for project list requests
 */
export interface JiraProjectListResponse {
  /** List of projects */
  projects: JiraProject[];
}

/**
 * Represents a Jira board
 */
export interface JiraBoard {
  /** Board ID */
  id: number;
  /** Board self URI */
  self: string;
  /** Board name */
  name: string;
  /** Board type (scrum, kanban) */
  type: string;
  /** Associated project */
  location?: {
    /** Project ID */
    projectId: number;
    /** Project name */
    displayName: string;
    /** Project key */
    projectKey: string;
    /** Project name */
    projectName: string;
    /** Project type */
    projectTypeKey: string;
    /** Project avatar URL */
    avatarURI: string;
    /** Project name */
    name: string;
  };
}

/**
 * Response structure for board list requests
 */
export interface JiraBoardListResponse {
  /** Maximum results */
  maxResults: number;
  /** Starting index */
  startAt: number;
  /** Total boards count */
  total: number;
  /** Whether there are more results */
  isLast: boolean;
  /** List of boards */
  values: JiraBoard[];
}

/**
 * Represents a Jira sprint
 */
export interface JiraSprint {
  /** Sprint ID */
  id: number;
  /** Sprint self URI */
  self: string;
  /** Sprint state (future, active, closed) */
  state: string;
  /** Sprint name */
  name: string;
  /** Sprint start date */
  startDate?: string;
  /** Sprint end date */
  endDate?: string;
  /** Sprint complete date */
  completeDate?: string;
  /** Sprint origin board ID */
  originBoardId: number;
  /** Sprint goal */
  goal?: string;
}

/**
 * Response structure for sprint list requests
 */
export interface JiraSprintListResponse {
  /** Maximum results */
  maxResults: number;
  /** Starting index */
  startAt: number;
  /** Total sprints count */
  total: number;
  /** Whether there are more results */
  isLast: boolean;
  /** List of sprints */
  values: JiraSprint[];
}

/**
 * Represents a Jira user
 */
export interface JiraUser {
  /** Self URI */
  self: string;
  /** Account ID */
  accountId: string;
  /** Account type */
  accountType: string;
  /** Whether user is active */
  active: boolean;
  /** Display name */
  displayName: string;
  /** Email address */
  emailAddress?: string;
  /** Avatar URLs */
  avatarUrls: Record<string, string>;
  /** Time zone */
  timeZone?: string;
  /** Locale */
  locale?: string;
}

/**
 * Represents a Jira comment
 */
export interface JiraComment {
  /** Comment ID */
  id: string;
  /** Self URI */
  self: string;
  /** Author */
  author: {
    /** Account ID */
    accountId: string;
    /** Display name */
    displayName: string;
    /** Self URI */
    self: string;
    /** Avatar URLs */
    avatarUrls: Record<string, string>;
  };
  /** Comment body */
  body: {
    /** Content of the comment */
    content: Array<{
      /** Content type */
      type: string;
      /** Content elements */
      content: Array<any>;
    }>;
    /** Format of the comment */
    type: string;
    /** Version */
    version: number;
  };
  /** Update author */
  updateAuthor: {
    /** Account ID */
    accountId: string;
    /** Display name */
    displayName: string;
    /** Self URI */
    self: string;
    /** Avatar URLs */
    avatarUrls: Record<string, string>;
  };
  /** Created date */
  created: string;
  /** Updated date */
  updated: string;
  /** Visibility restrictions */
  visibility?: {
    /** Visibility type */
    type: string;
    /** Visibility value */
    value: string;
  };
}

/**
 * Response structure for comment list requests
 */
export interface JiraCommentListResponse {
  /** List of comments */
  comments: JiraComment[];
  /** Maximum results */
  maxResults: number;
  /** Total comments count */
  total: number;
  /** Starting index */
  startAt: number;
}

/**
 * Represents a Jira worklog entry
 */
export interface JiraWorklog {
  /** Worklog ID */
  id: string;
  /** Self URI */
  self: string;
  /** Author */
  author: {
    /** Account ID */
    accountId: string;
    /** Display name */
    displayName: string;
    /** Self URI */
    self: string;
    /** Avatar URLs */
    avatarUrls: Record<string, string>;
  };
  /** Update author */
  updateAuthor: {
    /** Account ID */
    accountId: string;
    /** Display name */
    displayName: string;
    /** Self URI */
    self: string;
    /** Avatar URLs */
    avatarUrls: Record<string, string>;
  };
  /** Comment */
  comment?: {
    /** Comment type */
    type: string;
    /** Comment version */
    version: number;
    /** Comment content */
    content: Array<{
      /** Content type */
      type: string;
      /** Content elements */
      content: Array<any>;
    }>;
  };
  /** Created date */
  created: string;
  /** Updated date */
  updated: string;
  /** Start date */
  started: string;
  /** Time spent in seconds */
  timeSpentSeconds: number;
  /** Time spent formatted */
  timeSpent: string;
  /** Visibility restrictions */
  visibility?: {
    /** Visibility type */
    type: string;
    /** Visibility value */
    value: string;
  };
}

/**
 * Response structure for worklog list requests
 */
export interface JiraWorklogListResponse {
  /** List of worklogs */
  worklogs: JiraWorklog[];
  /** Maximum results */
  maxResults: number;
  /** Total worklogs count */
  total: number;
  /** Starting index */
  startAt: number;
}

/**
 * Represents a Jira transition
 */
export interface JiraTransition {
  /** Transition ID */
  id: string;
  /** Transition name */
  name: string;
  /** Status that the issue will transition to */
  to: {
    /** Status ID */
    id: string;
    /** Status name */
    name: string;
    /** Status description */
    description?: string;
    /** Status icon URL */
    iconUrl?: string;
    /** Status category */
    statusCategory: {
      /** Category ID */
      id: number;
      /** Category key */
      key: string;
      /** Category name */
      name: string;
      /** Category color */
      colorName: string;
    };
    /** Self URI */
    self: string;
  };
  /** Whether the transition has a screen */
  hasScreen: boolean;
  /** Whether the transition is global */
  isGlobal: boolean;
  /** Whether the transition is initial */
  isInitial: boolean;
  /** Whether the transition is conditional */
  isConditional: boolean;
  /** Fields required by the transition */
  fields?: Record<
    string,
    {
      /** Whether field is required */
      required: boolean;
      /** Schema of the field */
      schema: {
        /** Field type */
        type: string;
        /** Field items */
        items?: string;
        /** Field system */
        system?: string;
        /** Field custom ID */
        custom?: string;
        /** Field custom name */
        customId?: number;
      };
      /** Allowed values */
      allowedValues?: any[];
    }
  >;
}
