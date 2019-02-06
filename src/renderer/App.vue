<template>
  <div class="app-window">
    <router-view></router-view>
  </div>
</template>

<script>
  import {ipcRenderer, remote} from 'electron'
  import path from 'path'
  import fs from 'fs-extra'
  import searchInPage from 'electron-in-page-search'
  import log from 'electron-log'

  export default {
    created () {
      setTimeout(() => {
        ipcRenderer.send('checkMode')
        ipcRenderer.send('registerShortcuts')
        ipcRenderer.on('checkMode', (event, payload) => {
          log.info('Checkmode returned ', payload)
          this.$store.dispatch('updateMode', payload)
        })

        log.info('Initializing renderer')
        let initWindow = remote.getCurrentWindow().init

        switch (initWindow.type) {
          case 'about':
            this.$router.push('/about')
            this.$store.dispatch('initProgram', {context: 'main'})
            this.$store.dispatch('updateWindowType', 'main')
            break
          case 'settings':
            this.$router.push('/settings')
            this.$store.dispatch('initProgram', {context: 'main'})
            this.$store.dispatch('updateWindowType', 'main')
            break
          case 'import':
            this.$router.push('/import')
            this.$store.dispatch('initProgram', {context: 'main'})
            this.$store.dispatch('updateWindowType', 'main')
            break
          case 'main':
            this.$store.dispatch('initProgram', {context: 'main'})
            this.$store.dispatch('updateWindowType', 'main')
            log.debug('Initializing main')
            break
          case 'editor':
            this.$store.dispatch('initProgram', {context: 'editor', collectionId: initWindow.collection.id})
            log.debug('Initializing editor')
            if (initWindow != null && initWindow.notebookId && initWindow.noteId) {
              // Immediately commit to set up notebook and notes
              this.$store.commit('SET_ACTIVE_NOTEBOOK_ID', initWindow.notebookId)
              this.$store.commit('SET_ACTIVE_NOTE_ID', initWindow.noteId)
              this.$store.commit('SET_ACTIVE_NOTE', window.collate.collection.getId(initWindow.noteId))
              this.$store.commit('SET_EDITOR_VISIBLE', true)
            }
            this.$router.push('/editor')
            this.$store.dispatch('updateWindowType', 'editor')
            break
          case 'print':
            log.debug('Initializing print window')
            this.$store.commit('SET_PRINT_HTML', initWindow.html)
            this.$store.commit('SET_ACTIVE_NOTE', initWindow.activeNote)
            this.$router.push('/print')
            this.$store.dispatch('updateWindowType', 'print')
            break
          default:
            // If no signals recieved, initialize after x seconds.
            setTimeout(() => {
              this.$store.dispatch('initProgram', {context: 'main'})
            }, 1500)
        }

        // Register event handlers for toolbar events and keyboard shortcuts
        ipcRenderer.on('settings', (event, arg) => {
          this.$router.push('/settings')
        })
        ipcRenderer.on('about', (event, arg) => {
          this.$router.push('/about')
        })
        ipcRenderer.on('import', (event, arg) => {
          this.$router.push('/import')
        })
        ipcRenderer.on('collectionPane', (event, arg) => {
          this.$store.dispatch('updateHideCollectionPane', !this.$store.state.mainWindow.hideCollectionPane)
        })
        ipcRenderer.on('newNote', (event, arg) => {
          let activeNotebook = this.$store.state.mainWindow.activeNotebookId
          let noteType = this.$store.state.settings.editorNewNoteType
          this.$store.dispatch('newNote', {notebookId: activeNotebook, type: noteType})
        })
        ipcRenderer.on('newNotebook', (event, arg) => {
          this.$store.dispatch('newNotebookDropdown', true)
        })
        ipcRenderer.on('save', (event) => {
          this.$store.dispatch('saveNote')
        })
        ipcRenderer.on('deleteNote', (event) => {
          let activeNoteId = this.$store.state.mainWindow.activeNoteId
          if (typeof activeNoteId === 'undefined' || !activeNoteId) {
            alert('Please select a notebook to ')
          } else {
            this.$store.dispatch('deleteNote', activeNoteId)
          }
        })
        ipcRenderer.on('deleteNotebook', (event, arg) => {
          let activeNotebookId = this.$store.state.mainWindow.activeNotebookId
          if (typeof activeNotebookId === 'undefined' || !activeNotebookId) {
            alert('Please select a notebook to ')
          } else {
            this.$store.dispatch('deleteNotebook', activeNotebookId)
          }
        })
        ipcRenderer.on('helpPane', (event, arg) => {
          this.$store.dispatch('updateHideHelpPane', arg)
        })
        // Ctrl f implementation
        window.collate.searchInWindow = searchInPage(remote.getCurrentWebContents(), {
          // openDevToolsOfSearchWindow: true
        })
        ipcRenderer.on('keyboardShortcutFindOnPage', (event) => {
          if (!window.collate.searchInWindow.opened) {
            window.collate.searchInWindow.openSearchWindow()
          } else {
            document.querySelector('.electron-in-page-search-window').focus()
          }
        })

        this.injectCustomCSS()

        log.info('Renderer initialized.')
      }, 5)
    },
    methods: {
      updateWindowSize () {
        let width = window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth
        let height = window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight
        if (this.$route.name === 'editor') {
          this.$store.dispatch('updateSettings', [
            {key: 'editorWinY', val: height},
            {key: 'editorWinX', val: width}
          ])
        } else if (this.$route.name === 'main-window') {
          this.$store.dispatch('updateSettings', [
            {key: 'winY', val: height},
            {key: 'winX', val: width}
          ])
        }
      },
      injectCustomCSS () {
        // Inject custom css file if available
        // CSS File is located in userData folder.
        const userDataPath = remote.require('electron').app.getPath('userData')
        const styleFile = path.join(userDataPath, 'style.css')
        fs.readFile(styleFile, function (err, contents) {
          if (err) {
            console.log('No css file found.')
            return
          }
          const head = document.head || document.getElementByTagName('head')[0]
          let style = document.createElement('style')
          style.type = 'text/css'
          if (style.styleSheet) {
            style.styleSheet.cssText = contents
          } else {
            style.appendChild(document.createTextNode(contents))
          }
          head.appendChild(style)
        })
      }
    },
    computed: {
      activeNote () {
        return this.$store.state.mainWindow.activeNote
      }
    },
    watch: {
      activeNote (val) {
        if (val.metadata != null && val.metadata.title != null && val.metadata.title) {
          document.title = val.metadata.title
        } else {
          document.title = 'Collate'
        }
      }
    }
  }
