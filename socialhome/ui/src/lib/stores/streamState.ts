import { writable } from "svelte/store";
import _get from "lodash/get";

// ----- TYPES -----

export interface Content {
  id: string;
  replyIds: string[];
  shareIds: string[];
  [key: string]: unknown;
}

export interface Stream {
  id: string;
  name: string;
  single: boolean;
}

export interface Tag {
  name?: string;
  uuid?: string;
}

export interface StreamState {
  contents: Record<string, Content>;
  currentContentIds: string[];
  allContentIds: string[];
  hasNewContent: boolean;
  layoutDoneAfterTwitterOEmbeds: boolean;
  newContentLengh: number;
  showAuthorBar: boolean;
  singleContentId: string | null;
  stream: Stream;
  streamName: string;
  tag: Tag;
  unfetchedContentIds: string[];
}

// ----- INITIALIZATION -----

const content = _get(window, ["context", "content"], undefined) as Content | undefined;
const streamName = _get(window, ["context", "streamName"], "") as string;
const tagContext = _get(window, ["context", "tag"], {}) as Tag;

const currentContentIds: string[] = [];
const allContentIds: string[] = [];
const unfetchedContentIds: string[] = [];
const contents: Record<string, Content> = {};

let singleContentId: string | null = null;

if (content) {
  singleContentId = content.id;
  content.replyIds = [];
  content.shareIds = [];
  currentContentIds.push(content.id);
  allContentIds.push(content.id);
  contents[content.id] = content;
}

const streamSplits = streamName.split("__");
const stream: Stream = {
  id: streamSplits.length ? streamSplits[1] : "",
  name: streamSplits[0],
  single: streamSplits[0] === "content",
};

const tag: Tag = {
  name: tagContext.name,
  uuid: tagContext.uuid,
};

const initialState: StreamState = {
  contents,
  currentContentIds,
  allContentIds,
  hasNewContent: false,
  layoutDoneAfterTwitterOEmbeds: false,
  newContentLengh: 0,
  showAuthorBar: stream.name !== "profile_pinned",
  singleContentId,
  stream,
  streamName,
  tag,
  unfetchedContentIds,
};

// ----- STORE -----

export const streamState = writable<StreamState>(initialState);
s
