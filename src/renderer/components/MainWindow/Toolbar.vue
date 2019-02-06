<template>
  <nav class="nav">

    <div class="nav-left">
      <div class="nav-item">
        <h1 class="title logo"
          @click.prevent="openCollectionPane"
        >
          {{activeCollectionName}}
        </h1>
      </div>
    </div>

    <div class="nav-right">

      <!-- <a class="nav-item">
        <div class="field">
          <p
            class="control"
            title="Collapse Panes"
            @click.prevent="collapse"
          >
            <a class="button">
              <span class="icon is-small">
                <i class="fa" :class="toolbarCollapseIcon"></i>
              </span>
            </a>
          </p>
        </div>
      </a> -->

      <a class="nav-item">
        <div class="field has-addons">
          <p
            class="control"
          >
            <a class="button"
              @click.prevent="newNote"
              title="Create a new note"
            >
              <span class="icon is-small">
                <i class="fa fa-plus"></i>
              </span>
              <span> {{newNoteButtonText}}</span>
            </a>
          </p>
          <p
            class="control"
            v-on-clickaway="closeNoteDropdown">
            <a
              class="button drop-btn"
              @click.prevent="toggleNoteType"
            >
              <span class="icon is-small">
                <i class="fa fa-caret-down"></i>
              </span>
            </a>
          </p>
          <!-- dropdown -->
          <span
            class="box note-type-dropdown"
            v-if="noteTypeToggle"
          >
            <aside class="menu">
              <ul class="menu-list">
                <li>
                  <a @click.prevent="updateNoteType('markdown')">
                    Markdown
                  </a>
                </li>
                <li>
                  <a @click.prevent="updateNoteType('richtext')">
                    Rich Text
                  </a>
                </li>
                <li>
                  <a @click.prevent="updateNoteType('clipper')">
                    Web Clipper
                  </a>
                </li>
                <li>
                  <a @click.prevent="updateNoteType('outline')">
                    Outline
                  </a>
                </li>
              </ul>
            </aside>
          </span>
          <!-- end dropdown -->
        </div>
      </a>

      <a class="nav-item">
        <search-bar></search-bar>
      </a>

    </div>

  </nav>
</template>

<script>
  import SearchBar from './Toolbar/SearchBar'
  import { mixin as clickaway } from 'vue-clickaway'
  export default {
    name: 'toolbar',
    components: {
      SearchBar
    },
    mixins: [
      clickaway
    ],
    data () {
      return {
        noteTypeToggle: false
      }
    },
    computed: {
      newNoteButtonText () {
        return this.$store.state.settings.editorNewNoteTypeButtonText || 'Markdown'
      },
      // toolbarCollapseIcon () {
      //   let notebookHidden = this.$store.state.mainWindow.hideNotebookPane
      //   let noteHidden = this.$store.state.mainWindow.hideNotePane
      //   if (!notebookHidden && !noteHidden) {
      //     return 'fa-angle-double-left'
      //   } else if (notebookHidden && !noteHidden) {
      //     return 'fa-angle-left'
      //   } else if (notebookHidden && noteHidden) {
      //     return 'fa-undo'
      //   } else {
      //     return 'fa-angle-double-left'
      //   }
      // },
      activeCollectionId () {
        return this.$store.state.mainWindow.activeCollectionId
      },
      activeCollectionName () {
        if (this.activeCollectionId != null && this.activeCollectionId) {
          for (let collection of this.$store.state.mainWindow.collections) {
            if (collection.id === this.activeCollectionId) {
              return collection.name
            }
          }
        }

        return 'Collate'
      }
    },
    methods: {
      updateNoteType (type) {
        this.$store.dispatch('updateNoteType', type)
        this.closeNoteDropdown()
      },
      toggleNoteType () {
        this.noteTypeToggle = !this.noteTypeToggle
      },
      closeNoteDropdown () {
        this.noteTypeToggle = false
      },
      newNote () {
        if (this.$store.state.mainWindow.searchMode) {
          this.$store.dispatch('disableSearchMode')
        }
        let activeNotebook = this.$store.state.mainWindow.activeNotebookId
        let noteType = this.$store.state.settings.editorNewNoteType
        this.$store.dispatch('newNote', {notebookId: activeNotebook, type: noteType})
      },
      openCollectionPane () {
        this.$store.dispatch('updateHideCollectionPane', false)
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../../variables.scss";
  * {
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
  }
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: $primary;
  }
  .logo {
    color: $text-dark;
    cursor: pointer;
    &:hover {
      position: relative;
      top: 1px;
      left: 1px;
    }
    &:active {
      position: relative;
      top: 2px;
      left: 2px;
    }
  }
  .mode {
    color: $text;
  }
  .drop-btn {
    margin-left: 0 !important;
  }
  .note-type-dropdown {
    position: absolute;
    background-color: $body-background;
    top: 45px;
    right: 450px;
    z-index: 100;
    padding: 10px;
    width: 125px;
  }
  .note-type-dropdown li {
    list-style: none;
  }
  .menu-list {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;
  }
  .menu-list li {
    width: 100%;
    text-align: left;
  }
  .nav-right {
    flex-grow: 3 !important;
    overflow: hidden;
  }
  .nav-left {
    overflow: inherit;
  }
</style>
