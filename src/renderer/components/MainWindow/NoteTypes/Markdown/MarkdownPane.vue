<style scoped lang="scss">
  @import "../../../../variables.scss";
  .spacer {
    margin-left: 20px;
    margin-right: 20px;
  }
  .editor-header,
  .editor-tags,
  .editor-attachments {
    margin-top: 4px;
    margin-bottom: 4px;
  }

</style>

<template>
  <div class='editor-body'>
    <note-title></note-title>
    <save-bar></save-bar>
    <editor></editor>
  </div>
</template>

<script>
  import Editor from './MarkdownEditor.vue'
  import NoteTitle from '../Shared/NoteTitle.vue'
  import SaveBar from '../Shared/SaveBar.vue'
  export default {
    name: 'markdown-pane',
    components: {
      Editor,
      NoteTitle,
      SaveBar
    },
    computed: {
      getSaveStatus () {
        let status = this.$store.state.mainWindow.editorSaveStatus
        if (status) {
          return 'Saved'
        } else {
          return 'Unsaved'
        }
      },
      notebook () {
        return this.$store.state.mainWindow.activeNote.notebook
      },
      attachmentModalActive () {
        return this.$store.state.mainWindow.attachmentModalActive
      }
    },
    methods: {
      getActiveNotebookId () {
        return this.$store.state.mainWindow.activeNotebookId
      },
      getAttachments () {
        return {
          type: 'attachments',
          data: this.$store.state.mainWindow.activeNote.attachments
        }
      },
      getTags () {
        return {
          type: 'tags',
          data: this.$store.state.mainWindow.activeNote.metadata.tags
        }
      },
      getActiveNoteId () {
        return this.$store.state.mainWindow.activeNoteId
      },
      drop (e) {
        let files = []
        for (let f of e.dataTransfer.files) {
          files.push(f.path)
        }
        if (this.getActiveNotebookId()) {
          if (this.getActiveNoteId()) {
            this.$store.dispatch('addAttachments', files)
          } else {
            let noteType = this.$store.state.settings.editorNewNoteType
            this.$store.dispatch('newNote', {notebookId: this.getActiveNotebookId(), type: noteType})
            this.$store.dispatch('addAttachments', files)
          }
          this.$store.dispatch('attachmentModalDeactivate')
        }
      }
    }
  }
</script>