</script>

<style lang='scss'>
  /* Override Bulma theme defaults */
  @import "./variables.scss";

  @import "../../node_modules/bulma/bulma.sass";
  @import "../../node_modules/font-awesome/css/font-awesome.min.css";
  @import "../../node_modules/animate.css/animate.min.css";
  @import "../../node_modules/highlight.js/styles/tomorrow.css";

  * {
    margin: 0;
    padding: 0;
  }

  html,
  body {
    height: 100%;
    width: 100%;
    overflow: hidden;
    font: caption;
    font-size: 100%;
    line-height: 1.5;
    background-color: $white;
  }
  .message {
    background-color: inherit;
  }
  .main-window,
  .settings-window {
    width: 100%;
    height: 100%;
    margin: 0px;
  }
  .app-window {
    padding-top: 50px;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  /* Customize scrollbars */
  ::-webkit-scrollbar {
      width: 10px;
      height: 10px;
  }
  ::-webkit-scrollbar-track {
  }
  ::-webkit-scrollbar-thumb {
      background: rgba(237,237,251,0.8);
  }
  .electron-in-page-search-window {
    width: 300px;
    height: 33px;
    background-color: $body-background;
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 999;
  }
  .electron-in-page-search-window.search-inactive {
    visibility: hidden;
  }
  .electron-in-page-search-window.search-active {
    visibility: visible;
  }

</style>
