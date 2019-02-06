<template>
    <div class="card input-dropdown" v-on-clickaway="deactivate">
      <header class="card-header">
        <p class="card-header-title">
          Move Notebook
        </p>
        <a class="card-header-icon">
          <span class="icon" @click.prevent='deactivate'>
            <i class="fa fa-times-circle"></i>
          </span>
        </a>
      </header>
      <div class="card-content">
        <div class="content">
          <span class="select is-fullwidth notebook-select">
            <select
              ref="notebookInputSelect"
              title="Select notebook to move current note into"
              @keyup.prevent.esc="deactivate"
            >
              <option
                v-for="notebook in notebooks"
                :key="notebook.id"
                :value="notebook.id"
                :selected="activeNotebook === notebook.id ? true : false"
              >
                {{notebook.displayName}}
              </option>
            </select>
          </span>
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" @click.prevent="changeNotebook">Move</a>
        <a class="card-footer-item" @click.prevent='deactivate'>Cancel</a>
      </footer>
    </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
export default {
  name: 'move-notebook-dropdown',
  mixins: [
    clickaway
  ],
  computed: {
    notebooks () {
      return this.$store.state.mainWindow.notebooks
    },
    activeNotebook () {
      return this.$store.state.mainWindow.activeNotebookId
    }
  },
  methods: {
    deactivate () {
      this.$store.dispatch('moveNotebookDropdown', false)
    },
    changeNotebook () {
      let targetNoteId = window.collate.moveNoteId
      if (Array.isArray(targetNoteId)) {
        for (let noteId of targetNoteId) {
          let destNotebookId = this.$refs.notebookInputSelect.value
          this.$store.dispatch('moveNote', {
            noteId: noteId,
            targetNotebookId: destNotebookId
          })
        }
      } else {
        let destNotebookId = this.$refs.notebookInputSelect.value
        this.$store.dispatch('moveNote', {
          noteId: targetNoteId,
          targetNotebookId: destNotebookId
        })
      }
      this.deactivate()
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../../variables.scss";

  .card-header {
    background-color: $primary;
  }

  .card-header-title {
    color: $white;
  }

  .fa {
    color: $white;
  }

  .input-dropdown {
    position: fixed;
    top: 60px;
    left: 50%;
    z-index: 999;
    width: 400px;
    margin-left: -200px;
  }

</style>
