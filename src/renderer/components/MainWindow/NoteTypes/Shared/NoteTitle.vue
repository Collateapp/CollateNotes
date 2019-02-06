<template>
  <div class="field is-grouped note-title">
    <title-bar></title-bar>
    <tag-dropdown></tag-dropdown>
    <attachment-dropdown></attachment-dropdown>
    <!-- <save-indicator></save-indicator> -->
    <options></options>

  </div>
</template>

<script>
  import TitleBar from './NoteTitle/TitleBar.vue'
  import TagDropdown from './NoteTitle/TagDropdown.vue'
  import AttachmentDropdown from './NoteTitle/AttachmentDropdown.vue'
  import Options from './NoteTitle/Options.vue'
  import SaveIndicator from './NoteTitle/SaveIndicator.vue'
  export default {
    name: 'note-title',
    components: {
      TitleBar,
      TagDropdown,
      AttachmentDropdown,
      Options,
      SaveIndicator
    }
  }
</script>


<style scoped lang="scss">
@import "../../../../variables.scss";
* {
  -webkit-user-select: none;
}
.note-title {
  margin: 10px 0 0 0;
}
</style>
