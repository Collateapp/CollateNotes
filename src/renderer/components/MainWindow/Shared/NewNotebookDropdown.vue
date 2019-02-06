<template>
    <div class="card input-dropdown" v-on-clickaway="deactivate">
      <header class="card-header">
        <p class="card-header-title">
          New Notebook
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
            v-model="notebookName"
            ref="modalInput"
            @keyup.prevent.enter="newNotebook"
            @keyup.prevent.esc="deactivate"
          >
        </div>
      </div>
      <footer class="card-footer">
        <a class="card-footer-item" @click.prevent="newNotebook">Save</a>
        <a class="card-footer-item" @click.prevent='deactivate'>Cancel</a>
      </footer>
    </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import sanitize from 'sanitize-filename'
export default {
  name: 'new-notebook-dropdown',
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
      this.$refs.modalInput.focus()
      this.$refs.modalInput.select()
    })
  },
  watch: {
    notebookName (val) {
      this.notebookName = val
    }
  },
  computed: {
    settings () {
      return this.$store.state.mainWindow.inputModalSettings
    }
  },
  methods: {
    deactivate () {
      this.$store.dispatch('newNotebookDropdown', false)
    },
    newNotebook () {
      this.notebookName = sanitize(this.notebookName)
      const name = this.notebookName
      this.$store.dispatch('newNotebook', name)
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
