<template>
  <div>
    <aside class="menu note-header">
      <p class="menu-label">
        <span
          v-if="searchMode"
          class="search-mode-indicator"
          >
            Search Mode
          <small
            class="search-mode-clear"
            @click.prevent="clearSearch"
          >
            Clear
          </small>
        </span>
        <span v-else>Notes</span>
        <span>
          <span
            title="Sort by alphabetical, or last modified"
            class="sort"
            @click="toggleSort"
          >
            {{tagSort}}
          </span>
          <span
            title="Sort ascending or descending"
            class="sort"
            @click="toggleSortDir"
          >{{tagSortDir}}</span>
        </span>
      </p>
    </aside>

    <div
      id="note-list"
      @keydown.prevent.up="scrollUp"
      @keydown.prevent.down="scrollDown"
    >
      <template v-for="note in sortedNotes" >
        <note-list-item
          :key="note.id"
          v-if="notePaneListType === 'compact'"
          :note="note"
          :sortedNotes="sortedNotes"
        ></note-list-item>
        <note-card
          :key="note.id"
          v-else
          :note="note"
          :sortedNotes="sortedNotes"
        ></note-card>
      </template>
    </div>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import moment from 'moment'
  import NoteCard from './NoteCard'
  import NoteListItem from './NoteListItem'
  export default {
    name: 'note-list',
    components: {
      NoteCard,
      NoteListItem
    },
    props: [
      'notes'
    ],
    data () {
      return {
        firstPick: 0,
        secondPick: 0
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('keyboardShortcutNote')
      ipcRenderer.on('keyboardShortcutNote', (event, msg) => {
        switch (msg) {
          case 'notePaneUp':
            this.scrollUp()
            break
          case 'notePaneDown':
            this.scrollDown()
            break
          case 'notePaneFirst':
            this.scrollFirst()
            break
          case 'notePaneLast':
            this.scrollLast()
            break
        }
      })
    },
    computed: {
      tagSort: {
        get () {
          return this.$store.state.settings.notePaneSortBy || 'Modified'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'notePaneSortBy',
            val: val
          }])
        }
      },
      tagSortDir: {
        get () {
          return this.$store.state.settings.notePaneSortDir || 'Desc'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'notePaneSortDir',
            val: val
          }])
        }
      },
      activeNoteId () {
        return this.$store.state.mainWindow.activeNoteId
      },
      searchMode () {
        return this.$store.state.mainWindow.searchMode
      },
      sortedNotes () {
        let notes = this.notes
        notes.sort((a, b) => {
          let first, second
          if (this.tagSort === 'Modified') {
            first = moment(a.metadata.modified)
            second = moment(b.metadata.modified)
          } else {
            first = a.metadata.title.toLowerCase()
            second = b.metadata.title.toLowerCase()
          }
          return (first < second) ? -1 : (first > second) ? 1 : 0
        })
        if (this.tagSortDir === 'Desc') {
          notes.reverse()
        }
        return notes
      },
      selectedNoteIds: {
        get () {
          return this.$store.state.mainWindow.selectedNoteIds
        },
        set (val) {
          this.$store.dispatch('updateSelectedNoteIds', val)
        }
      },
      notePaneListType () {
        return this.$store.state.settings.notePaneListType
      }
    },
    methods: {
      toggleSort () {
        switch (this.tagSort) {
          case 'A-Z':
            this.tagSort = 'Modified'
            break
          case 'Modified':
            this.tagSort = 'A-Z'
            break
        }
        this.$store.dispatch('updateSettings', [{
          key: 'notePaneSortBy',
          val: this.tagSort
        }])
      },
      toggleSortDir () {
        switch (this.tagSortDir) {
          case 'Asc':
            this.tagSortDir = 'Desc'
            break
          case 'Desc':
            this.tagSortDir = 'Asc'
            break
        }
        this.$store.dispatch('updateSettings', [{
          key: 'notePaneSortDir',
          val: this.tagSortDir
        }])
      },
      scrollUp (event) {
        let target = event === undefined ? document.activeElement : event.target
        if (target.classList.contains('note-item')) {
          if (target.previousElementSibling === null) return
          target.previousElementSibling.focus()
        } else {
          target = document.getElementById('note-list').lastChild
          if (target) target.focus()
        }
      },
      scrollDown (event) {
        let target = event === undefined ? document.activeElement : event.target
        if (target.classList.contains('note-item')) {
          if (target.nextElementSibling === null) return
          target.nextElementSibling.focus()
        } else {
          target = document.getElementById('note-list').firstChild
          if (target) target.focus()
        }
      },
      scrollFirst (event) {
        let target = document.getElementById('note-list').firstChild
        if (target) target.focus()
      },
      scrollLast (event) {
        let target = document.getElementById('note-list').lastChild
        if (target) target.focus()
      },
      clearSearch () {
        this.$store.dispatch('disableSearchMode')
      }
    },
    watch: {
      // activeNoteId (val) {
      //   if (val === null || typeof val === 'undefined' || !val) return
      //   this.$nextTick(function () {
      //     const target = document.getElementById(val)
      //     if (target != null && target) target.focus()
      //   })
      // }
    }
  }
</script>
<style lang="scss" scoped>
  @import "../../../variables.scss";
  * {
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
  }
  .hidden {
    visibility: hidden;
  }
  article {
    cursor: pointer;
  }
  .menu-label {
    cursor: default;
    overflow: hidden;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    color: $text;
  }
  .sort {
    margin-left: 5px;
    cursor: pointer;
  }
  .sort:hover {
    color: $hover-highlight;
  }
  .sort:active {
    position: relative;
    top: 2px;
    left: -2px;
  }
  .note-header {
    margin-bottom: 10px;
  }
  .search-mode-clear {
    cursor: pointer;
  }
  .search-mode-clear:hover {
    color: $hover-highlight;
  }
</style>
