<style scoped lang="scss">
@import "../../variables.scss";
.note-pane {
  overflow-y: auto;
  overflow-x: hidden;
  border-left: 1px solid $border-color;
  border-right: 1px solid $border-color;
}
.additional-notes {
  margin-top: 20px;
}
</style>

<template>
  <div
    class="note-pane"
    :class="[searchMode ? 'search-mode' : '']"
  >
    <note-list
      :notes="notes"
    >
    </note-list>
  </div>
</template>

<script>
  import NoteList from './NotePane/NoteList'
  export default {
    components: {
      NoteList
    },
    computed: {
      notes () {
        return this.$store.state.mainWindow.notes
      },
      searchMode () {
        return this.$store.state.mainWindow.searchMode
      }
    }
  }
</script>
