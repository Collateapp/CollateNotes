<template>
  <!-- Attach file button -->
  <p class="control"
    v-on-clickaway="closeAttachmentDropdown"
    >

    <a
      class="button"
      title="Attachments"
      @click="toggleAttachmentDropdown"
      @keydown.prevent.enter="toggleAttachmentDropdown"
      @keydown.prevent.space="toggleAttachmentDropdown"
      @keydown.prevent.esc="toggleAttachmentDropdown"
      tabindex="5"
    >
      <span class="icon is-small">
        <i class="fa fa-paperclip" aria-hidden="true"></i>
      </span>
      <span v-if="hasAttachments">
        <template v-if="attachments.length===1">1 File</template>
        <template v-else>{{attachments.length}} Files</template>
      </span>
    </a>

    <span class="box attachment-dropdown" v-if="attachmentDropdown">
      <aside class="menu">
        <ul class="menu-list">
          <p class="control">
            <button
              class="button is-fullwidth"
              @click="attachFile"
              @keydown.prevent.enter="attachFile"
              @keydown.prevent.space="attachFile"
              @keydown.prevent.esc="toggleAttachmentDropdown"
              tabindex="5"
            >
            <span class="icon is-small">
              <i class="fa fa-paperclip"></i>
            </span>
            <span>Attach a file</span>
            </button>
          </p>

          <template v-for="attachment in attachments">
            <li
              :key="attachment.id"
              title="Double click to open file or right click for more options"
              v-on:dblclick="openAttachment(attachment.path)"
              @contextmenu.prevent="attachmentContext(attachment.path)"
              tabindex="5"
              @keydown.prevent.esc="toggleAttachmentDropdown"
            >
              <a>{{attachment.name}}</a>
            </li>
          </template>
        </ul>
      </aside>
    </span>

  </p>
  <!-- End attach file button -->
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import electron from 'electron'
export default {
  name: 'attachment-dropdown',
  mixins: [
    clickaway
  ],
  data () {
    return {
      attachmentDropdown: false
    }
  },
  computed: {
    attachments () {
      return this.$store.state.mainWindow.activeNote.attachments
    },
    hasAttachments () {
      if (typeof this.attachments !== 'undefined') {
        return this.attachments.length > 0
      }
    }
  },
  methods: {
    attachFile () {
      let files = electron.remote.dialog.showOpenDialog({
        title: 'Attachments',
        buttonLabel: 'Attach',
        properties: ['openFile', 'multiSelections']
      })
      this.$store.dispatch('addAttachments', files)
    },
    toggleAttachmentDropdown () {
      this.attachmentDropdown = !this.attachmentDropdown
    },
    closeAttachmentDropdown () {
      this.attachmentDropdown = false
    },
    attachmentContext (path) {
      window.collate.attachmentMenuPath = path
      window.collate.attachmentMenuNoteId = this.$store.state.mainWindow.activeNoteId
      window.collate.attachmentMenu.popup()
    },
    openAttachment (path) {
      electron.shell.openItem(path)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../variables.scss";
.attachment-dropdown {
  position: absolute;
  background-color: $body-background;
  top: 35px;
  right: 0px;
  z-index: 9999;
  padding: 10px;
  width: 200px;
}
.attachment-dropdown li {
  list-style: none;
}
.attachment-dropdown li a {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
