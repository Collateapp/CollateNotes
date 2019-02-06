<template>
  <article class="message note-item"
    :key="note.id"
    :id="note.id"
    :class="[isActive(note.id)? 'note-item-active' : '', searchMode ? 'search-mode': '']"
    @click.prevent="click(note.id, $event)"
    @keydown.prevent.enter="keyboardSelect(note.id, $event)"
    @keydown.prevent.space="keyboardSelect(note.id, $event)"
    @keydown.prevent.delete="deleteNote(note.id)"
    @contextmenu.prevent="context(note.id)"
    tabindex="2"
    >
    <div class="message-header">
      <p>{{note.metadata.title}}</p>
    </div>
    <div class="message-body">
      <p>
        <small class="is-pulled-left">Last modified {{genModifiedDate(note.metadata.modified)}}</small>
        <small class="is-pulled-right">
          <span class="icon is-small" :title="note.metadata.type">
            <i class="fa" :class="noteTypeIcon(note.metadata.type)"></i>
          </span>
        </small>
      </p>
      <br />
      {{genDescription(note.metadata.type, note.body)}}
    </div>
  </article>
</template>

<script>
import moment from 'moment'
import log from 'electron-log'
export default {
  name: 'note-card',
  props: [
    'note',
    'sortedNotes'
  ],
  computed: {
    activeNoteId () {
      return this.$store.state.mainWindow.activeNoteId
    },
    searchMode () {
      return this.$store.state.mainWindow.searchMode
    },
    selectedNoteIds: {
      get () {
        return this.$store.state.mainWindow.selectedNoteIds
      },
      set (val) {
        this.$store.dispatch('updateSelectedNoteIds', val)
      }
    }
  },
  methods: {
    isActive (noteId) {
      if (this.activeNoteId === noteId) return true
      for (let i = 0; i < this.selectedNoteIds.length; i++) {
        if (this.selectedNoteIds[i] === noteId) return true
      }
      return false
    },
    keyboardSelect (id, event) {
      this.clearMultiSelect()
      this.shiftClickStart = ''
      this.$store.dispatch('clickNote', id)
    },
    click (id, event) {
      if (event.ctrlKey || event.metaKey) {
        this.ctrlClick(id)
      } else if (event.shiftKey) {
        this.shiftClick(id)
      } else {
        this.clearMultiSelect()
        this.shiftClickStart = ''
        this.$store.dispatch('clickNote', id)
      }
    },
    shiftClick (id) {
      // Get range of ids between start and now
      let notes = this.sortedNotes
      for (let i = 0; i < notes.length; i++) {
        if (notes[i].id === this.activeNoteId || notes[i].id === this.firstPick) {
          this.firstPick = i
        }
        if (notes[i].id === id) {
          this.secondPick = i
        }
      }
      let start = this.secondPick
      let end = this.firstPick
      if (this.firstPick < this.secondPick) {
        start = this.firstPick
        end = this.secondPick
      }
      let selectedNotes = notes.slice(start, end + 1)
      let selected = []
      for (let note of selectedNotes) {
        selected.push(note.id)
      }
      this.selectedNoteIds = selected
      this.$store.dispatch('clearActiveNote')
    },
    ctrlClick (id) {
      let currentlySelected = this.selectedNoteIds
      if (!currentlySelected.constructor === Array) return
      if (currentlySelected.indexOf(id) === -1) {
        // If single note selected already, add it to the list
        if (currentlySelected.length === 0 && currentlySelected.indexOf(this.activeNoteId) === -1) {
          currentlySelected.push(this.activeNoteId)
        }
        currentlySelected.push(id)
        // Clear out the active editor
        if (currentlySelected.length < 3) {
          this.$store.dispatch('clearActiveNote')
        }
      } else {
        currentlySelected.splice(currentlySelected.indexOf(id), 1)
      }
      this.selectedNoteIds = currentlySelected
    },
    clearMultiSelect () {
      this.firstPick = null
      this.secondPick = null
      this.selectedNoteIds = []
    },
    isMultiSelect () {
      if (this.selectedNoteIds.length > 0) {
        return true
      }
      return false
    },
    deleteNote (id) {
      this.$store.dispatch('deleteNote', id)
    },
    context (id) {
      try {
        if (this.isMultiSelect()) {
          window.collate.multiNoteMenu.popup()
        } else {
          window.collate.noteMenuTarget = id
          window.collate.noteMenu.popup()
        }
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    },
    genDescription (type, text) {
      switch (type) {
        case 'outline':
          let data
          try {
            data = JSON.parse(text)
          } catch (e) {
            data = {title: 'Home'}
          }
          return data.title + ' >'
        default:
          return window.collate.collection.genDescription(text)
      }
    },
    genModifiedDate (dateString) {
      return moment(dateString).fromNow()
    },
    noteTypeIcon (noteType) {
      switch (noteType) {
        case 'markdown':
          return 'fa-hashtag'
        case 'richtext':
          return 'fa-font'
        case 'clipper':
          return 'fa-scissors'
        case 'outline':
          return 'fa-list'
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../variables.scss";
ul {
  text-align: left;
}
li {
  list-style: none;
  border: 1px solid $border-color-dark;
}
.hidden {
  visibility: hidden;
}
article {
  cursor: pointer;
}
.note-item {
  margin: 5px;
  margin-bottom: 10px;
}
.message-body {
  word-wrap:break-word;

}
.note-item .message-header {
  background-color: $grey-lightest;
  color: $text;
  border: 1px solid $grey-lighter;
}
.note-item .message-body {
  color: $text;
  max-height: 150px;
  overflow: hidden;
}
.note-item:hover .message-header {
  background-color: $primary;
  border: 1px solid $primary;
  color: $text-dark;
}
.note-item:hover .message-body {
  border: 1px solid $primary;
}
.note-item-active .message-header  {
  background-color: $primary;
  border: 1px solid $primary;
  color: $text-dark;
}
.note-item-active .message-body {
  border: 1px solid $primary;
}
.search-mode {
  border: 2px solid $search-mode;
}
.search-mode-clear {
  color: $primary;
}
.search-mode-clear:hover {
  color: $hover;
}
.search-mode-clear:active {
  position: relative;
  top: 2px;
  left: -2px;
}
.search-mode-indicator {
  color: $search-mode;
}
</style>
