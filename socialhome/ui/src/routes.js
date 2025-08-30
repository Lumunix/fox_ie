import settings from '@/stores/settings' 
import {createRouter, createWebHistory } from 'vue-router'
import { storeToRefs } from "pinia"
import gettext from "@/helpers/gettext"
import { useContentsStore } from "@/stores/contents";
import { useProfilesStore } from "@/stores/profiles";
import {useAuthStore} from "@/stores/auth";
import SingleContentContainer from "@/components/SingleContentContainer.vue"
import  StreamContainer from "@/components/StreamContainer.vue"
import TagStreamContainer from "@/components/TagStreamContainer.vue"
import ContactManager from "@/components/ContactManager.vue"
import ContentPublisher from "@/components/ContentPublisher.vue"
const ProfileContainer = () => import("@/components/ProfileContainer.vue")

const { $gettext } = gettext

function prepareContentEditor(to) {
  const { setEditorProps } = useContentsStore()
  const { userIsAuthenticated } = storeToRefs(useAuthStore())
  if (userIsAuthenticated.value) {
    setEditorProps({id: parseInt(to.params?.id, 10),
      mode: to.name,
      recipient: to.query?.recipient
    })
  }
  return {path: to.params.id ? `/content/${to.params.id}` : '/'}
}

function toUserContacts(to) {
  const { user } = storeToRefs(useAuthStore())
  return `/p/${user.value.uuid}/${to.name}`
}

