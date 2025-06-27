import { writable } from 'svelte/store';

interface StreamStore {
  isAuthenticated: boolean;
  currentBrowsingProfileId: string | null;
  publish: (post: { text: string; visibility: string; pinned?: boolean; includeFollowing?: boolean }) => void;
  shareContent: (id: string | number) => void;
  unshareContent: (id: string | number) => void;
}

function createStreamStore() {
  const { subscribe, update, set } = writable<StreamStore>({
    isAuthenticated: true,
    currentBrowsingProfileId: 'local-user-id',
    publish: () => {},
    shareContent: () => {},
    unshareContent: () => {},
  });

  return {
    subscribe,
    set,
    update,
    publish(post) {
      console.log('Publishing post:', post);
      // Replace this with actual API call
    },
    shareContent(id) {
      console.log('Sharing content with ID:', id);
      // Replace this with actual API call
    },
    unshareContent(id) {
      console.log('Unsharing content with ID:', id);
      // Replace this with actual API call
    }
  };
}

export const streamStore = createStreamStore();
