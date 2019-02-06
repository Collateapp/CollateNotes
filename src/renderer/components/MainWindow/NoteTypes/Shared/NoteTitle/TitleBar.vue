<template>
    <p
      class="control is-expanded"
      @click="makeActiveTitle"
      @blur.prevent.stop="updateTitle"
    >
      <input
        class="input title-input"
        :class="titleEditable ? 'title-active' : 'title-inactive'"
        type="text"
        placeholder="Title"
        ref="title"
        v-model="noteTitleStorage"
        title="Note title"
        @contextmenu.prevent="context"
        @blur.prevent.stop="updateTitle"
        @keyup.enter="updateTitle"
        @focus="storeId"
        tabindex="3"
        >
    </p>
</template>

<script>
import sanitize from 'sanitize-filename'
import log from 'electron-log'
import debounce from '../../../../../lib/debounce.js'
export default {
  name: 'title-bar',
  data () {
    return {
      noteTitleLastUpdate: '',
      noteTitleStorage: '',
      targetNoteId: '',
      titleEditable: true
    }
  },
  mounted () {
    this.noteTitleStorage = this.$store.state.mainWindow.activeNote.metadata.title
    this.titleEditable = false

    this.doUpdate = debounce(() => {
      this.$store.dispatch('updateNoteTitle', {noteId: this.targetNoteId, text: sanitize(this.noteTitleStorage.trim())})
    }, 2000)
  },
  computed: {
    noteTitle () {
      return this.$store.state.mainWindow.activeNote.metadata.title
    },
    activeNoteId () {
      return this.$store.state.mainWindow.activeNoteId
    },
    noteType () {
      return this.$store.state.mainWindow.activeNote.metadata.type
    }
  },
  methods: {
    context () {
      try {
        window.collate.editMenu.popup()
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    },
    makeActiveTitle () {
      this.titleEditable = true
      this.$nextTick(() => {
        this.$refs.title.focus()
      })
    },
    updateTitle () {
      this.titleEditable = false
      if (this.noteTitleStorage === this.noteTitle) {
        return
      } else if (this.noteTitleStorage.length === 0) {
        this.noteTitleStorage = this.noteTitle
        return
      }
      this.doUpdate()
    },
    storeId () {
      // Store the id of the note currently being edited
      this.targetNoteId = this.$store.state.mainWindow.activeNoteId
    }
  },
  watch: {
    activeNoteId (val) {
      this.noteTitleStorage = this.$store.state.mainWindow.activeNote.metadata.title
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../variables.scss";
.title-input {
  cursor: pointer;
}

.title-active {
  cursor: text;
}

.title-inactive {
  background-color: #fff;
  font-weight: 500;
  border: none;
  font-size: 12pt;
  border-bottom: 1px solid $grey-lighter;
  padding-left: 0;
  box-shadow: none;
}

</style>
