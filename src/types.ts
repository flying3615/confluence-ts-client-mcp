/**
 * Confluence API types
 */

/**
 * Represents a Confluence page
 */
export interface ConfluencePage {
  /** The ID of the page */
  id: string;
  /** The content type, typically "page" */
  type: string;
  /** The Application Resource Identifier of the page */
  ari: string;
  /** Base64 encoded ARI */
  base64EncodedAri: string;
  /** Status of the page, typically "current" */
  status: string;
  /** Title of the page */
  title: string;
  /** Macro rendered output */
  macroRenderedOutput: Record<string, any>;
  /** Body content of the page */
  body: {
    /** Storage format representation */
    storage?: {
      /** HTML content of the page */
      value: string;
      /** Representation format */
      representation: string;
      /** Embedded content */
      embeddedContent: any[];
      /** Expandable content */
      _expandable?: Record<string, string>;
    };
    /** Other body formats that might be available */
    _expandable?: Record<string, string>;
  };
  /** Page extensions */
  extensions?: Record<string, any>;
  /** Expandable content */
  _expandable?: Record<string, string>;
  /** Links related to the page */
  _links?: {
    /** Edit UI link */
    editui?: string;
    /** Web UI link */
    webui?: string;
    /** Edit UI v2 link */
    edituiv2?: string;
    /** Context path */
    context?: string;
    /** Self link */
    self?: string;
    /** Tiny UI link */
    tinyui?: string;
    /** Collection link */
    collection?: string;
    /** Base URL */
    base?: string;
  };
}

/**
 * Response structure for page requests
 */
export interface ConfluencePageResponse {
  /** The page data */
  page: ConfluencePage;
}

/**
 * Response structure for multiple page requests
 */
export interface ConfluencePageListResponse {
  /** The list of results */
  results: ConfluencePage[];
  /** Start index */
  start: number;
  /** Maximum result limit */
  limit: number;
  /** Size of the result set */
  size: number;
  /** Links for pagination */
  _links: {
    /** Self link */
    self: string;
    /** Link to the next page of results */
    next?: string;
    /** Link to the previous page of results */
    prev?: string;
  };
}

/**
 * Response structure for space requests
 */
export interface ConfluenceSpace {
  /** Space ID */
  id: number;
  /** Space key */
  key: string;
  /** Space name */
  name: string;
  /** Space type */
  type: "global" | "personal";
  /** Space status */
  status: "current" | "archived";
  /** Space description */
  description?: {
    /** Plain text description */
    plain?: {
      /** Description value */
      value: string;
      /** Representation format */
      representation: "plain";
    };
    /** View description */
    view?: {
      /** Description value */
      value: string;
      /** Representation format */
      representation: "view";
    };
  };
  /** Space links */
  _links?: {
    /** Self link */
    self: string;
    /** Web UI link */
    webui: string;
  };
}

/**
 * Response structure for space list requests
 */
export interface ConfluenceSpaceListResponse {
  /** The list of results */
  results: ConfluenceSpace[];
  /** Start index */
  start: number;
  /** Maximum result limit */
  limit: number;
  /** Size of the result set */
  size: number;
  /** Links for pagination */
  _links: {
    /** Self link */
    self: string;
    /** Link to the next page of results */
    next?: string;
  };
}

/**
 * Represents a Confluence comment
 */
export interface ConfluenceComment {
  /** Comment ID */
  id: string;
  /** Content type, typically "comment" */
  type: string;
  /** Comment status */
  status: string;
  /** Comment title */
  title: string;
  /** Comment body */
  body: {
    /** Storage format representation */
    storage?: {
      /** HTML content of the comment */
      value: string;
      /** Representation format */
      representation: string;
    };
  };
  /** Comment version */
  version: {
    /** Version number */
    number: number;
  };
  /** Creator information */
  creator: {
    /** User type */
    type: string;
    /** User display name */
    displayName: string;
  };
  /** Created date */
  created: string;
}

/**
 * Response structure for comment list requests
 */
export interface ConfluenceCommentListResponse {
  /** The list of results */
  results: ConfluenceComment[];
  /** Start index */
  start: number;
  /** Maximum result limit */
  limit: number;
  /** Size of the result set */
  size: number;
  /** Links for pagination */
  _links: {
    /** Self link */
    self: string;
    /** Link to the base path */
    base: string;
  };
}

/**
 * Represents a Confluence attachment
 */
export interface ConfluenceAttachment {
  /** Attachment ID */
  id: string;
  /** Content type, typically "attachment" */
  type: string;
  /** Attachment status */
  status: string;
  /** Attachment title (filename) */
  title: string;
  /** Media type */
  mediaType: string;
  /** File size in bytes */
  fileSize: number;
  /** Extension information */
  extensions?: {
    /** Media type information */
    mediaType?: string;
    /** File size information */
    fileSize?: number;
    /** Comment count */
    comment?: number;
  };
  /** Links related to the attachment */
  _links?: {
    /** Self link */
    self: string;
    /** Download link */
    download: string;
  };
}

/**
 * Response structure for attachment list requests
 */
export interface ConfluenceAttachmentListResponse {
  /** The list of results */
  results: ConfluenceAttachment[];
  /** Start index */
  start: number;
  /** Maximum result limit */
  limit: number;
  /** Size of the result set */
  size: number;
  /** Links for pagination */
  _links: {
    /** Self link */
    self: string;
    /** Link to the base path */
    base: string;
  };
}
