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
import Editor from './Clipper.vue'
export default {
  name: 'clipper-pane',
  components: {
    Editor,
    NoteTitle,
    SaveBar
  }
}
</script>
