<template>
  <div
    @keydown.esc.prevent="tabout"
    @blur.prevent.stop="takeFocus"
  >
    <markdown-pane
      v-if="currentEditor === 'markdown'"
    >
    </markdown-pane>

    <rich-text-pane
      v-if="currentEditor === 'richtext'"
    >
    </rich-text-pane>
    <clipper-pane
      v-if="currentEditor === 'clipper'"
    >
    </clipper-pane>
    <outline-pane
      v-if="currentEditor === 'outline'"
    >
    </outline-pane>
  </div>
</template>

<script>
import MarkdownPane from './NoteTypes/Markdown/MarkdownPane'
import RichTextPane from './NoteTypes/RichText/RichTextPane'
import ClipperPane from './NoteTypes/Clipper/ClipperPane'
import OutlinePane from './NoteTypes/Outline/OutlinePane'
export default {
  name: 'editors',
  components: {
    MarkdownPane,
    RichTextPane,
    ClipperPane,
    OutlinePane
  },
  computed: {
    currentEditor () {
      if (this.$store.state.mainWindow.activeNoteId) {
        return this.$store.state.mainWindow.activeNote.metadata.type || 'markdown'
      } else {
        return this.$store.state.settings.editorNewNoteType || 'markdown'
      }
    }
  },
  methods: {
    tabout () {
      const title = document.getElementsByClassName('title-input')
      if (title.length > 0) {
        title[0].focus()
      }
    },
    takeFocus () {
      console.log('taking back focus')
      if (this.currentEditor === 'markdown') {
        if (typeof window.collate.simplemde !== 'undefined') {
          window.collate.simplemde.codemirror.focus()
        }
      } else if (this.currentEditor === 'richtext') {
        if (typeof window.collate.quill !== 'undefined') {
          window.collate.quill.focus()
        }
      } else if (this.currentEditor === 'clipper') {
        if (typeof window.collate.clipper !== 'undefined') {
          window.collate.clipper.focus()
        }
      }
    }
  }
}
</script>
