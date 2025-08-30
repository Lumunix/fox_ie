import { Node, nodeInputRule } from '@tiptap/vue-3'
import { Plugin, PluginKey } from 'prosemirror-state'

export interface AudioOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audio: {
      /**
       * Set a audio node
       */
      setAudio: (src: string) => ReturnType,
      /**
       * Toggle a audio
       */
      toggleAudio: (src: string) => ReturnType,
    }
  }
}

const VIDEO_INPUT_REGEX = /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/

export const Audio = Node.create({
  name: 'audio',

  group: "block",

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => (el as HTMLSpanElement).getAttribute('src'),
        renderHTML: (attrs) => ({ src: attrs.src }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio',
        getAttrs: el => ({ src: (el as HTMLAudioElement).getAttribute('src') }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'audio',
      { controls: 'true', ...HTMLAttributes },
      ['source', HTMLAttributes]
    ]
  },

  addCommands() {
    return {
      setAudio: (src: string) => ({ commands }) => commands.insertContent(`<audio controls src="${src}" />`),

      toggleAudio: () => ({ commands }) => commands.toggleNode(this.name, 'paragraph'),
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: VIDEO_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const [,, src] = match

          return { src }
        },
      })
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('audioDropPlugin'),

        props: {
          handleDOMEvents: {
            drop(view, event) {
              const { state: { schema, tr }, dispatch } = view
              const hasFiles = event.dataTransfer &&
                event.dataTransfer.files &&
                event.dataTransfer.files.length

              if (!hasFiles) return false

              const audios = Array
                .from(event.dataTransfer.files)
                .filter(file => (/audio/i).test(file.type))

              if (audios.length === 0) return false

              event.preventDefault()

              const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })

              audios.forEach(audio => {
                const reader = new FileReader()

                reader.onload = readerEvent => {
                  const node = schema.nodes.audio.create({ src: readerEvent.target?.result })

                  if (coordinates && typeof coordinates.pos === 'number') {
                    const transaction = tr.insert(coordinates?.pos, node)

                    dispatch(transaction)
                  }
                }

                reader.readAsDataURL(audio)
              })

              return true
            }
          }
        }
      })
    ]
  }

})
