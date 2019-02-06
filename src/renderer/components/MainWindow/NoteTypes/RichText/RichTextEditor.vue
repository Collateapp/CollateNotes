<style scoped lang="scss">
  @import "../../../../../../node_modules/quill/dist/quill.snow.css";
  @import "../../../../../../node_modules/katex/dist/katex.min.css";
  #quill-container {
    height: calc(100vh - 185px);
    font-size: 12pt;
  }
  @media (max-width: 1270px) {
    #quill-container {
      height: calc(100vh - 210px);
    }
  }
</style>

<style lang="scss">
@import "../../../../variables.scss";
.ql-toolbar {
  // height: 3em;
  // white-space: nowrap;
}
.ql-syntax {
  background-color: $grey-lightest !important;
  color: $text !important;
}
.ql-formats {
  display: flex !important;
  flex-wrap: wrap;
  overflow-y: visible;
}
</style>

<template>
  <div
    id="quill-container"
    class="ui attached segment"
    @contextmenu.prevent="context"
    v-on:set-html="setHTML"
    v-on:set-content="setContents">
  </div>
</template>

<script>
// Editor from https://github.com/surmon-china/vue-quill-editor/blob/master/editor.vue
import electron from 'electron'
import log from 'electron-log'
import debounce from '../../../../lib/debounce.js'
import fileUrl from '../../../../lib/fileUrl.js'
import ShortcutConverter from '../../../../../shared/shortcutConverter.js'

const SC = new ShortcutConverter()

window.hljs = require('highlight.js')
window.katex = require('katex')
const Quill = require('quill')

// Remove image sanitizer
// https://github.com/quilljs/quill/issues/895
var ImageBlot = Quill.import('formats/image')
ImageBlot.sanitize = function (url) {
  return url  // No sanitization
}

