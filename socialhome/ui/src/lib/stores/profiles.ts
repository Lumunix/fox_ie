import { writable, derived } from 'svelte/store';
import axios from 'axios'; // Adjust import depending on your axios config
import { get as getTranslation } from 'svelte-i18n'; // Or your i18n lib

type Profile = {
    uuid: string;
    user_following?: boolean;
    [key: string]: any;
};

// Internal state
const all = writable<Record<string, Profile>>({});
const index = writable<string[]>([]);

// Derived stores (getters)

export const allProfiles = derived(
    [all, index],
    ([$all, $index]) => $index.map(uuid => $all[uuid])
);

export const getProfileSelection = (selection: { uuid: string }[]) =>
    derived(all, $all => selection.map(profile => $all[profile.uuid]));

export const getByUuid = (uuid: string) =>
    derived(all, $all => $all[uuid]);

// Mutations as functions

function setFollow(uuid: string, status: boolean) {
    all.update(current => {
        if (current[uuid]) current[uuid] = { ...current[uuid], user_following: status };
        return current;
    });
}

function setProfile(profile: Profile) {
    all.update(current => {
        if (!current[profile.uuid]) {
            current[profile.uuid] = profile;
            index.update(idx => [...idx, profile.uuid]);
        } else {
            current[profile.uuid] = { ...current[profile.uuid], ...profile };
        }
        return current;
    });
}

function setProfilesFromContactList(contactList: Profile[]) {
    all.update(current => {
        const idxUpdate: string[] = [];
        contactList.forEach(contact => {
            if (!current[contact.uuid]) {
                current[contact.uuid] = contact;
                idxUpdate.push(contact.uuid);
            }
        });
        index.update(idx => [...idx, ...idxUpdate]);
        return current;
    });
}

function setProfilesFromContentList(contentList: any[]) {
    all.update(current => {
        const idxUpdate: string[] = [];
        contentList.forEach(content => {
            const author = content.author;
            if (author && !current[author.uuid]) {
                current[author.uuid] = author;
                idxUpdate.push(author.uuid);
            }
            const throughAuthor = content.through_author;
            if (throughAuthor && !current[throughAuthor.uuid]) {
                current[throughAuthor.uuid] = throughAuthor;
                idxUpdate.push(throughAuthor.uuid);
            }
        });
        index.update(idx => [...idx, ...idxUpdate]);
        return current;
    });
}

// Actions as functions

async function follow(uuid: string) {
    try {
        await axios.post(Urls["api:profile-follow"]({ uuid }));
        setFollow(uuid, true);
    } catch (error) {
        console.error(error);
        alert(getTranslation('An error happened while trying to follow.'));
    }
}

async function getProfile(uuid: string) {
    try {
        const response = await axios.get(Urls["api:profile-detail"]({ uuid }));
        setProfile(response.data);
    } catch (error) {
        console.error(error);
        alert(getTranslation('An error happened while fetching a profile.'));
    }
}

async function requestProfileUpdate(uuid: string) {
    try {
        await axios.get(Urls["api:profile-schedule-update"]({ uuid }));
    } catch (error) {
        console.error(error);
        alert(getTranslation('An error happened while requesting a profile update.'));
    }
}

async function unFollow(uuid: string) {
    try {
        await axios.post(Urls["api:profile-unfollow"]({ uuid }));
        setFollow(uuid, false);
    } catch (error) {
        console.error(error);
        alert(getTranslation('An error happened while trying to unfollow.'));
    }
}

// Export API

export const profilesStore = {
    all,
    index,
    allProfiles,
    getProfileSelection,
    getByUuid,
    follow,
    getProfile,
    requestProfileUpdate,
    setProfilesFromContactList,
    setProfilesFromContentList,
    setProfile,
    unFollow,
};
