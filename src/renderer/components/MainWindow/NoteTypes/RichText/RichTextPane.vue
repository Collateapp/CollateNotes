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
import Editor from './RichTextEditor'
import SaveBar from '../Shared/SaveBar'
export default {
  name: 'rich-text-pane',
  components: {
    NoteTitle,
    Editor,
    SaveBar
  }
}
</script>