export default {
  props: {
    author: {},
    formats: {
      type: Array,
      default: () => []
    },
    keyBindings: {
      type: Array,
      default: () => []
    },
    keyup: {
      default: null
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data () {
    return {
      editor: {},
      defaultConfig: {
        theme: 'snow',
        modules: {
          formula: true,
          syntax: true,
          toolbar: [
            [
              {'font': []},
              {'header': [1, 2, 3, 4, 5, 6, false]},
              'bold',
              'italic',
              'underline',
              'strike',
              {'color': []},
              {'background': []},
              {'list': 'ordered'},
              {'list': 'bullet'},
              'blockquote',
              'code-block',
              'link',
              'image',
              'clean',
              {'align': []},
              {'indent': '-1'},
              {'indent': '+1'},
              'formula'
            ]
          ],
          keyboard: {
            bindings: {
              bold: SC.toQuill(window.collate.vue.$store.state.settings.keyboardShortcuts.editorBold),
              italic: SC.toQuill(window.collate.vue.$store.state.settings.keyboardShortcuts.editorItalic),
              underline: SC.toQuill(window.collate.vue.$store.state.settings.keyboardShortcuts.editorUnderline)
            }
          }
        }
      }
    }
  },
  mounted () {
    window.collate.quill = new Quill(this.$el, this.setOptions(this.defaultConfig, this.config))
    let toolbar = window.collate.quill.getModule('toolbar')
    toolbar.addHandler('image', function () {
      let files = electron.remote.dialog.showOpenDialog({
        title: 'Attachments',
        buttonLabel: 'Attach',
        properties: ['openFile', 'multiSelections'],
        filters: [
          {name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'webp']}
        ]
      })
      let attachmentPayloads = window.collate.vue.$store.dispatch('addAttachments', files)

      attachmentPayloads.then((files) => {
        for (let file of files) {
          let imageUrl = fileUrl(file.path, 0)
          // window.collate.quill.insertEmbed(window.collate.quill.getLength() - 1, 'image', imageUrl, 'user')
          let selection = window.collate.quill.getSelection()
          if (!selection) selection = window.collate.quill.getLength() - 1
          window.collate.quill.insertEmbed(selection.index, 'image', imageUrl, 'user')
        }
      })
    })

    this.editor = window.collate.quill

    this.formats.map((format) => {
      this.editor.addFormat(format.name, format.options)
    })

    // if (this.output !== 'delta') {
    //   this.editor.root.innerHTML = this.content
    //   // window.collate.quill.clipboard.dangerouslyPasteHTML(0, this.content, 'silent')
    // } else {
    //   this.editor.setContents(this.content)
    // }
    const initialContent = this.content
    if (initialContent.type === 'delta') {
      this.setContents(initialContent.data)
    } else if (initialContent.type === 'html') {
      this.setHTML(initialContent.data)
    }

    // Autosave was firing when a new note was loaded due to the change event handler.
    // By keeping track of the active note id, we only fire auto save when the
    // change event fires and the active note has not changed.
    if (!window.collate.hasOwnProperty('editorHistory')) {
      window.collate.activeNoteIdStorage = ''
    }

    // Use the last font selected in the editor
    let font = this.$store.state.settings.richtextEditor.font
    if (font != null && font) {
      window.collate.quill.format('font', font)
    }

    // Clear tab in toolbar
    this.toolbarTabIndex()

    this.editor.on('text-change', (delta, source) => {
      // this.$emit('text-change', this.editor, delta, source)
      // this.$emit('quill-update', this.output !== 'delta' ? this.editor.root.innerHTML : this.editor.getContents())
      this.debouncedUpdate()

      let activeNote = this.$store.state.mainWindow.activeNoteId
      if (activeNote === window.collate.activeNoteIdStorage) {
        this.debouncedAutoSave()
      }
      window.collate.activeNoteIdStorage = activeNote
    })

    this.editor.on('selection-change', (range) => {
      this.$emit('selection-change', this.editor, range)
    })

    if (typeof this.author !== 'undefined') {
      this.editor.addModule('authorship', {
        authorId: this.author
      })
    }

    if (this.keyBindings.length) {
      const keyboard = this.editor.getModule('keyboard')

      this.keyBindings.map((binding) => {
        keyboard.addHotkey({
          key: binding.key,
          metaKey: true
        }, binding.method.bind(this))
      })
    }

    this.debouncedAutoSave = debounce((body) => {
      this.$store.dispatch('updateSaveStatus')
    }, 200)

    this.debouncedUpdate = debounce(() => {
      this.$store.dispatch('updateNoteBody', this.editor.root.innerHTML)
      this.$store.dispatch('updateNoteMetadata', {key: 'delta', value: this.editor.getContents()})
    }, 100)
  },
  methods: {
    setOptions (defaults, properties) {
      for (let property in properties) {
        if (properties.hasOwnProperty(property)) {
          if (typeof properties[property] === 'object') {
            defaults[property] = this.setOptions(defaults[property], properties[property])
          } else {
            defaults[property] = properties[property]
          }
        }
      }
      return defaults
    },
    // focusEditor (e) {
    //   if (e && e.srcElement) {
    //     let classList = e.srcElement.classList
    //     let isSegment = false
    //     classList.forEach((className) => {
    //       if (className === 'segment') {
    //         isSegment = true
    //       }
    //     })
    //     if (!isSegment) return
    //   }
    //   this.editor.focus()
    //   this.editor.setSelection(this.editor.getLength() - 1, this.editor.getLength())
    // },
    setContents (content) {
      this.editor.setContents(content)
    },
    setHTML (html) {
      this.editor.root.innerHTML = html
    },
    context () {
      try {
        window.collate.editMenu.popup()
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    },
    addDefaultFont () {
      document.getElementsByClassName('ql-font')
    },
    toolbarTabIndex () {
      // add tabindex="-1" to quill toolbar items
      const toolbar = document.getElementsByClassName('ql-formats')[0].children
      for (let tool of toolbar) {
        tool.tabIndex = -1
      }
    }
  },
  computed: {
    content () {
      const html = this.$store.state.mainWindow.activeNote.body
      const delta = this.$store.state.mainWindow.activeNote.metadata.delta
      if (delta != null && delta) {
        return {data: delta, type: 'delta'}
      } else if (html != null && html) {
        return {data: html, type: 'html'}
      } else {
        return {data: '', type: 'html'}
      }
    }
  },
  watch: {
    content (val) {
      if (this.$store.state.mainWindow.activeNoteId === window.collate.activeNoteIdStorage) return
      if (val.type === 'delta') {
        this.setContents(val.data)
      } else if (val.type === 'html') {
        this.setHTML(val.data)
      }
    }
  }
}
</script>
