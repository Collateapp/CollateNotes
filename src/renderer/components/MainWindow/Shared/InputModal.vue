<style scoped lang="scss">
  @import "../../../variables.scss";
  .label {
    color: $text-dark;
  }
  .submit {
    margin-left: 10px
  }
</style>

<template>
  <div class="modal is-active" @keyup.esc="inputModalDeactivate">
    <div class="modal-background"></div>
      <div class="modal-content">
        <label class="label">{{settings.name}}</label>
        <p class="field is-grouped">
          <input class="input" type="text"
            :placeholder="settings.placeholder"
            ref="modalInput"
            @keyup.prevent.enter="buttonAction"
            @keyup.prevent.esc="inputModalDeactivate"
          >
          <a
            class="button is-info submit"
            :class="[loading ? 'is-loading' : '']"
            @click.prevent="buttonAction"
          >{{settings.buttonText}}</a>
        </p>
      </div>
    <button class="modal-close" @click.prevent='inputModalDeactivate'></button>
  </div>
</template>

<script>
import log from 'electron-log'
export default {
  name: 'input-modal',
  data () {
    return {
      loading: false
    }
  },
  created () {
    this.$nextTick(() => {
      this.$refs.modalInput.value = this.settings.value
      this.$refs.modalInput.focus()
      this.$refs.modalInput.select()
    })
  },
  computed: {
    settings () {
      return this.$store.state.mainWindow.inputModalSettings
    }
  },
  methods: {
    inputModalDeactivate () {
      this.$store.dispatch('inputModalDeactivate')
    },
    buttonAction () {
      this.loading = true
      let action = this.$store.state.mainWindow.inputModalSettings.buttonAction
      this[action]()
    },
    newNotebook () {
      let name = this.$refs.modalInput.value
      this.$store.dispatch('newNotebook', name)
      this.inputModalDeactivate()
    },
    renameNotebook () {
      let name = this.$refs.modalInput.value
      setTimeout(() => {
        try {
          this.$store.dispatch('renameNotebook', {
            notebookId: window.collate.notebookMenuTarget,
            newName: name
          })
          this.loading = false
          this.inputModalDeactivate()
          this.$store.dispatch('reloadNotebooks')
        } catch (e) {
          log.error('Error occurred renaming notebook')
          this.loading = false
        }
      }, 0)
    }
  }
}
</script>
