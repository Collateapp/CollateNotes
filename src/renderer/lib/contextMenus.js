import electron from 'electron'
import fileUrl from './fileUrl.js'

/**
 * Helper method to determine what text to add to context menu.
 */
function getFileBrowser () {
  let platform
  switch (process.platform) {
    case 'darwin':
      platform = 'Finder'
      break
    case 'win32':
      platform = 'Explorer'
      break
    default:
      platform = 'File Browser'
  }
  return platform
}

// Check if a path is a valid image file
function isImage (path) {
  let validEndings = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
    '.tiff',
    '.ico',
    '.bmp'
  ]
  path = path.toLowerCase()
  for (let ending of validEndings) {
    if (path.endsWith(ending)) {
      return true
    }
  }
  return false
}

(function initContextMenus () {
  if (typeof window === 'undefined') { return false }
  if (typeof window.collate === 'undefined') { window.collate = {} }

  // Edit menu for text editing
  window.collate.editMenu = new electron.remote.Menu()
  window.collate.editMenu.append(new electron.remote.MenuItem({role: 'cut'}))
  window.collate.editMenu.append(new electron.remote.MenuItem({role: 'copy'}))
  window.collate.editMenu.append(new electron.remote.MenuItem({role: 'paste'}))
  window.collate.editMenu.append(new electron.remote.MenuItem({role: 'pasteandmatchstyle'}))

  // Context menu for notebook pane
  window.collate.notebookMenu = new electron.remote.Menu()
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    label: 'New Notebook',
    click (menuItem, browserWindow, event) {
      window.collate.vue.$store.dispatch('newNotebookDropdown', true)
    }
  }))
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    label: 'Set as Default',
    click (menuItem, browserWindow, event) {
      window.collate.vue.$store.dispatch('setDefaultNotebook', {
        colId: window.collate.collection.id,
        notebookId: window.collate.notebookMenuTarget
      })
    }
  }))
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    label: `View in ${getFileBrowser()}`,
    click (menuItem, browserWindow, event) {
      let notebookId = window.collate.notebookMenuTarget
      let notebookPath = window.collate.collection.notebooks[notebookId].path
      electron.shell.showItemInFolder(notebookPath)
    }
  }))
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    type: 'separator'
  }))
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    label: 'Rename',
    click (menuItem, browserWindow, event) {
      window.collate.vue.$store.dispatch('renameNotebookDropdown', true)
    }
  }))
  window.collate.notebookMenu.append(new electron.remote.MenuItem({
    label: 'Delete',
    click (menuItem, browserWindow, event) {
      let notebookId = window.collate.notebookMenuTarget
      window.collate.vue.$store.dispatch('deleteNotebook', notebookId)
    }
  }))

  // Context menu for note pane
  window.collate.noteMenu = new electron.remote.Menu()
  window.collate.noteMenu.append(new electron.remote.MenuItem({
    label: 'Open in Editor',
    click (menuItem, browserWindow, event) {
      const noteId = window.collate.noteMenuTarget
      const notebookId = window.collate.vue.$store.state.mainWindow.activeNotebookId
      electron.ipcRenderer.send('openEditor', {
        noteId: noteId,
        notebookId: notebookId,
        collection: window.collate.collection
      })
    }
  }))
  window.collate.noteMenu.append(new electron.remote.MenuItem({
    label: `View in ${getFileBrowser()}`,
    click (menuItem, browserWindow, event) {
      let noteId = window.collate.noteMenuTarget
      let notePath = window.collate.collection.notes[noteId].file
      electron.shell.showItemInFolder(notePath)
    }
  }))
  window.collate.noteMenu.append(new electron.remote.MenuItem({
    type: 'separator'
  }))
  window.collate.noteMenu.append(new electron.remote.MenuItem({
    label: 'Move',
    click (menuItem, browserWindow, event) {
      window.collate.moveNoteId = window.collate.noteMenuTarget
      window.collate.vue.$store.dispatch('moveNotebookDropdown', true)
    }
  }))
  window.collate.noteMenu.append(new electron.remote.MenuItem({
    label: 'Delete',
    click (menuItem, browserWindow, event) {
      let noteId = window.collate.noteMenuTarget
      window.collate.vue.$store.dispatch('deleteNote', noteId)
    }
  }))

  // Multiselect note context menu
  window.collate.multiNoteMenu = new electron.remote.Menu()
  window.collate.multiNoteMenu.append(new electron.remote.MenuItem({
    label: 'Move',
    click (menuItem, browserWindow, event) {
      window.collate.moveNoteId = window.collate.vue.$store.state.mainWindow.selectedNoteIds
      window.collate.vue.$store.dispatch('moveNotebookDropdown', true)
    }
  }))
  window.collate.multiNoteMenu.append(new electron.remote.MenuItem({
    label: 'Delete',
    click (menuItem, browserWindow, event) {
      let multi = window.collate.vue.$store.state.mainWindow.selectedNoteIds
      window.collate.vue.$store.dispatch('deleteNotes', multi)
    }
  }))

  // Right click on attachments
  window.collate.attachmentMenu = new electron.remote.Menu()
  window.collate.attachmentMenu.append(new electron.remote.MenuItem({
    label: 'Open file',
    click (menuItem, browserWindow, event) {
      electron.shell.openItem(window.collate.attachmentMenuPath)
    }
  }))
  window.collate.attachmentMenu.append(new electron.remote.MenuItem({
    label: 'Insert image',
    click (menuItem, browserWindow, event) {
      // const collectionPath = window.collate.collection.collectionPath
      const path = fileUrl(window.collate.attachmentMenuPath, 0)
      const editorType = window.collate.vue.$store.state.mainWindow.activeNote.metadata.type
      if (editorType === 'markdown') {
        let embed
        if (isImage(path)) {
          embed = `![](${path})`
          const pos = window.collate.simplemde.codemirror.getCursor()
          window.collate.simplemde.codemirror.setSelection(pos, pos)
          window.collate.simplemde.codemirror.replaceSelection(embed)
        } else {
          alert('File is not an image')
        }
      } else if (editorType === 'richtext') {
        let selection = window.collate.quill.getSelection()
        if (!selection) selection = window.collate.quill.getLength() - 1
        window.collate.quill.insertEmbed(selection.index, 'image', path, 'user')
      } else {
        alert('Can not embed in this note type.')
      }
    }
  }))
  window.collate.attachmentMenu.append(new electron.remote.MenuItem({
    label: `View in ${getFileBrowser()}`,
    click (menuItem, browserWindow, event) {
      electron.shell.showItemInFolder(window.collate.attachmentMenuPath)
    }
  }))
  window.collate.attachmentMenu.append(new electron.remote.MenuItem({
    type: 'separator'
  }))
  window.collate.attachmentMenu.append(new electron.remote.MenuItem({
    label: 'Delete',
    click (menuItem, browserWindow, event) {
      let path = window.collate.attachmentMenuPath
      let noteId = window.collate.attachmentMenuNoteId
      window.collate.vue.$store.dispatch('deleteAttachmentFromNote', {noteId: noteId, path: path})
    }
  }))

  // Right click on tags
  window.collate.tagMenu = new electron.remote.Menu()
  window.collate.tagMenu.append(new electron.remote.MenuItem({
    label: 'Delete',
    click (menuItem, browserWindow, event) {
      let tag = window.collate.tagMenuTag
      let noteId = window.collate.tagMenuNoteId
      window.collate.vue.$store.dispatch('deleteTagFromNote', {noteId: noteId, tag: tag})
      window.collate.vue.$store.dispatch('updateSaveStatus')
    }
  }))

  window.collate.collectionMenu = new electron.remote.Menu()
  window.collate.collectionMenu.append(new electron.remote.MenuItem({
    label: 'Make Primary',
    click (menuItem, browserWindow, event) {
      window.collate.vue.$store.dispatch('updateSettings', [{key: 'defaultCollectionId', val: window.collate.contextCollectionId}])
    }
  }))
  window.collate.collectionMenu.append(new electron.remote.MenuItem({
    label: `View in ${getFileBrowser()}`,
    click (menuItem, browserWindow, event) {
      const collectionPath = window.collate.collections[window.collate.contextCollectionId].collectionPath
      if (collectionPath !== null && collectionPath) {
        electron.shell.showItemInFolder(collectionPath)
      }
    }
  }))
  window.collate.collectionMenu.append(new electron.remote.MenuItem({
    label: 'Remove',
    click (menuItem, browserWindow, event) {
      window.collate.vue.$store.dispatch('removeCollection', window.collate.contextCollectionId)
    }
  }))
  // window.collate.collectionMenu.append(new electron.remote.MenuItem({
  //   type: 'separator'
  // }))
  // window.collate.collectionMenu.append(new electron.remote.MenuItem({
  //   label: 'Rename',
  //   click (menuItem, browserWindow, event) {
  //     window.collate.vue.$store.dispatch('renameCollection', window.collate.contextCollectionId)
  //   }
  // }))
  // window.collate.collectionMenu.append(new electron.remote.MenuItem({
  //   label: 'Delete',
  //   click (menuItem, browserWindow, event) {
  //     window.collate.vue.$store.dispatch('deleteCollection', window.collate.contextCollectionId)
  //   }
  // }))
})()
