<style scoped lang="scss">
.editor-window {
  margin: 0;
  padding: 10px;
}
</style>

<template>
  <div class='editor-window'>
    <toolbar></toolbar>
    <editors></editors>
  </div>
</template>

<script>
import Editors from './MainWindow/Editors'
import Toolbar from './Editor/Toolbar'
export default {
  name: 'editor',
  components: {
    Editors,
    Toolbar
  },
  computed: {
  }
}
</script>
