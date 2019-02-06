<style scoped lang="scss">
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
  .tag-item {
    margin-left: -5px;
    display: flex;
    justify-content: space-between;
  }
  .tag-item a {
    white-space: nowrap;
    width: 100%;
    display: flex;
  }
  .tag-count {
    margin-left: auto;
  }
  .is-active {
    color: $hover-selected;
  }
  .menu-label {
    cursor: default;
  }
  .tag-name {
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
  }
</style>

<template>
  <aside class="menu">
    <p class="menu-label">
      Tags
      <span
        title="Sort ascending or descending"
        class="is-pulled-right sort"
        @click="toggleSortDir"
      >{{tagSortDir}}</span>
      <span
        title="Sort by alphabetical, or number of tags"
        class="is-pulled-right sort"
        @click="toggleSort"
      >{{tagSort}}</span>
    </p>

  <ul
    id="tag-list"
    class="menu-list"
    >
    <template  v-for="tag in sortTags(tags)" >
        <li
          class="tag-item"
          @click.prevent="populateNotePane(tag.tag)"
          @keydown.prevent.enter="populateNotePane(tag.tag)"
          @keydown.prevent.space="populateNotePane(tag.tag)"
          :key="tag.tag"
          :id="tag.tag"
          tabindex="1"
          >
          <a :class="[activeKey === tag.tag ? 'is-active' : '']">
            <span class="tag-name">{{tag.tag}}</span> <span class="tag-count">{{tag.notes.length}}</span>
          </a>
        </li>
      </template>
    </ul>
  </aside>
</template>

<script>
  import moment from 'moment'
  export default {
    name: 'notebook-list',
    computed: {
      tagSort: {
        get () {
          return this.$store.state.settings.tagPaneSortBy || 'Num'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'tagPaneSortBy',
            val: val
          }])
        }
      },
      tagSortDir: {
        get () {
          return this.$store.state.settings.tagPaneSortDir || 'Desc'
        },
        set (val) {
          this.$store.dispatch('updateSettings', [{
            key: 'tagPaneSortDir',
            val: val
          }])
        }
      },
      tags () {
        return this.$store.state.mainWindow.tags
      },
      activeKey () {
        return this.$store.state.mainWindow.activeTagId
      }
    },
    methods: {
      sortTags (tags) {
        let sorted = []
        for (let tag in tags) {
          sorted.push({
            tag: tag,
            notes: tags[tag]
          })
        }
        sorted.sort((a, b) => {
          let first, second
          if (this.tagSort === 'Num') {
            first = moment(a.notes.length)
            second = moment(b.notes.length)
          } else {
            first = a.tag.toLowerCase()
            second = b.tag.toLowerCase()
          }
          return (first < second) ? -1 : (first > second) ? 1 : 0
        })
        if (this.tagSortDir === 'Desc') {
          sorted.reverse()
        }
        return sorted
      },
      populateNotePane (key) {
        this.$store.dispatch('clickTag', key)
      },
      toggleSort () {
        switch (this.tagSort) {
          case 'A-Z':
            this.tagSort = 'Num'
            break
          case 'Num':
            this.tagSort = 'A-Z'
            break
        }
        this.$store.dispatch('updateSettings', [{
          key: 'tagPaneSortBy',
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
          key: 'tagPaneSortDir',
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
      }
    }
  }
</script>
