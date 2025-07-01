import { writable, get, derived } from 'svelte/store';

export interface Content {
    id: string;
    replyIds: string[];
    shareIds: string[];
    reply_count: number;
    hasLoadMore?: boolean;
}

export interface Stream {
    id: string;
    name: string;
    single: boolean;
}

export interface StreamState {
    currentContentIds: string[];
    allContentIds: string[];
    unfetchedContentIds: string[];
    contents: Record<string, Content>;
    stream: Stream;
    pending: { contents: boolean };
    layoutDoneAfterTwitterOEmbeds: boolean;
}

const initialState: StreamState = {
    currentContentIds: [],
    allContentIds: [],
    unfetchedContentIds: [],
    contents: {},
    stream: { id: '', name: '', single: false },
    pending: { contents: false },
    layoutDoneAfterTwitterOEmbeds: false
};

export const streamStore = writable<StreamState>({...initialState});

/**
 * Actions / mutations equivalent
 */

export function disableLoadMore(contentId: string) {
    streamStore.update(state => {
        if (state.contents[contentId]) {
            state.contents[contentId].hasLoadMore = false;
        }
        return state;
    });
}

export function receivedNewContent(payload: { contentId: string; parentId: string | null }) {
    streamStore.update(state => {
        const { contentId, parentId } = payload;
        if (parentId === null) {
            if (!state.unfetchedContentIds.includes(contentId)) {
                state.unfetchedContentIds.unshift(contentId);
            }
        } else if (!state.allContentIds.includes(contentId) && state.contents[parentId]) {
            state.contents[parentId].reply_count += 1;
        }
        return state;
    });
}

export function setLayoutDoneAfterTwitterOEmbeds(status: boolean) {
    streamStore.update(state => {
        state.layoutDoneAfterTwitterOEmbeds = status;
        return state;
    });
}

export function newContentAck() {
    streamStore.update(state => {
        const diff = state.unfetchedContentIds.filter(id => !state.currentContentIds.includes(id));
        state.currentContentIds = [...diff, ...state.currentContentIds];
        state.unfetchedContentIds = [];
        return state;
    });

    const currentState = get(streamStore);
    const unfetchedContentIdsCopy = [...currentState.unfetchedContentIds];
    const dispatchName = `get${currentState.stream.name.charAt(0).toUpperCase()}${currentState.stream.name.slice(1)}Stream`;

    // Placeholder for actual dispatch logic:
    console.log(`Dispatching ${dispatchName} with`, { params: { acceptIds: unfetchedContentIdsCopy } });
}

/**
 * Getters equivalent: derived stores or functions
 */

export function contentById(contentId: string) {
    const currentState = get(streamStore);
    return currentState.contents[contentId];
}

export const currentContentList = derived(streamStore, $state => {
    return $state.currentContentIds
        .map(id => $state.contents[id])
        .filter(content => content !== undefined);
});

export function replies(content: Content) {
    const currentState = get(streamStore);
    return content.replyIds.map(id => currentState.contents[id]).filter(Boolean);
}

export function shares(contentId: string) {
    const currentState = get(streamStore);
    return currentState.contents[contentId]?.shareIds
        .map(id => currentState.contents[id])
        .filter(Boolean) || [];
}

export const hasNewContent = derived(streamStore, $state => {
    return $state.unfetchedContentIds.length > 0 && !$state.pending.contents;
});
