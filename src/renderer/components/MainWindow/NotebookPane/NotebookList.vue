<template>
  <aside class="menu">
    <p class="menu-label">
      <span>Notebooks</span>
      <span class="is-pulled-right">
        <span
          title="Sort by last modified, alphabetical, or number of notes"
          class="sort"
          @click="toggleSort"
        >{{tagSort}}</span>
        <span
          title="Sort ascending or descending"
          class="sort"
          @click="toggleSortDir"
        >{{tagSortDir}}</span>
      </span>
    </p>

  <ul
    class="menu-list"
    id="notebook-list"
    >
    <template v-for="notebook in notebooks">
        <li
          class="notebook-item"
          :class="[defaultNotebookId === notebook.id ? 'default-notebook ' : '']"
          :title="[defaultNotebookId === notebook.id ? 'Default Notebook' : '']"
          ref="notebookList"
          :key="notebook.id"
          :id="notebook.id"
          @click.prevent="click(notebook.id)"
          @contextmenu.prevent="context(notebook.id)"
          @keydown.prevent.enter="click(notebook.id)"
          @keydown.prevent.space="click(notebook.id)"
          tabindex="1"
          >
          <a :class="[activeKey === notebook.id ? 'is-active' : '']">
           <span class="notebook-name">
             {{notebook.displayName}}
           </span>
           <span class="notebook-count">
             {{notebook.notes.length}}
           </span>
          </a>

        </li>
      </template>
    </ul>
  </aside>
</template>

<script>
  import log from 'electron-log'
  import moment from 'moment'
  export default {
    name: 'notebook-list',
    computed: {
      tagSort: {
        get () {
          return this.$store.state.settings.notebookPaneSortBy || 'Mod'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'notebookPaneSortBy',
            val: val
          }])
        }
      },
      tagSortDir: {
        get () {
          return this.$store.state.settings.notebookPaneSortDir || 'Asc'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'notebookPaneSortDir',
            val: val
          }])
        }
      },
      notebooks () {
        let notebooks = this.$store.state.mainWindow.notebooks
        notebooks.sort((a, b) => {
          let first, second
          if (this.tagSort === 'Num') {
            first = a.notes.length
            second = b.notes.length
          } else if (this.tagSort === 'Modified') {
            first = moment(a.metadata.modified)
            second = moment(b.metadata.modified)
          } else {
            first = a.displayName.toLowerCase()
            second = b.displayName.toLowerCase()
          }
          return (first < second) ? -1 : (first > second) ? 1 : 0
        })
        if (this.tagSortDir === 'Desc') {
          notebooks.reverse()
        }
        // Make default notebook first item
        if (this.defaultNotebookId) {
          for (let i = 0; i < notebooks.length; i++) {
            if (notebooks[i].id === this.$store.state.settings.defaultNotebookId) {
              notebooks.splice(0, 0, notebooks.splice(i, 1)[0])
              break
            }
          }
        }
        return notebooks
      },
      activeKey () {
        return this.$store.state.mainWindow.activeNotebookId
      },
      defaultNotebookId () {
        return this.$store.state.settings.defaultNotebookId[this.$store.state.mainWindow.activeCollectionId]
      }
    },
    methods: {
      click (key) {
        this.$store.dispatch('clickNotebook', key)
      },
      context (key) {
        try {
          window.collate.notebookMenuTarget = key
          if (window.collate.hasOwnProperty('notebookMenu') && window.collate.notebookMenu) {
            window.collate.notebookMenu.popup()
          }
        } catch (e) {
          log.info('Error occurred while opening popup menu (window out of focus)')
        }
      },
      notebookLength (id) {
        return this.$store.state.mainWindow.notebookCounts[id]
      },
      toggleSort () {
        switch (this.tagSort) {
          case 'A-Z':
            this.tagSort = 'Num'
            break
          case 'Num':
            this.tagSort = 'Mod'
            break
          case 'Mod':
            this.tagSort = 'A-Z'
            break
        }
        this.$store.dispatch('updateSettings', [{
          key: 'notebookPaneSortBy',
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
          key: 'notebookPaneSortDir',
          val: this.tagSortDir
        }])
      }
    },
    watch: {
      activeKey (val) {
        if (val === null || typeof val === 'undefined' || !val) return
        this.$nextTick(function () {
          document.getElementById(val).focus()
        })
      },
      defaultNotebookId (val) {
        console.log('notebook Id Updated')
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../../../variables.scss";
  * {
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
  }
  ul {
    text-align: left;
  }
  li {
    list-style: none;
  }
  .notebook-item {
    margin-left: -5px;
    display: flex;
    justify-content: space-between;
  }
  .notebook-item a {
    white-space: nowrap;
    width: 100%;
    display: flex;
  }
  .notebook-count {
    margin-left: auto;
    align-self: flex-end;
  }
  .is-active .count {
    color: $hover-selected;
  }
  .menu-label {
    overflow: hidden;
    cursor: default;
  }
  .notebook-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sort {
    margin-left: 5px;
  }
  .sort:hover {
    color: $hover-highlight;
  }
  .sort:active {
    position: relative;
    top: 2px;
    left: 2px;
  }
  .menu-label {
    color: $text;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .default-notebook {
    margin-left: -12px;
    padding-left: 0;
    border-left: 6px solid $secondary;
  }
</style>
