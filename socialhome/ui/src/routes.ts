import { Router, type RouteConfig } from '@mateothegreat/svelte5-router';

// Import your Svelte components
import Stream from './lib/components/streams/Stream.svelte';
import AppFollowing from './lib/components/contacts/AppFollowing.svelte';
import AppFollowers from './lib/components/contacts/AppFollowers.svelte';
import Publisher from './lib/components/publisher/Publisher.svelte';
import ReplyPublisher from './lib/components/publisher/ReplyPublisher.svelte';
import EditDispatcher from './lib/components/publisher/EditDispatcher.svelte';

// Helper function to merge route params with additional props
function $$(props = {}) {
    return (route: any) => ({
        ...route.params,
        ...props,
    });
}

// Helper function for publisher props
function publisherProps(route: any) {
    const { query } = route;
    if (typeof query.url === 'string' && typeof query.title === 'string') {
        return {
            shareUrl: query.url,
            shareTitle: query.title,
            shareNotes: query.notes !== undefined ? query.notes : "",
        };
    }
    return {};
}

// Route configurations
export const routes: RouteConfig[] = [
    // Contacts pages
    {
        path: '/p/~following/',
        component: AppFollowing,
    },
    {
        path: '/p/~followers/',
        component: AppFollowers,
    },

    // Root route
    {
        path: '/',
        component: Stream,
    },

    // Stream routes
    {
        path: '/streams/followed',
        component: Stream,
    },
    {
        path: '/streams/limited',
        component: Stream,
    },
    {
        path: '/streams/local',
        component: Stream,
    },
    {
        path: '/streams/public',
        component: Stream,
    },
    {
        path: '/streams/tags/',
        component: Stream,
    },

    // User routes
    {
        path: '/u/:user',
        component: Stream,
        props: $$(),
    },
    {
        path: '/u/:user/all',
        component: Stream,
        props: $$(),
    },

    // Profile routes
    {
        path: '/p/:uuid',
        component: Stream,
        props: $$(),
    },
    {
        path: '/p/:uuid/all',
        component: Stream,
        props: $$(),
    },

    // Tag routes
    {
        path: '/streams/tag/:tag',
        component: Stream,
        props: $$(),
    },

    // Publisher routes
    {
        path: '/content/create',
        component: Publisher,
        props: publisherProps,
    },
    {
        path: '/bookmarklet',
        component: Publisher,
        props: publisherProps,
    },
    {
        path: '/content/:contentId/~edit/',
        component: EditDispatcher,
        props: $$(),
    },
    {
        path: '/content/:contentId/~reply/',
        component: ReplyPublisher,
        props: (route: any) => ({ parentId: route.params.contentId }),
    },

    // Content routes
    {
        path: '/content/:contentId',
        component: Stream,
        props: $$(),
    },
    {
        path: '/content/:contentId/:shorttext',
        component: Stream,
        props: $$(),
    },
];

