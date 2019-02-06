<style scoped lang="scss">
  @import "../../../../variables.scss";
  .top-bar {
    width: 100%;
    padding: 0;
    margin: 2px 1px 2px 1px;
    display: inline-flex;
  }
  .dates {
    margin-right: auto;
  }
  .created,
  .modified {
    font-size: 10pt !important;
    color: $grey;
    cursor: default;
    transition: .25s ease-in-out;
  }
  .top-bar:hover {
    .created,
    .modified {
      color: $text;
    }
    .save-state i {
      opacity: 1;
    }
  }
  .modified {
    margin-left: 20px;
  }
  .save-state {
    i {
      padding: 0;
      margin: 0;
      font-size: 12pt;
      transition: 0.25s ease-in-out;
      cursor: pointer;
      vertical-align: center;
      margin-top: 3px;
      opacity: 0.4;
    }
  }
  .saved {
    color: $success;
  }
  .unsaved {
    color: $danger;
  }
  .save-state:active {
    position: relative;
    top: 1px;
    left: 1px;
  }
</style>

<template>
  <div class="top-bar">
    <span class="dates">
      <span class='created' title="Date created">Created: {{getCreatedDate}}</span>
      <span class='modified' title="Last modified">Modified: {{getModifiedDate}}</span>
    </span>
    <span class='save-state' title="Save status" @click="save">
      <i class="fa fa-floppy-o" aria-hidden="true" :class="[getSaveStatus ? 'saved' : 'unsaved']"></i>
    </span>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  name: 'save-bar',
  computed: {
    getCreatedDate () {
      const date = this.$store.state.mainWindow.activeNote.metadata.created
      return moment(date).format('LLL')
    },
    getModifiedDate () {
      const date = this.$store.state.mainWindow.activeNote.metadata.modified
      return moment(date).format('LLL')
    },
    getSaveStatus () {
      let status = this.$store.state.mainWindow.editorSaveStatus
      if (status) {
        return true
      } else {
        return false
      }
    }
  },
  methods: {
    save () {
      this.$store.dispatch('saveNote')
    }
  }
}
</script>
