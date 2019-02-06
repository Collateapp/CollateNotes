<template>
  <div class="drop-wrapper"
    v-if="dropEnabled"
    @drop.prevent.stop="attachFile($event)"
  >
    <div class="drop-target">
      <h1 class="title">{{dropMsg}}</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'drop-target',
  created () {
    // Register event listeners
    let timer
    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      if (timer) { clearTimeout(timer) }
      if (!this.noteActive) return
      this.dropEnabled = true
      e.dataTransfer.dropEffect = 'copy'
      timer = setTimeout(() => {
        this.dropEnabled = false
      }, 500)
    })
  },
  data () {
    return {
      dropEnabled: false
    }
  },
  computed: {
    dropMsg () {
      if (this.noteActive) {
        return 'Drop to attach to ' + this.activeNote.metadata.title
      }
    },
    noteActive () {
      if (this.activeNote != null && Object.keys(this.activeNote).length !== 0 && this.activeNote.constructor === Object) return true
      return false
    },
    activeNote () {
      return this.$store.state.mainWindow.activeNote
    },
    activeNoteType () {
      const type = this.$store.state.settings.editorNewNoteType
      return type.charAt(0).toUpperCase() + type.slice(1)
    }
  },
  methods: {
    attachFile (e) {
      const activeNoteId = this.$store.state.mainWindow.activeNoteId
      for (let file of e.dataTransfer.files) {
        window.collate.collection.addAttachmentToNote(activeNoteId, file.path)
      }
    }
  }
}
</script>

<style lang="scss">
@import "../../variables.scss";
.drop-wrapper {
  display: flex;
  position: fixed;
  z-index: 99;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: $black;
  opacity: 0.7;
  transition: opacity .25s ease-in-out;

  .drop-target {
    width: 70%;
    height: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    h1 {
      font-size: 32pt;
      color: $white;
    }
  }
}

</style>
