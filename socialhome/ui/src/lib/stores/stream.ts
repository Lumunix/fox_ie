import { writable } from "svelte/store";
import axios from "axios";
import produce from "immer";
import { Urls } from "$lib/urls"; // Assumes you ported Urls from Django JS reverse or similar

interface Content {
  id: string;
  replyIds: string[];
  shareIds: string[];
  [key: string]: any;
}

interface StreamState {
  contents: Record<string, Content>;
  currentContentIds: string[];
  allContentIds: string[];
  layoutDoneAfterTwitterOEmbeds: boolean;
}

function createStreamStore() {
  const initialState: StreamState = {
    contents: {},
    currentContentIds: [],
    allContentIds: [],
    layoutDoneAfterTwitterOEmbeds: false,
  };

  const { subscribe, update, set } = writable<StreamState>(initialState);

  // Helper: add "hasLoadMore" to a content item
  function addHasLoadMore() {
    update(state => produce(state, draft => {
      const len = draft.currentContentIds.length;
      const loadMoreContentId = draft.currentContentIds[len - 6] || draft.currentContentIds[len - 1];
      if (loadMoreContentId && draft.contents[loadMoreContentId]) {
        draft.contents[loadMoreContentId].hasLoadMore = true;
      }
      draft.layoutDoneAfterTwitterOEmbeds = false;
    }));
  }

  // Success handlers
  function fetchContentsSuccess(data: Content[]) {
    update(state => produce(state, draft => {
      let newItems = 0;
      data.forEach(item => {
        const content: Content = { ...item, replyIds: [], shareIds: [] };
        draft.contents[content.id] = content;
        if (!draft.currentContentIds.includes(content.id)) {
          draft.currentContentIds.push(content.id);
          newItems++;
        }
        if (!draft.allContentIds.includes(content.id)) {
          draft.allContentIds.push(content.id);
        }
      });
      if (newItems > 0) addHasLoadMore();
    }));
  }

  function fetchRepliesSuccess(data: Content | Content[]) {
    const replies = Array.isArray(data) ? data : [data];
    update(state => produce(state, draft => {
      replies.forEach(reply => {
        const newReply = { ...reply, replyIds: [], shareIds: [] };
        draft.contents[newReply.id] = newReply;

        const parent = draft.contents[newReply.parent];
        if (parent && !parent.replyIds.includes(newReply.id)) {
          parent.replyIds.push(newReply.id);
          parent.reply_count = parent.replyIds.length;
        }
        if (!draft.allContentIds.includes(newReply.id)) {
          draft.allContentIds.push(newReply.id);
        }
      });
    }));
  }

  function fetchSharesSuccess(data: Content[]) {
    update(state => produce(state, draft => {
      data.forEach(share => {
        const newShare = { ...share, replyIds: [] };
        draft.contents[newShare.id] = newShare;
        const parent = draft.contents[newShare.share_of];
        if (parent && !parent.shareIds.includes(newShare.id)) {
          parent.shareIds.push(newShare.id);
        }
        if (!draft.allContentIds.includes(newShare.id)) {
          draft.allContentIds.push(newShare.id);
        }
      });
    }));
  }

  // Fetch contents
  async function fetchStream(type: "public" | "followed" | "limited" | "local", params?: { lastId?: string, acceptIds?: string[] }) {
    const { lastId, acceptIds } = params ?? {};
    const url = `${Urls[`api-streams:${type}`]()}${lastId ? `?last_id=${lastId}` : ""}${acceptIds ? `?accept_ids=${acceptIds.join(",")}` : ""}`;
    try {
      const response = await axios.get(url);
      fetchContentsSuccess(response.data);
    } catch (error) {
      console.error("Error fetching stream", error);
    }
  }

  async function fetchReplies(id: string) {
    try {
      const response = await axios.get(Urls["api:content-replies"]({ pk: id }));
      fetchRepliesSuccess(response.data);
    } catch (error) {
      console.error("Error fetching replies", error);
    }
  }

  async function fetchShares(id: string) {
    try {
      const response = await axios.get(Urls["api:content-shares"]({ pk: id }));
      fetchSharesSuccess(response.data);
    } catch (error) {
      console.error("Error fetching shares", error);
    }
  }

  async function shareContent(id: string) {
    try {
      await axios.post(Urls["api:content-share"]({ pk: id }));
      update(state => produce(state, draft => {
        const content = draft.contents[id];
        if (content) {
          content.shares_count = (content.shares_count || 0) + 1;
          content.user_has_shared = true;
        }
      }));
    } catch (error) {
      console.error("Error sharing content", error);
    }
  }

  async function unshareContent(id: string) {
    try {
      await axios.delete(Urls["api:content-share"]({ pk: id }));
      update(state => produce(state, draft => {
        const content = draft.contents[id];
        if (content) {
          content.shares_count = (content.shares_count || 1) - 1;
          content.user_has_shared = false;
        }
      }));
    } catch (error) {
      console.error("Error unsharing content", error);
    }
  }

  return {
    subscribe,
    reset: () => set(initialState),
    fetchStream,
    fetchReplies,
    fetchShares,
    shareContent,
    unshareContent,
  };
}

export const streamStore = createStreamStore();