async function fetchStream(to, from, props = undefined) {
  const { hasContent, updateStream } = useContentsStore()
  if (hasContent(to.name)) {
    updateStream(to, props ?? {apiEndpoint: `streams/${to.name}`})
  } else {
    const error = await updateStream(to, props ?? {apiEndpoint: `streams/${to.name}`})
    console.log('fetchStream', to, props)
    if (error) return from.path === '/' ? {path: '/'} : false // potential infinite loop here. should redirect to
                                                              // a NoContent component or something
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to) {
    if (to.hash) {
      return {el: to.hash}
    }
  },
  routes: [
    {
      path: '/:any(.*)*',
      redirect: '/'
    },
    {
      path: '/',
      redirect: to => {
        const { getLandingPage } = useAuthStore()
        const landingPage = getLandingPage()
        if (landingPage) return landingPage
        else return settings.SOCIALHOME_ROOT_PROFILE
                ? `/u/${settings.SOCIALHOME_ROOT_PROFILE}`
                : '/streams/public'
        }
    },
    {
      path: '/streams/followed',
      name: 'followed',
      component: StreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from),
      meta: {
        name: $gettext('Followed'),
        title: $gettext('Posts from people you follow'),
        icon: 'pi pi-at',
        authRequired: true,
        pinned: true,
        isActive: true
      }
    },
    {
      path: '/streams/limited',
      name: 'limited',
      component: StreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from),
      meta: {
        name: $gettext('Limited'),
        title: $gettext('Posts from chosen friends'),
        icon: 'pi pi-lock',
        authRequired: true,
        pinned: true,
        isActive: true,
      }
    },
    {
      path: '/streams/local',
      name: 'local',
      component: StreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from),
      meta: {
        name: $gettext('Local'),
        title: $gettext('Posts from local users'),
        icon: 'pi pi-home',
        authRequired: false,
        pinned: true,
        isActive: true
      }
    },
    {
      path: '/streams/public',
      name: 'public',
      component: StreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from),
      meta: {
        name: $gettext('Public'),
        title: $gettext('Posts from all over the Fediverse'),
        icon: 'pi pi-globe',
        authRequired: !settings.SOCIALHOME_STREAMS_PUBLIC_STREAM_WITHOUT_AUTH,
        pinned: true,
        isActive: true
      }
    },
    {
      path: '/streams/tags',
      name: 'tags',
      component: StreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from),
      meta: {
        name: $gettext('Tags'),
        title: $gettext('Posts from tags you follow'),
        icon: 'pi pi-tags',
        authRequired: true,
        pinned: true,
        isActive: true,
        isCached: false
      }
    },
    {
      path: '/streams/tag/:tagName',
      name: 'tag',
      props: true,
      component: TagStreamContainer,
      beforeEnter: (to, from) => fetchStream(to, from, {apiEndpoint: `streams/tag/${to.params.tagName}`,
        name: `#${to.params.tagName}`,
        title: $gettext('Posts tagged with #%{ tag }', { tag: to.params.tagName })}),
      meta: {
        name: 'Tag',
        title: 'Tag',
        icon: 'pi pi-tag',
        authRequired: false,
        pinned: false,
        isActive: false
      }
    },
    {
      path: '/content',
      props: true,
      children: [
        {
          path: ':id(\\d+|[a-f\\d]+[a-f\\d-]+[a-f\\d]+)/:slug?',
          children: [{
            path: '~edit',
            name: 'edit',
            props: true,
            meta: {
              modal: true,
              authRequired: true
            },
            components: {
              edit: ContentPublisher
            },
            beforeEnter: [prepareContentEditor]
          },
            {
            path: '~reply',
            name: 'reply',
            props: true,
            meta: {
              modal: true,
              authRequired: true
            },
            components: {
              reply: ContentPublisher
            },
            beforeEnter: [prepareContentEditor]
          },
            {
              path: '',
              name: 'content',
              props: true,
              component: SingleContentContainer,
              beforeEnter: async (to, from) => {
                delete to.params.slug // the backend now sends the slug with each content
                const {getContent} = useContentsStore()
                const { content, error } = await getContent(to.params.id)
                console.log('SingleContent', content, error, to)
                if (error) return from.path === '/' ? {path: '/'} : false
                console.log('beforeEnter', content.id, to.params.id)
                if (content.id.toString() !== to.params.id) return {path: `/content/${content.id}`}
                else await fetchStream(to, from, {apiEndpoint: `content/${to.params.id}`})
              },
              meta: {
                name: $gettext('Single Content'),
                icon: 'pi pi-book',
                authRequired: false,
                pinned: false,
                isActive: false
              }
            }],
        },
        {
          path: 'create',
          name: 'create',
          components: {
            post: ContentPublisher
          },
          meta: {
            modal: true,
            authRequired: true
          },
          beforeEnter: [prepareContentEditor]
        }
      ],

    },
    {
      path: '/p',
      props: true,
      children: [
        {
          path: '~followers',
          name: 'followers',
          redirect: toUserContacts,
          meta: {
            authRequired: true
          }
        },        {
          path: '~following',
          name: 'following',
          redirect: toUserContacts,
          meta: {
            authRequired: true
          }
        },
        {
          path: ':uuid([a-f\\d]+[a-f\\d-]+[a-f\\d]+)',
          props: true,
          children: [
            {
              path: 'followers',
              name: 'profile-followers',
              components: {followers: ContactManager},
              meta: {
                contacts: true,
              }
            },
            {
              path: 'following',
              name: 'profile-following',
              components: {following: ContactManager},
              meta: {
                contacts: true,
              }
            },
            {
              path: 'all',
              name: 'profile-all',
              components: {all: StreamContainer}
            },
            {
              path: '',
              name: 'profile-pinned',
              components: {pinned: StreamContainer}
            }
          ]
        }
      ],
      component: ProfileContainer,
      beforeEnter: async (to, from) => {
        console.log('beforeEnter profile', to)
        const { isAuthenticatedUser } = useAuthStore()
        const { fetchContacts, fetchProfile } = useProfilesStore()
        const { error, profile } = await fetchProfile(to.params.uuid)
        if (error) return from.path === '/' ? {path: '/'} : false
        if (!profile.is_local && to.name === 'profile-pinned')
          return {name: 'profile-all', params: {uuid: profile.uuid}}
        console.log('authenticated user?', to.meta?.contacts, isAuthenticatedUser(to.params.uuid), profile)
        if (to.meta?.contacts && isAuthenticatedUser(to.params.uuid)) {
          const contactsError = await fetchContacts(to.name.split('-')[1], to.params.uuid)
          if (contactsError) return from.path === '/' ? {path: '/'} : false
        }
        await fetchStream(to, from,{apiEndpoint: `streams/${to.name}/${to.params.uuid}`,
          title: $gettext('Posts from %{ name }',
              { name: profile?.name ?? profile?.finger})})
      },
      meta: {
        name: $gettext('Profile'),
        icon: 'pi pi-user',
        authRequired: false,
        pinned: false,
        isActive: false
      }
    },
    {
      path: '/u/:username',
      component: ProfileContainer,
      beforeEnter: async (to) => {
        const { fetchUserProfile } = useProfilesStore()
        const { error, uuid } = await fetchUserProfile(to.params.username)
        if (error) return
        return uuid ? {name: 'profile-pinned', params: {uuid: uuid}} : false
      },
    }
  ]
})

router.beforeEach(async(to) => {
  const { userIsAuthenticated } = storeToRefs(useAuthStore())
  const { getAuthenticatedUser } = useAuthStore()
  if (!userIsAuthenticated.value) await getAuthenticatedUser()
  if (to.meta.authRequired && !userIsAuthenticated.value)
    return '/'
})


//router.afterEach((to, from) => {
//  if (Object.hasOwn(to.meta, 'modal')) {
//    Object.assign(to.params, from.params) // this is broken for single content!
//  }
//})
export default router
