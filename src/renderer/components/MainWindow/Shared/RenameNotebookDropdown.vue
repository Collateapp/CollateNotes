<template>
    <div class="card input-dropdown" v-on-clickaway="deactivate">
      <header class="card-header">
        <p class="card-header-title">
          Rename Notebook
        </p>
        <a class="card-header-icon">
          <span class="icon" @click.prevent='deactivate'>
            <i class="fa fa-times-circle"></i>
          </span>
        </a>
      </header>
      <div class="card-content">
        <div class="content">
          <input class="input" type="text"
            placeholder="Notebook Name"
            ref="modalInput"
            @keyup.prevent.enter="renameNotebook"
            @keyup.prevent.esc="deactivate"
          >
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" @click.prevent="renameNotebook">Save</a>
        <a class="card-footer-item" @click.prevent='deactivate'>Cancel</a>
      </footer>
    </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import log from 'electron-log'
import sanitize from 'sanitize-filename'
export default {
  name: 'rename-notebook-dropdown',
  mixins: [
    clickaway
  ],
  data () {
    return {
      loading: false,
      notebookName: ''
    }
  },
  created () {
    this.$nextTick(() => {
      this.$refs.modalInput.value = window.collate.collection.notebooks[window.collate.notebookMenuTarget].displayName
      this.$refs.modalInput.focus()
      this.$refs.modalInput.select()
    })
  },
  watch: {
    notebookName (val) {
      this.notebookName = sanitize(val)
    }
  },
  computed: {
    settings () {
      return this.$store.state.mainWindow.inputModalSettings
    }
  },
  methods: {
    deactivate () {
      this.$store.dispatch('renameNotebookDropdown', false)
    },
    renameNotebook () {
      let name = sanitize(this.$refs.modalInput.value)
      setTimeout(() => {
        try {
          this.$store.dispatch('renameNotebook', {
            notebookId: window.collate.notebookMenuTarget,
            newName: name
          })
          this.loading = false
          this.deactivate()
        } catch (e) {
          log.error('Error occurred renaming notebook')
          this.loading = false
        }
        this.deactivate()
      }, 0)
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
