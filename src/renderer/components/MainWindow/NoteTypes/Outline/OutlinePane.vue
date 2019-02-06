<style>

</style>

<template>
  <div>
    <note-title></note-title>
    <save-bar></save-bar>
    <editor></editor>
  </div>
</template>

<script>
import NoteTitle from '../Shared/NoteTitle'
import SaveBar from '../Shared/SaveBar'
import Editor from './OutlineEditor.vue'
export default {
  name: 'outline-pane',
  components: {
    Editor,
    NoteTitle,
    SaveBar
  }
}
</script>
