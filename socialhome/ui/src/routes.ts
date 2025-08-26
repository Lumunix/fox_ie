import { Router, type RouteConfig } from '@mateothegreat/svelte5-router';

// Import your Svelte components
import Stream from './lib/components/streams/Stream.svelte';
import AppFollowing from './lib/components/contacts/AppFollowing.svelte';
import AppFollowers from './lib/components/contacts/AppFollowers.svelte';
import Publisher from './lib/components/publisher/Publisher.svelte';
import ReplyPublisher from './lib/components/publisher/ReplyPublisher.svelte';
import EditDispatcher from './lib/components/publisher/EditDispatcher.svelte';

// Route configurations - ORDER MATTERS! Most specific routes first
export const routes: RouteConfig[] = [
    // Most specific content routes FIRST
    {
        path: '/content/(?<contentId>.*)/~reply/',
        component: ReplyPublisher,
    },
    {
        path: '/content/(?<contentId>.*)/~edit/',
        component: EditDispatcher,
    },

    // Publisher routes
    {
        path: '/content/create',
        component: Publisher,
    },
    {
        path: '/bookmarklet',
        component: Publisher,
    },

    // Contacts pages
    {
        path: '/p/~following/',
        component: AppFollowing,
    },
    {
        path: '/p/~followers/',
        component: AppFollowers,
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
    {
        path: '/streams/tag/(?<tag>.*)',
        component: Stream,
    },

    // User routes
    {
        path: '/u/(?<user>.*)',
        component: Stream,
    },

    // Profile routes
    {
        path: '/p/(?<uuid>.*)',
        component: Stream,
    },

    // // Content routes - AFTER the specific action routes
    // {
    //     path: '/content/(?<contentId>.*)/(?<shorttext>.*)',
    //     component: Stream,
    // },
    // {
    //     path: '/content/(?<contentId>.*)',
    //     component: Stream,
    // },

    // Root route - should be last
    {
        path: '/',
        component: Stream,
    },
];
