import { writable } from 'svelte/store';

interface Profile {
  uuid: string;
  url: string;
  home_url?: string;
  is_local?: boolean;
  user_following?: boolean;
  id: string;
}

interface ProfilesStore {
  all: Record<string, Profile>;
  fetchProfile: (uuid: string) => void;
  follow: (uuid: string) => void;
  unfollow: (uuid: string) => void;
}

function createProfilesStore() {
  const { subscribe, update, set } = writable<ProfilesStore>({
    all: {},
    fetchProfile: () => {},
    follow: () => {},
    unfollow: () => {},
  });

  return {
    subscribe,
    set,
    update,
    fetchProfile(uuid: string) {
      console.log('Fetching profile for UUID:', uuid);
      update(store => {
        store.all[uuid] = {
          uuid,
          id: uuid,
          url: `/profiles/${uuid}`,
          home_url: 'https://external.example.com/' + uuid,
          is_local: false,
          user_following: false
        };
        return store;
      });
    },
    follow(uuid: string) {
      console.log('Following profile:', uuid);
      update(store => {
        const profile = store.all[uuid];
        if (profile) profile.user_following = true;
        return store;
      });
    },
    unfollow(uuid: string) {
      console.log('Unfollowing profile:', uuid);
      update(store => {
        const profile = store.all[uuid];
        if (profile) profile.user_following = false;
        return store;
      });
    }
  };
}

export const profilesStore = createProfilesStore();
