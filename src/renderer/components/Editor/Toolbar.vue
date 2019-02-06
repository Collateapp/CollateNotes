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

  .notebook-select {
    width: 100%;
  }
  .drop-btn {
    margin-left: 0 !important;
  }
  .nav-path {
    color: $text-dark;
    font-size: 14pt;
    display: flex;
    align-items: center;
  }
  .slash {
    margin: 0 5px 0 5px;
  }
</style>

<template>
  <nav class="nav">

    <div class="nav-left">
      <span class="nav-item">
        <p class="nav-path">
          <span title="Notebook Name">{{activeNotebookTitle}}</span>
          <span class="slash">/</span>
          <span title="Note Name">{{activeNoteTitle}}</span>
        </p>
      </span>
    </div>

  </nav>
</template>

<script>
// import electron from 'electron'
export default {
  name: 'editor-toolbar',
  computed: {
    activeNotebookTitle () {
      let notebookId = this.$store.state.mainWindow.activeNotebookId
      let notebook = window.collate.collection.getId(notebookId)
      return notebook.displayName
    },
    activeNoteTitle () {
      return this.$store.state.mainWindow.activeNote.metadata.title
    }
  }
}
</script>
