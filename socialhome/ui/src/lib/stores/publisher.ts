import { writable } from "svelte/store";

// Types for clarity
interface PublishPayload {
    federate?: boolean;
    includeFollowing?: boolean;
    pinned?: boolean;
    recipients?: string;
    showPreview?: boolean;
    text: string;
    visibility: string;
}

interface ReplyPayload {
    parent: number;
    showPreview?: boolean;
    text: string;
    recipients: string;
}

interface EditPayload extends PublishPayload {
    contentId: number;
}

interface EditReplyPayload {
    contentId: number;
    parent: number;
    showPreview?: boolean;
    text: string;
}

// You must inject Axios and Urls when creating the store
export function createPublisherStore(Axios: any, Urls: any) {
    // state: currently empty, but kept for compatibility/expansion
    const { subscribe, set, update } = writable({});

    async function publishPost({
        federate = true,
        includeFollowing = false,
        pinned = false,
        recipients = "",
        showPreview = true,
        text,
        visibility
    }: PublishPayload): Promise<string> {
        const payload = {
            federate,
            include_following: includeFollowing,
            order: 0,
            pinned,
            recipients,
            show_preview: showPreview,
            service_label: "",
            text,
            visibility
        };

        const response = await Axios.post(Urls["api:content-list"](), payload);
        return Urls["content:view"]({ pk: response.data.id });
    }

    async function publishReply({
        parent,
        showPreview = true,
        text,
        recipients
    }: ReplyPayload): Promise<string> {
        const payload = {
            parent,
            show_preview: showPreview,
            text,
            recipients
        };

        const response = await Axios.post(Urls["api:content-list"](), payload);
        return Urls["content:view"]({ pk: response.data.id });
    }

    async function editPost({
        contentId,
        federate = true,
        includeFollowing = false,
        pinned = false,
        recipients = "",
        showPreview = true,
        text,
        visibility
    }: EditPayload): Promise<string> {
        const payload = {
            federate,
            include_following: includeFollowing,
            order: 0,
            pinned,
            recipients,
            show_preview: showPreview,
            service_label: "",
            text,
            visibility
        };

        const response = await Axios.patch(Urls["api:content-detail"]({ pk: contentId }), payload);
        return Urls["content:view"]({ pk: response.data.id });
    }

    async function editReply({
        contentId,
        parent,
        showPreview = true,
        text
    }: EditReplyPayload): Promise<string> {
        const payload = {
            parent,
            show_preview: showPreview,
            text
        };

        const response = await Axios.patch(Urls["api:content-detail"]({ pk: contentId }), payload);
        return Urls["content:view"]({ pk: response.data.id });
    }

    return {
        subscribe,
        publishPost,
        publishReply,
        editPost,
        editReply
    };
}
