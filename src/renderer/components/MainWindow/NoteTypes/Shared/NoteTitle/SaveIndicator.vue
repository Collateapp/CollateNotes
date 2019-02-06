<template>
  <p class="control">
    <a class="button">
      <span class="icon is-small">
        <i class="fa fa-floppy-o" :class="[status ? 'saved' : 'unsaved']"></i>
      </span>
    </a>
  </p>
</template>

<script>
export default {
  name: 'save-status',
  computed: {
    status () {
      return this.$store.state.mainWindow.editorSaveStatus
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../variables.scss";

.button {
  cursor: default;
}
.button:hover {
  border-color: #d9d9d9;
  color: #363636;
}
.unsaved {
  color: $red;
}
.saved {
  color: $green;
}
</style>
