import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore, storeToRefs } from 'pinia'
import { useAuthStore} from '@/stores/auth'
import { useProfilesStore } from "@/stores/profiles"
import { useFetch } from '@vueuse/core'
import { useToast } from "primevue/usetoast"
import { apiFetch } from "@/helpers/utils"

function initStream(params) {
  return {
    ...params,
    firstIds: [],
    index: [],
    lastIds: [],
    cachedThroughs: {},
    noMoreData: false,
    notifyKey: undefined,
    unfetched: [],
  }
}

export const useContentsStore = defineStore('contents', () => {
  const routes = useRouter().getRoutes()
  const toast = useToast()
  const {setProfile} = useProfilesStore()
  const {CSRFToken, user, userIsAuthenticated} = storeToRefs(useAuthStore())
  const streams = ref(initStreams())
  const contents = ref({})
  const replies = ref({})
  const isFetching = ref(false)
  let currentStreamName = 'public'
  let currentStream = streams.value[currentStreamName]
  const currentLastId = () => streams.value[currentStreamName].lastIds[0]
  const getLastIdParam = lastId => lastId ? `?last_id=${lastId}` : ""
  //const getAcceptIdsParam = acceptIds => acceptIds ? `?accept_ids=${acceptIds.toString()}` : ""
  const getFirstIdParam = (firstId, separator = '?') => (firstId) ? `${separator}first_id=${firstId}` : ""
  const singleColumn = ref(false)
  const fetchOptions = reactive({
    headers: {
      Accept: 'application/json; version=2.0',
      'X-CSRFToken': CSRFToken
    },
    credentials: 'include'
  })
  let unpinnedStreamName = undefined


  function initStreams() {
    let streams = {}
    routes.forEach(route => {
      console.log('initStreams', route.name)
      if (route.meta?.pinned) {
        streams[route.name] = initStream(route.meta)
      }
      if (route.name === 'content') streams[route.name] = initStream(route.meta)
    })
    return streams
  }

  const getStream = async (streamName, param = "") => {
    const apiEndpoint = streams.value[streamName].apiEndpoint
    console.log('getStream prependContent', param.indexOf('last_id') === -1)
    let fetchDelay = setTimeout(() => isFetching.value = true, 500)
    const {errorMessage, statusCode} = await apiFetch(`/api/${apiEndpoint}/${param}`, fetchOptions, (payload) => {
      currentStreamName = streamName
      currentStream = streams.value[streamName]
      processContent(payload, param.indexOf('last_id') === -1)
    })
    if (errorMessage) {
      toast.add({severity: 'error', summary: 'Content', detail: errorMessage, life: 5000})
      if (statusCode === 403 || statusCode === 404) {
        currentStream.authRequired = true
      }
    }
    clearTimeout(fetchDelay)
    isFetching.value = false
    return {error: errorMessage, hasContent: !!streams.value[streamName].index.length}
  }

  const initContent = (post) => {
    contents.value[post.id] = {...post, replyIds: [], shareIds: [], showReplies: false, activeReplyEditor: false}
    setProfile(post.author)
    if (post.id !== post.through) setProfile(post.through_author)
  }
  
  const getContent = async (id, streamName, update = false) => {
    let content = contents.value[id]
    let error = ''
    if (!content || update) {
      isFetching.value = true
      const {errorMessage} = await apiFetch(`/api/content/${id}/`, fetchOptions, (payload) => {
        content =  payload
      })
      error = errorMessage
      if (!error) {
        if (contents.value[content.parent]) {
          processReplies(content)
        } else if (content.parent) {
          const {errorMessage} = await apiFetch(`/api/content/${content.root_parent}/`, fetchOptions, (payload) => {
            content = payload
          })
          error = errorMessage
        }
      }
    } else if (content?.root_parent) content = contents.value[content.root_parent]

    console.log('getContent', streamName, currentStreamName, update)
    if (error)
      toast.add({severity: 'error', summary: 'Content', detail: error, life: 5000})
    else if (streamName) {
      if (streamName !== currentStreamName) {
        currentStream = streams.value[streamName]
        currentStreamName = streamName
      }
      // on initial load, getContent is only called for the content pseudo stream
      // so this is the only case we set route params
      if (streamName === 'content') {
        currentStream.params = {id: content.id.toString()}
      // content update from a ws notification, we keep the current notify key
      } else delete content.notify_key
      processContent(content)
    } else if (!contents.value[content.id]) initContent(content)

    console.log('getContent', content)
    isFetching.value = false
    return {content, error, hasContent: !!content}
  }

  const hasContent = (streamName) => {
    return !!streams.value[streamName]?.index.length
  }

  const postContent = async (apiEndpoint, method, body) => {
    let content
    const {errorMessage} = await apiFetch(apiEndpoint, {
      method: method,
      body: body,
      headers: {
        ...fetchOptions.headers,
        'content-type': 'application/json',
      },
      credentials: fetchOptions.credentials
    }, (payload) => {
      if (payload.parent) processReplies(payload)
      else processContent(payload)
      content = payload
    })
    return {content, error: errorMessage}
  }

  const processContent = (data, prependContent = true, wasFetched = true) => {
    //let overlap = false;
    let newIds = []
    let notifyKey = undefined
    let unfetchedContent = false
    if (Object.hasOwn(data, 'context')) {
      notifyKey = data.context.notify_key?.replace('_', '/')
      unfetchedContent = data.context.unfetched_content

      currentStream.tagUuid = data.context?.tag_uuid
      console.log('context data', data.context)
      data = data.data
    }
    // Single content or content update
    if (!Array.isArray(data)) {
      notifyKey = data.notify_key?.replace('_', '/')
      data = [data]
    }
    currentStream.notifyKey = notifyKey ?? currentStream.notifyKey
    if (data.length === 0 && !prependContent) {
      currentStream.noMoreData = true
    }
    data.forEach(post => {
      let oldThrough = undefined
      const idx = currentStream.index.indexOf(post.id)
      if (!contents.value[post.id]) {
        initContent(post)
      } else {
        oldThrough = contents.value[post.id].through
        Object.assign(contents.value[post.id], post)
      }
      if (oldThrough !== post.through) {
        if (post.through_author) setProfile(post.through_author)
      }

      if (idx === -1) newIds.push(post.id)
       /* else {
        if (idx !== -1) {
          if (oldThrough !== post.through) {
            let found = currentStream.firstIds.indexOf(oldThrough)
            if (found !== -1) {
              currentStream.firstIds[found] = post.through
            }
            found = currentStream.lastIds.indexOf(oldThrough)
            if (found !== -1) {
              currentStream.lastIds[found] = post.through
            }
          }
          //overlap = overlap || post.through === currentStream.firstIds[prependContent ? 0 : 1]
          //if (wasFetched) currentStream.index.splice(idx, 1)
        } else newIds.push(post.id)
      } */
      currentStream.cachedThroughs[post.through] = post.id
      //if (prependContent) currentStream.firstId = Math.max.apply(null, Object.keys(currentStream.cachedThroughs))

      //if (!oldThrough && idx === -1 && wasFetched || !wasFetched && idx === -1) newIds.push(post.id)
    })
    if (newIds.length > 0) {
      let idx = prependContent ? 0 : currentStream.index.indexOf(currentLastId()) + 1
      currentStream.index.splice(idx, 0, ...newIds)
      console.log('index', currentStream.index, streams.value[currentStreamName].index)
      const newFirstId = newIds[0]
      const newLastId = newIds.slice(-1)[0]
      if (currentStream.lastIds.length === 0) {
        currentStream.firstIds.unshift(newFirstId)
        currentStream.lastIds.unshift(newLastId)
      } else {
        if (prependContent) {
          if (unfetchedContent) {
            currentStream.firstIds.unshift(newFirstId)
            currentStream.lastIds.unshift(newLastId)
          }
          if (wasFetched) currentStream.firstIds[0] = newFirstId
        } else {
          if (!unfetchedContent && currentStream.firstIds.length >= 2) {
            currentStream.firstIds[1] = currentStream.firstIds[0]
            currentStream.firstIds.shift()
            currentStream.lastIds.shift()
          } else {
            currentStream.lastIds[0] = newLastId
          }
        }
      }
    }

    console.log('firstIds', currentStream.firstIds, 'lastIds', currentStream.lastIds)
  }

  const deleteContent = async (id) => {
    const {errorMessage} = await apiFetch(`/api/content/${id}/`,
        {method: 'DELETE', ...fetchOptions})
    if (errorMessage) toast.add({
      severity: 'error',
      message: 'Content Deletion Error',
      detail: errorMessage,
      life: 5000
    })
    else {
      removeContent(id)
    }
  }
  const removeContent = (id) => {
    Object.values(streams.value).forEach((stream) => {
      const idx = stream.index.indexOf(id)
      if (idx !== -1) {
        if (stream.index.length > 1) {
          for (let i=0; i < stream.firstIds.length; i++) {
            if (stream.firstIds[i] === idx) stream.firstIds[i] = stream.index[idx + 1]
            if (stream.lastIds[i] === idx) stream.lastIds[i] = stream.index[idx - 1]
          }
        } else {
          stream.firstIds.shift()
          stream.lastIds.shift()
        }
        stream.index.splice(idx, 1)
      }
    });

    ((content) => {
      removeReplies(content.replyIds)
      if (content.parent) {
        ((parent) => {
          parent.reply_count -= 1
          parent.replyIds.splice(parent.replyIds.indexOf(id), 1)
        })(contents.value[content.parent])
      }
    })(contents.value[id])

    delete contents.value[id]
  }

  const removeReplies = (replyIds) => {
    replyIds.forEach((replyId) => {
      removeReplies(contents.value[replyId].replyIds)
      delete contents.value[replyId]
    })
  }
  const getReplies = async (contentId, fullConversation=false) => {
    isFetching.value = true
    const action = fullConversation ? 'replies' : 'thread'
    const { data, error } = await useFetch(`/api/content/${contentId}/${action}/`, fetchOptions).json()
    if (error.value === null) {
      processReplies(data.value)
    } else {
      console.log('getReplies error:', error.value)
    }
    isFetching.value = false
  }

  const toggleReplies = (postId) => {
    // the replies are fetched asynchronously!
    contents.value[postId].showReplies = !contents.value[postId].showReplies
    if (contents.value[postId].showReplies) {
      if (contents.value[postId].replyIds.length !== contents.value[postId].reply_count)
        getReplies(postId)
    }
    else {
      contents.value[postId].replyIds.forEach((id) => {
        contents.value[id].showReplies = false
      })
    }
  }

  const toggleReplyEditor = (postId) => {
    contents.value[postId].activeReplyEditor = !contents.value[postId].activeReplyEditor
  }

  const processReplies = (data) => {
    if (!Array.isArray(data)) {
      data = [data]
    }
    let replies = {}
    let replyIds = {}
    data.forEach(reply => {
      replies[reply.id] = {...reply, replyIds:[],
        shareIds:[],
        showReplies: false,
        activeReplyEditor: false}
      if (!replyIds[reply.parent]) replyIds[reply.parent] = []
      if (!contents.value[reply.parent]
        || contents.value[reply.parent] && contents.value[reply.parent].replyIds.indexOf(reply.id) === -1) {
        replyIds[reply.parent].push(reply.id)
      }
      setProfile(reply.author)
      if (reply.id !== reply.through) setProfile(reply.through_author)
    })
    Object.assign(contents.value, replies)
    Object.keys(replyIds).forEach(id => {
      contents.value[id].replyIds.push(...replyIds[id])
      contents.value[id].reply_count = contents.value[id].replyIds.length
      //if (contents.value[id].content_type === 'reply') {
      //  contents.value[id].showReplies = contents.value[contents.value[id].parent].showReplies
      //}
    })
  }

  const resetContent = async (fetchContent=true) => {
    Object.keys(streams.value).forEach((name) => {
      Object.assign(streams.value[name], {
        index: [],
        firstIds: [],
        lastIds: [],
        unfetched: []
      })
    })
    if (fetchContent) await getStream(currentStreamName)
  }

  const updateStream = async (route, props) => {
    let doInitStream = true
    let savedStream = {}
    console.log('updateStream', JSON.stringify(streams.value[route.name]?.params), JSON.stringify(reactive(route?.params)), unpinnedStreamName)
    if (!route.meta.pinned) {
      if (Object.hasOwn(streams.value, route.name)) {
        if (JSON.stringify(streams.value[route.name].params) == JSON.stringify(reactive(route?.params))
            && route.name.split('-')[0] === unpinnedStreamName?.split('-')[0]) {
          doInitStream = false
        }
      }
      console.log('replace', doInitStream,  route.name)
      Object.assign(savedStream, streams.value[route.name])
      if (doInitStream) streams.value[route.name] = initStream({...route.meta,
        params: route.params
      })
    }
    Object.assign(streams.value[route.name], props)

    streams.value[route.name].unfetched.length = 0
    let fetchError = ''
    if (!route.meta?.contacts) {
      if (route.name === 'content') fetchError = await getContent(route.params.id, 'content')
      else {
        console.log('index size', streams.value[route.name].index.length)
        if (streams.value[route.name].index.length === 0) fetchError = await getStream(route.name,
          getFirstIdParam(streams.value[route.name].firstIds[0]))
        else fetchError = await getNewContentCount(route.name)
      }
    }

    const error = fetchError.error
    if (!route.meta.pinned) {
      if (error) Object.assign(streams.value[route.name], savedStream)
      else {
        console.log('updateStream', route.name, unpinnedStreamName)
        streams.value[route.name].isActive = true

        if (unpinnedStreamName !== undefined && unpinnedStreamName !== route.name) {
          streams.value[unpinnedStreamName].isActive = false
        }
        unpinnedStreamName = route.name
      }
    }
    return error
  }

  const isAvailable = name =>{
    return streams.value[name].isActive && (userIsAuthenticated.value || !streams.value[name].authRequired)
  }


  const setUnfetchedContent = notification => {
    console.log('setUnfetchedContent', currentStreamName)
    if (notification.parentId) {
      if (contents.value[notification.parentId] !== undefined) { // ignore replies for unfetched parent
        if (contents.value[notification.id] === undefined) {
          if (contents.value[notification.parentId].replyIds.length > 0)
            getContent(notification.id)
          else contents.value[notification.parentId].reply_count += 1
        }
      }
    } else {
      if (currentStream.index.indexOf(notification.id) !== -1) getContent(notification.id, currentStreamName, true)
      else if (currentStream.unfetched.indexOf(notification.id) === -1)    
        currentStream.unfetched.unshift(notification.id)
    }
  }

  const loadMore = async () => {
    console.log('onLoadMore', currentLastId(), currentStream.noMoreData)
    if (Object.keys(contents.value).length) {
      await getStream(currentStreamName,
          `${getLastIdParam(currentLastId())}${getFirstIdParam(currentStream.firstIds[1], '&')}`)
    }
    if (currentStream.noMoreData) isFetching.value = false
  }

  const onNewContent = async () => {
    if (currentStream.unfetched.length) {
      currentStream.unfetched.length = 0
      await getStream(currentStreamName, getFirstIdParam(currentStream.firstIds[0]))
    }
  }

  const getNewContentCount = async (streamName) => {
    const apiEndpoint = streams.value[streamName ?? currentStreamName].apiEndpoint
    const param = getFirstIdParam(streams.value[streamName ?? currentStreamName].firstIds[0]) + '&unfetched_count'
    console.log('getNewContentCount', streamName, apiEndpoint, param)
    const {errorMessage } = await apiFetch(`/api/${apiEndpoint}/${param}`, fetchOptions, (payload) => {
      console.log('getNewContentCount', payload)
      if (streamName) {
        currentStreamName = streamName
        currentStream = streams.value[streamName]
      }
      currentStream.unfetched.length = payload?.count ?? 0
      if (payload.count === null) 
        getStream(currentStreamName, getFirstIdParam(currentStream.firstIds[0]))
    })
    if (errorMessage) 
      toast.add({severity: 'error', summary: 'Content', detail: errorMessage, life: 5000})
    return {error: errorMessage}
  }
  
  const getStreamRoute = (name) => {
    let to = {name: name}
    if (streams.value[name].params !== undefined) {
      to.params = {...streams.value[name].params}
    }
    return to
  }

  const shareChange = async (id, status) => {
    const method = status ? 'POST' : 'DELETE'
    const { errorMessage } = await apiFetch(`/api/content/${id}/share/`,
        {...fetchOptions, method: method}, (payload) => {
      console.log('shareChange', payload)
      let updates = {}
      if (status) {
        updates = {
          through: payload.content_id,
          through_author: user.value,
          shares_count: contents.value[id].shares_count + 1
        }
      } else {
        updates = {
          through: payload.content_id,
          through_author: payload.through_author,
          shares_count: contents.value[id].shares_count - 1
        }
        if (payload.through_author) setProfile(payload.through_author)
      }
      updates.user_has_shared = status
      updates.id = id
      console.log('shareChange', updates)
      processContent(updates, true, false)
    })
    if (errorMessage) toast.add({severity: 'error', summary: 'Share Error', detail: errorMessage, life: 5000})
  }

  const editorProps = ref()
  const setEditorProps = (props) => {
    editorProps.value = props
  }

  return {
    contents,
    getContent,
    getNewContentCount,
    deleteContent,
    postContent,
    getReplies,
    getStreamRoute,
    fetchOptions,
    resetContent,
    isFetching,
    hasContent,
    isAvailable,
    replies,
    toggleReplyEditor,
    streams,
    updateStream,
    setUnfetchedContent,
    shareChange,
    toggleReplies,
    singleColumn,
    setEditorProps,
    editorProps,
    loadMore,
    onNewContent
  }
})
