<style scoped lang="scss">
  @import "../../../variables.scss";
  #search-bar {
    width: 350px;
  }
  .search-mode {
    border: 2px solid $search-mode;
  }
  .enter-icon,
  .clear-icon {
    color: $primary;
  }
  .clear-icon {
    cursor: pointer;
  }
  .clear-icon:hover {
    color: $info;
  }
</style>

<template>
  <div class="field has-addons">
    <p class="control has-icon has-icon-right">
      <input
        id="search-bar"
        class="input"
        type="text"
        :placeholder="[genSearchIndex ? 'Generating search index...' : 'Search']"
        v-model="queryString"
        @click="selectAll"
        @keydown.prevent.esc="clear"
        @keydown.prevent.enter="submitSearch"
        @contextmenu.prevent="context"
        ref="searchBar"
        tabindex="-1"
        title="Search notes"
      >
      <span class="icon is-small">
        <i v-if="genSearchIndex" class="fa fa-spinner fa-pulse fa-3x fa-fw" title="Generating search index. Please wait."></i>
        <i v-else class="fa fa-search"></i>
      </span>
    </p>
    <p class="control">
      <a
        title="Clear search mode and return to previous state."
        class="button is-inverted is-danger"
        v-if="searchMode"
        @click="clear"
      >
        Clear
      </a>
      <a
        title="Search notes"
        class="button is-outlined"
        v-else
        @click="submitSearch"
      >
        Search
      </a>
    </p>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import log from 'electron-log'
  export default {
    name: 'search-bar',
    computed: {
      searchMode () {
        return this.$store.state.mainWindow.searchMode
      },
      queryString: {
        get () {
          return this.$store.state.mainWindow.searchQuery
        },
        set (val) {
          if (val.length === 0) {
            this.clear()
          }
        }
      },
      genSearchIndex () {
        return this.$store.state.mainWindow.genSearchIndex
      }
    },
    mounted () {
      ipcRenderer.removeAllListeners('keyboardShortcutSearchNotes')
      ipcRenderer.on('keyboardShortcutSearchNotes', (event) => {
        this.$refs.searchBar.focus()
      })
    },
    methods: {
      submitSearch () {
        if (!this.$refs.searchBar.value) return
        this.$store.dispatch('updateSearchQuery', this.$refs.searchBar.value)
      },
      selectAll () {
        this.$refs.searchBar.select()
      },
      clear () {
        if (this.queryString.length === 0) {
          this.$refs.searchBar.value = ''
          return
        }
        this.$store.dispatch('updateSearchQuery', '')
      },
      context () {
        try {
          window.collate.editMenu.popup()
        } catch (e) {
          log.info('Error occurred while opening popup menu (window out of focus)')
        }
      }
    },
    watch: {
      searchFocus: function (val) {
        if (val) {
          this.$refs.searchBar.focus()
        }
      }
    }
  }
</script>
