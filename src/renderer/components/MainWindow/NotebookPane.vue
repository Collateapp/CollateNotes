<template>
  <div
    @keydown.prevent.up="scrollUp"
    @keydown.prevent.down="scrollDown"
  >
    <notebook-list class="list"></notebook-list>
    <tag-list></tag-list>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'
  import NotebookList from './NotebookPane/NotebookList'
  import TagList from './NotebookPane/TagList'

  export default {
    components: {
      NotebookList,
      TagList
    },
    mounted () {
      ipcRenderer.removeAllListeners('keyboardShortcutNotebook')
      ipcRenderer.on('keyboardShortcutNotebook', (event, msg) => {
        switch (msg) {
          case 'notebookPaneUp':
            this.scrollUp()
            break
          case 'notebookPaneDown':
            this.scrollDown()
            break
        }
      })
    },
    methods: {
      scrollUp (event) {
        let target = event === undefined ? document.activeElement : event.target
        if (target.classList.contains('notebook-item') || target.classList.contains('tag-item')) {
          if (target.previousElementSibling === null) {
            // As scrolling up, if we hit a null, check if we're currently in the
            // notebook list or tag list.
            if (target.classList.contains('notebook-item')) {
              target = document.getElementById('tag-list').lastChild
            } else {
              target = document.getElementById('notebook-list').lastChild
            }
            if (target) target.focus()
          } else {
            target.previousElementSibling.focus()
          }
        } else {
          target = document.getElementById('tag-list').lastChild
          if (target) target.focus()
        }
      },
      scrollDown (event) {
        let target = event === undefined ? document.activeElement : event.target
        if (target.classList.contains('notebook-item') || target.classList.contains('tag-item')) {
          if (target.nextElementSibling === null) {
            // As scrolling up, if we hit a null, check if we're currently in the
            // notebook list or tag list.
            if (target.classList.contains('notebook-item')) {
              target = document.getElementById('tag-list').firstChild
            } else {
              target = document.getElementById('notebook-list').firstChild
            }
            if (target) target.focus()
          } else {
            target.nextElementSibling.focus()
          }
        } else {
          target = document.getElementById('notebook-list').firstChild
          if (target) target.focus()
        }
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../../variables.scss";
   div {
     overflow-y: auto;
   }
   .list {
     margin-bottom: 10px
   }
</style>
