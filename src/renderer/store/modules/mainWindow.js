import {remote} from 'electron'
import moment from 'moment'
import fs from 'fs-extra'
// import path from 'path'
import * as searchIndex from '../../lib/lunrIndex.js'
import CollectionLoader from '../../collection/CollectionLoader.js'
// import lockfile from '../../lib/lockfile.js'
import debounce from '../../lib/debounce.js'
import log from 'electron-log'

const settings = require('electron').remote.require('electron-settings')

const defaultState = {
  editorId: '',
  inputModalActive: false,
  loadingModalActive: true,
  inputModalSettings: {
    name: 'Notebook',
    placeholder: 'Enter text',
    buttonText: 'Submit',
    buttonAction: 'defaultModalAction'
  },
  newNotebookDropdown: false,
  renameNotebookDropdown: false,
  moveNotebookDropdown: false,
  collections: [],
  activeCollectionId: '',
  notebooks: [],
  activeNotebookId: '',
  tags: [],
  activeTagId: '',
  notes: [],
  activeNoteId: '',
  noteIdHistory: [],
  selectedNoteIds: [],
  activeNote: {},
  genSearchIndex: false,
  searchQuery: '',
  searchMode: false,
  editorVisible: false,
  editorSaveStatus: true,
  titleModified: false,
  attachmentModalActive: false,
  printHtml: '',
  printType: '',
  hideNotebookPane: false,
  hideNotePane: false,
  hideHelpPane: true,
  hideCollectionPane: true,
  helpPanePage: 'home',
  windowType: 'main',
  progressPercentage: 0
}

const state = defaultState

const mutations = {
  RESET_STATE (state) {
    state = defaultState
  },
  SET_EDITOR_ID (state, id) {
    state.editorId = id
  },
  SET_INPUT_MODAL_ACTIVE (state, bool) {
    state.inputModalActive = bool
  },
  SET_LOADING_MODAL_ACTIVE (state, bool) {
    state.loadingModalActive = bool
  },
  SET_INPUT_MODAL_SETTINGS (state, settings) {
    state.inputModalSettings = settings
  },
  UPDATE_NEW_NOTEBOOK_DROPDOWN (state, val) {
    state.newNotebookDropdown = val
  },
  UPDATE_RENAME_NOTEBOOK_DROPDOWN (state, val) {
    state.renameNotebookDropdown = val
  },
  UPDATE_MOVE_NOTEBOOK_DROPDOWN (state, val) {
    state.moveNotebookDropdown = val
  },
  SET_COLLECTIONS (state, collections) {
    state.collections = collections
  },
  SET_ACTIVE_COLLECTION_ID (state, collectionId) {
    state.activeCollectionId = collectionId
  },
  SET_NOTEBOOKS (state, notebooks) {
    state.notebooks = notebooks
  },
  SET_ACTIVE_NOTEBOOK_ID (state, id) {
    state.activeNotebookId = id
  },
  SET_TAGS (state, tags) {
    state.tags = {}
    Object.assign(state.tags, tags)
  },
  SET_ACTIVE_TAG_ID (state, tagId) {
    state.activeTagId = tagId
  },
  SET_NOTES (state, notes) {
    state.notes = notes
  },
  SET_SELECTED_NOTE_IDS (state, ids) {
    state.selectedNoteIds = ids
  },
  SET_ACTIVE_NOTE_ID (state, noteId) {
    state.activeNoteId = noteId
  },
  SET_ACTIVE_NOTE (state, note) {
    state.activeNote = note
  },
  SET_SEARCH_QUERY (state, query) {
    state.searchQuery = query
  },
  SET_SEARCH_MODE (state, searchMode) {
    state.searchMode = searchMode
  },
  SET_EDITOR_VISIBLE (state, editorVisible) {
    state.editorVisible = editorVisible
  },
  SET_EDITOR_SAVE_STATUS (state, editorSaveStatus) {
    state.editorSaveStatus = editorSaveStatus
  },
  SET_TITLE_MODIFIED (state, titleModified) {
    state.titleModified = titleModified
  },
  SET_ATTACHMENT_MODAL_ACTIVE (state, attachmentModalActive) {
    state.attachmentModalActive = attachmentModalActive
  },
  SET_PRINT_HTML (state, printHtml) {
    state.printHtml = printHtml
  },
  SET_PRINT_TYPE (state, type) {
    state.printType = type
  },
  UPDATE_NOTE_TITLE (state, text) {
    state.activeNote.metadata.title = text
  },
  UPDATE_NOTE_BODY (state, text) {
    state.activeNote.body = text
  },
  UPDATE_NOTE_METADATA (state, payload) {
    state.activeNote.metadata[payload.key] = payload.value
  },
  UPDATE_HIDE_NOTEBOOK_PANE (state, status) {
    state.hideNotebookPane = status
  },
  UPDATE_HIDE_NOTE_PANE (state, status) {
    state.hideNotePane = status
  },
  UPDATE_HIDE_HELP_PANE (state, status) {
    state.hideHelpPane = status
  },
  UPDATE_HELP_PANE_PAGE (state, page) {
    state.helpPanePage = page
  },
  UPDATE_HIDE_COLLECTION_PANE (state, status) {
    state.hideCollectionPane = status
  },
  UPDATE_WINDOW_TYPE (state, type) {
    state.windowType = type
  },
  SET_NOTE_ID_HISTORY (state, val) {
    state.noteIdHistory = val
  },
  UPDATE_GEN_SEARCH_INDEX (state, val) {
    state.genSearchIndex = val
  },
  UPDATE_PROGRESS_PERCENTAGE (state, val) {
    state.progressPercentage = val
  },
  UPDATE_MODE (state, payload) {
    state.mode.status = payload.status
    state.mode.firstRun = payload.firstRun
  }
}

const actions = {
  initProgram ({commit}, params) {
    log.info('Init Program. Parameters passed in: ' + JSON.stringify(params))

    log.info('window.collate.vue.$store.state', window.collate.vue.$store)
    commit('SET_LOADING_MODAL_ACTIVE', true)
    if (typeof params.context === 'undefined' || !params.context) {
      params.context = 'main'
    }

    log.info('Settings file saved at ' + settings.file())

    commit('RESET_STATE')
    commit('SET_COLLECTIONS', [])

    // Create the in memory collection
    window.collate.collections = {}
    let collectionPath = settings.get('collectionPath')
    if (collectionPath != null && collectionPath) {
      // Ensure old style collection path strings are converted to new style array
      if (!Array.isArray(collectionPath) && typeof collectionPath === 'string') {
        collectionPath = [collectionPath]
        settings.set('collectionPath', collectionPath)
      }

      let removePaths = []
      for (let colPath of collectionPath) {
        // Initialize collection
        log.info('Initializing Collection ' + colPath)

        if (!fs.existsSync(colPath)) {
          log.info('Collection ' + colPath + ' has moved or isn\'t available.')
          removePaths.push(colPath)
          break
        }
        let collection
        try {
          collection = new CollectionLoader(colPath)
        } catch (e) {
          log.error('Error Occurred while parsing collection' + e)
          break
        }

        // Set the collection lookup object
        window.collate.collections[collection.id] = collection

        // Add object to collection pane
        let newCollections = window.collate.vue.$store.state.mainWindow.collections.splice(0)
        newCollections.push({id: collection.id, name: collection.name, path: colPath})
        commit('SET_COLLECTIONS', newCollections)

        // Create search index
        log.info('Generating Lunr Search Index')
        if (params.context === 'main') {
          window.collate.vue.$store.dispatch('genSearchIndex', true)
          if (window.collate.vue.$store.state.settings.loadStrategy === 'sync') {
            searchIndex.create(collection.id)
          } else {
            searchIndex.createAsync(collection.id)
          }
        }
      }

      // Remove any broken collection paths
      for (let colPath of removePaths) {
        window.collate.vue.$store.commit('REMOVE_COLLECTION_PATH', colPath)
      }

      // Set a collection active
      if (window.collate.vue.$store.state.mainWindow.collections.length > 0) {
        let targetCol
        let targetColId
        if (params.context === 'main') {
          const defaultCollectionId = settings.get('defaultCollectionId')
          if (defaultCollectionId != null && defaultCollectionId) {
            // Set the default collection
            targetCol = window.collate.collections[defaultCollectionId]
            // If the default collection is unavailable (deleted or moved) set first notebook
            if (targetCol == null || !targetCol) {
              // Set first notebook active
              targetColId = window.collate.vue.$store.state.mainWindow.collections[0].id
              targetCol = window.collate.collections[targetColId]
            }
          } else {
            targetColId = window.collate.vue.$store.state.mainWindow.collections[0].id
            targetCol = window.collate.collections[targetColId]
          }
        } else if (params.context === 'editor') {
          log.info('initializing editor', params.collectionId)
          targetColId = params.collectionId
          targetCol = window.collate.collections[targetColId]
        }
        window.collate.collection = targetCol
        commit('SET_ACTIVE_COLLECTION_ID', targetCol.id)
      } else {
        // No collections set, open collection pane.
        commit('UPDATE_HIDE_COLLECTION_PANE', false)
        commit('SET_LOADING_MODAL_ACTIVE', false)
        return
      }

      commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
      commit('SET_TAGS', window.collate.collection.getTags())
    } else {
      log.info('Collection Path not set. Opening collection pane')
      commit('UPDATE_HIDE_COLLECTION_PANE', false)
    }
    // Generate a unique editor id for lockfile use
    // let editorId (+new Date()).toString() + '_' + remote.getCurrentWindow().id
    // log.info('Generating unique editorId ' + editorId)
    // commit('SET_EDITOR_ID', editorId)
    commit('SET_LOADING_MODAL_ACTIVE', false)
    log.info('Program initialization complete')
  },

  addCollectionPath ({commit}, payload) {
    const colPath = window.collate.vue.$store.state.settings.collectionPath
    if (Array.isArray(colPath) && colPath.indexOf(payload.path) >= 0) {
      return
    }

    const collectionPath = payload.path
    // Save to settings collectionPath
    commit('ADD_COLLECTION_PATH', collectionPath)

    try {
      // Initialize collection
      log.info('Initializing Collection')
      const collection = new CollectionLoader(collectionPath, payload.new)
      window.collate.collections[collection.id] = collection
      // Add object to collection pane
      let newCollections = window.collate.vue.$store.state.mainWindow.collections.splice(0)
      newCollections.push({id: collection.id, name: collection.name, path: collection.collectionPath})
      commit('SET_COLLECTIONS', newCollections)

      window.collate.vue.$store.dispatch('genSearchIndex', true)
      if (window.collate.vue.$store.state.settings.loadStrategy === 'sync') {
        searchIndex.create(collection.id)
      } else {
        searchIndex.createAsync(collection.id)
      }
    } catch (e) {
      log.error('Error encountered while initializing collection. Pushing to Settings. Error: ' + e)
      commit('SET_LOADING_MODAL_ACTIVE', false)
    }
  },

  /**
   * Load a collection when clicked in the collection pane
   */
  loadCollection ({commit}, collectionId) {
    commit('SET_LOADING_MODAL_ACTIVE', true)
    let targetCollection = window.collate.collections[collectionId]
    window.collate.collection = targetCollection
    if (targetCollection != null && targetCollection) {
      commit('SET_NOTES', [])
      commit('SET_EDITOR_VISIBLE', false)
      commit('SET_ACTIVE_COLLECTION_ID', collectionId)
      commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
      commit('SET_TAGS', window.collate.collection.getTags())
    }
    log.info('Switching to collection ' + collectionId + ' ' + window.collate.collection.name)
    commit('SET_LOADING_MODAL_ACTIVE', false)
  },

  // Remove a collection from the collection pane
  removeCollection ({commit}, collectionId) {
    const collectionPath = window.collate.collections[collectionId].collectionPath
    // Remove it from settings.collectionPath
    commit('REMOVE_COLLECTION_PATH', collectionPath)

    // Remove it from mainWindow.collections
    let newCollections = window.collate.vue.$store.state.mainWindow.collections.splice(0)
    for (let i = newCollections.length - 1; i >= 0; i--) {
      if (newCollections[i].id === collectionId) {
        newCollections.splice(i, 1)
      }
    }
    commit('SET_COLLECTIONS', newCollections)
    // Remove it from window.collate.collections
    delete window.collate.collections[collectionId]
  },

  inputModalActivate ({commit}, settings) {
    commit('SET_INPUT_MODAL_SETTINGS', settings)
    commit('SET_INPUT_MODAL_ACTIVE', true)
  },

  newNotebookDropdown ({commit}, status) {
    commit('UPDATE_NEW_NOTEBOOK_DROPDOWN', status)
  },

  renameNotebookDropdown ({commit}, status) {
    commit('UPDATE_RENAME_NOTEBOOK_DROPDOWN', status)
  },

  moveNotebookDropdown ({commit}, status) {
    commit('UPDATE_MOVE_NOTEBOOK_DROPDOWN', status)
  },

  loadingModal ({commit}, toggle) {
    commit('SET_LOADING_MODAL_ACTIVE', toggle)
  },

  inputModalDeactivate ({commit}) {
    commit('SET_INPUT_MODAL_ACTIVE', false)
  },

  newNotebook ({commit}, name) {
    window.collate.collection.createNotebook(name)
      .then(newNotebookId => {
        commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
        window.collate.vue.$store.dispatch('clickNotebook', newNotebookId)
      })
      .catch(err => {
        log.error('Error encountered while creating new notebook: ' + err.message)
        remote.dialog.showErrorBox('Error', 'Error encountered while creating new notebook: ' + err.message)
      })
  },

  deleteNotebook ({commit}, notebookId) {
    let displayName = window.collate.collection.getId(notebookId).displayName
    if (typeof displayName === 'undefined') {
      log.error('Error occurred while deleting notebook: Notebook not found')
      remote.dialog.showErrorBox('Error', 'Error occurred while deleting notebook: Notebook not found')
      return
    }
    let confirmation = confirm('Delete ' + displayName + '?')
    if (confirmation) {
      log.debug('User confirmation: ' + confirmation)
      // Close out the active state
      if (window.collate.vue.$store.state.mainWindow.activeNotebookId === notebookId) {
        commit('SET_ACTIVE_NOTEBOOK_ID', '')
        commit('SET_NOTES', [])
        commit('SET_EDITOR_VISIBLE', false)
        commit('SET_ACTIVE_NOTE_ID', '')
        commit('SET_ACTIVE_NOTE', {})
      }
      window.collate.collection.deleteNotebook(notebookId)
        .then(() => {
          commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
          commit('SET_TAGS', window.collate.collection.getTags())
        })
        .catch(err => {
          log.error('Error occurred while deleting notebook' + err)
          remote.dialog.showErrorBox('Error', 'Error occurred while deleting notebook: ' + err.message)
        })
    }
  },

  renameNotebook ({commit}, params) {
    window.collate.collection.renameNotebook(params.notebookId, params.newName)
      .then(newNotebookId => {
        commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
        commit('SET_NOTES', window.collate.collection.getNotes({notebookId: newNotebookId}))
        commit('SET_ACTIVE_NOTEBOOK_ID', newNotebookId)
      })
      .catch(err => {
        log.error('Error occurred while renaming notebook ' + err)
        remote.dialog.showErrorBox('Error', 'Couldn\'t rename notebook. Please make sure a notebook with that name doesn\'t already exist.')
      })
  },

  reloadNotebooks ({commit}) {
    commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
  },

  clickNotebook ({commit}, id) {
    // If note unsaved, prompt to save.
    if (!window.collate.vue.$store.state.mainWindow.editorSaveStatus) {
      if (confirm('Save changes before closing note?')) {
        window.collate.collection.saveNoteToDisk(window.collate.vue.$store.state.mainWindow.activeNoteId)
          .then(() => {
            commit('SET_EDITOR_SAVE_STATUS', true)
          })
          .catch(err => {
            log.error('Error occurred while renaming notebook ' + err)
            remote.dialog.showErrorBox('Error', 'Error occurred while saving note ' + err.message)
          })
      } else {
        commit('SET_EDITOR_SAVE_STATUS', true)
      }
    }

    // If search mode enabled, clear it.
    if (window.collate.vue.$store.state.mainWindow.searchMode) {
      commit('SET_SEARCH_QUERY', '')
      commit('SET_SEARCH_MODE', false)
    }

    commit('SET_EDITOR_VISIBLE', false)
    commit('SET_ACTIVE_NOTE_ID', '')
    commit('SET_ACTIVE_NOTE', {})

    // If the same notebook clicked, deselect it
    if (window.collate.vue.$store.state.mainWindow.activeNotebookId === id) {
      commit('SET_ACTIVE_NOTEBOOK_ID', '')
      commit('SET_NOTES', [])
    } else {
      commit('SET_ACTIVE_TAG_ID', '')
      commit('SET_ACTIVE_NOTEBOOK_ID', id)
      let notes = window.collate.collection.getNotes({notebookId: id})
      commit('SET_NOTES', notes)
      if (notes.length === 1) {
        window.collate.vue.$store.dispatch('clickNote', notes[0].id)
      }
    }
  },

  reloadTags ({commit}) {
    commit('SET_TAGS', {})
    commit('SET_TAGS', window.collate.collection.getTags())
  },

  clickTag ({commit}, tag) {
    commit('SET_EDITOR_VISIBLE', false)
    commit('SET_ACTIVE_NOTE_ID', '')
    commit('SET_ACTIVE_NOTE', {})
    if (window.collate.vue.$store.state.mainWindow.activeTagId === tag) {
      commit('SET_ACTIVE_TAG_ID', '')
      commit('SET_NOTES', [])
    } else {
      commit('SET_ACTIVE_NOTEBOOK_ID', '')
      commit('SET_ACTIVE_TAG_ID', tag)
      let notes = window.collate.collection.getNotesFromTags({tag: tag})
      commit('SET_NOTES', notes)
      if (notes.length === 1) {
        window.collate.vue.$store.dispatch('clickNote', notes[0].id)
      }
    }

    // If note clicked on while in search mode, clear it out
    if (window.collate.vue.$store.state.mainWindow.searchMode) {
      commit('SET_SEARCH_QUERY', '')
      commit('SET_SEARCH_MODE', false)
    }
  },

  updateTagInputBox ({commit}, payload) {
    try {
      window.collate.collection.addTagToNote(payload.id, payload.tag)
    } catch (e) {
      log.error('Error occurred while adding a tag to a note ' + e)
    }

    commit('SET_TAGS', {})
    commit('SET_TAGS', window.collate.collection.getTags())
  },

  clickNote ({commit}, id) {
    // If note unsaved, prompt to save.
    if (!window.collate.vue.$store.state.mainWindow.editorSaveStatus) {
      if (confirm('Save changes before closing note?')) {
        window.collate.collection.saveNoteToDisk(window.collate.vue.$store.state.mainWindow.activeNoteId)
          .then(() => {
            commit('SET_EDITOR_SAVE_STATUS', true)
          })
          .catch(err => {
            log.error('Error occurred while renaming notebook ' + err)
            remote.dialog.showErrorBox('Error', 'Error occurred while saving note ' + err.message)
          })
      } else {
        commit('SET_EDITOR_SAVE_STATUS', true)
      }
    }

    // If noteId clicked is active, deactivate it
    if (window.collate.vue.$store.state.mainWindow.activeNoteId === id) {
      commit('SET_ACTIVE_NOTE_ID', '')
      commit('SET_ACTIVE_NOTE', {})
      commit('SET_EDITOR_VISIBLE', false)
    } else {
      // Set note and show editor
      window.collate.collection.getNote(id)
        .then(note => {
          commit('SET_ACTIVE_NOTE_ID', id)
          commit('SET_EDITOR_VISIBLE', true)
          commit('SET_ACTIVE_NOTE', note)
        })
        .catch(err => { log.error('Error encountered while fetching note data ' + err) })
    }
  },

  clearActiveNote ({commit}) {
    // If note unsaved, prompt to save.
    if (!window.collate.vue.$store.state.mainWindow.editorSaveStatus) {
      if (confirm('Save changes before closing note?')) {
        window.collate.collection.saveNoteToDisk(window.collate.vue.$store.state.mainWindow.activeNoteId)
          .then(() => {
            commit('SET_EDITOR_SAVE_STATUS', true)
          })
          .catch(err => {
            log.error('Error occurred while saving note ' + err)
            remote.dialog.showErrorBox('Error', 'Error occurred while saving note ' + err.message)
          })
      } else {
        commit('SET_EDITOR_SAVE_STATUS', true)
      }
    }
    commit('SET_ACTIVE_NOTE_ID', '')
    commit('SET_ACTIVE_NOTE', {})
    commit('SET_EDITOR_VISIBLE', false)
  },

  updateSelectedNoteIds ({commit}, ids) {
    commit('SET_SELECTED_NOTE_IDS', ids)
  },

  deleteNote ({commit}, noteId) {
    let note = window.collate.collection.getId(noteId)
    let confirmation = confirm('Delete ' + note.displayName + '?')
    if (confirmation) {
      if (window.collate.vue.$store.state.mainWindow.activeNoteId === noteId) {
        commit('SET_EDITOR_VISIBLE', false)
        commit('SET_ACTIVE_NOTE_ID', '')
        commit('SET_ACTIVE_NOTE', {})
      }
      window.collate.collection.deleteNote(noteId)
        .then(() => {
          const activeNotebookId = window.collate.vue.$store.state.mainWindow.activeNotebookId
          const activeTagId = window.collate.vue.$store.state.mainWindow.activeTagId
          if (activeNotebookId && !activeTagId) {
            commit('SET_NOTES', window.collate.collection.getNotes({notebookId: activeNotebookId}))
          } else if (!activeNotebookId && activeTagId) {
            commit('SET_NOTES', window.collate.collection.getNotesFromTags({tag: activeTagId}))
          } else {
            commit('SET_NOTES', [])
          }
          commit('SET_TAGS', window.collate.collection.getTags())
          commit('SET_NOTEBOOKS', window.collate.collection.getNotebooks())
          searchIndex.remove(noteId)
        })
        .catch(err => {
          log.error('Error occurred while deleting note ' + noteId + ' error: ' + err)
        })
    }
  },

  deleteNotes ({commit}, noteIds) {
    let confirmation = confirm('Delete ' + noteIds.length + ' notes?')
    if (confirmation) {
      for (let i = 0; i < noteIds.length; i++) {
        window.collate.collection.deleteNote(noteIds[i])
          .then(() => {
            commit('SET_NOTES', window.collate.collection.getNotes({notebookId: window.collate.vue.$store.state.mainWindow.activeNotebookId}))
            searchIndex.remove(noteIds[i])
          })
          .catch(() => {
            log.error('Error occurred while deleting multiple notes at noteid ' + noteIds[i])
          })
      }
    }
  },

  newNote ({commit}, payload) {
    if (payload == null) {
      log.error('Payload not passed into newNote')
      throw Error('No data passed into newNote.')
    }
    const defaultNotebookId = window.collate.vue.$store.state.settings.defaultNotebookId[window.collate.vue.$store.state.mainWindow.activeCollectionId]
    let notebookId
    if (payload.notebookId == null || !payload.notebookId) {
      if (defaultNotebookId == null || !defaultNotebookId) {
        alert('Please choose a notebook or set a default notebook')
        return
      } else {
        const notebook = window.collate.collection.getId(defaultNotebookId)
        if (notebook == null || !notebook || !Object.keys(notebook).length) {
          alert('Please choose a notebook or set a default notebook')
          return
        }
        notebookId = defaultNotebookId
      }
    } else {
      // Set the notebook active
      notebookId = payload.notebookId
    }
    // Clear active tag if one is selected
    if (window.collate.vue.$store.state.mainWindow.activeTagId) {
      commit('SET_ACTIVE_TAG_ID', '')
    }
    // Set the notebook active
    commit('SET_ACTIVE_NOTEBOOK_ID', notebookId)
    const overrideDefaultFormat = window.collate.vue.$store.state.settings.defaultTitleFormat

    let defaultNoteName
    if (overrideDefaultFormat !== undefined && overrideDefaultFormat) {
      defaultNoteName = moment().format(overrideDefaultFormat)
    } else {
      defaultNoteName = moment().format('MMMM Do YYYY h.mm.ss.SS a')
    }

    window.collate.collection.createNote(defaultNoteName, notebookId, payload.type)
      .then(newNoteId => {
        // Update state with new note
        commit('SET_NOTES', window.collate.collection.getNotes({notebookId: notebookId}))
        commit('SET_ACTIVE_NOTE', window.collate.collection.getId(newNoteId))
        commit('SET_ACTIVE_NOTE_ID', newNoteId)
        commit('SET_EDITOR_VISIBLE', true)
        searchIndex.add(newNoteId)
      })
      .catch(err => {
        log.error('Error occurred while creating note: ' + defaultNoteName + ' ' + err)
        remote.dialog.showErrorBox('Error', 'Error occurred while creating note: ' + err)
      })
  },

  reloadNotes ({commit}, notebookId) {
    commit('SET_NOTES', window.collate.collection.getNotes({notebookId: notebookId}))
  },

  updateNoteTitle ({commit}, params) {
    if (params.text == null || params.noteId == null) {
      throw new Error('Missing note id or title passed into update note title.')
    }
    if (params.text.length > 0) {
      const note = window.collate.collection.getId(params.noteId)
      window.collate.collection.renameNote(params.text, note.id)
        .then(newNoteId => {
          // Replace the old note ids in the note history with the new one
          window.collate.vue.$store.dispatch('replaceNoteIdHistory', {oldId: note.id, newId: newNoteId})
          commit('UPDATE_NOTE_TITLE', params.text)
          commit('SET_ACTIVE_NOTE_ID', newNoteId)
          commit('SET_ACTIVE_NOTE', window.collate.collection.getId(newNoteId))
          commit('SET_NOTES', window.collate.collection.getNotes({notebookId: note.notebook}))
        })
        .catch(err => {
          log.error('Error occurred while updating note title. Note title conflict ' + note.metadata.title + ' vs ' + params.text + ' ' + err)
          commit('UPDATE_NOTE_TITLE', note.metadata.title)
          commit('UPDATE_NOTIFICATION_MESSAGE', 'Note title conflict, please use a different title')
          commit('UPDATE_NOTIFICATION_CLASS', 'is-danger')
          commit('SHOW_NOTIFICATION', true)
        })
    }
  },

  updateNoteBody ({commit}, text) {
    commit('UPDATE_NOTE_BODY', text)
  },

  updateNoteMetadata ({commit}, payload) {
    commit('UPDATE_NOTE_METADATA', payload)
  },

  updateSaveStatus ({commit}) {
    const debounceSave = debounce((commit) => {
      const noteId = window.collate.vue.$store.state.mainWindow.activeNoteId
      window.collate.collection.saveNoteToDisk(noteId)
        .then(() => {
          searchIndex.update(noteId)
          commit('SET_EDITOR_SAVE_STATUS', true)
        })
        .catch(err => {
          log.error('Error occurred while saving note in debounceSave' + err)
          remote.dialog.showErrorBox('Error', 'Error occurred while saving note ' + err.message)
        })
    }, 5000)
    commit('SET_EDITOR_SAVE_STATUS', false)
    if (!window.collate.vue.$store.state.settings.disableAutosave) {
      debounceSave(commit)
    }
  },

  saveNote ({commit}) {
    const noteId = window.collate.vue.$store.state.mainWindow.activeNoteId
    window.collate.collection.saveNoteToDisk(noteId)
      .then(() => {
        searchIndex.update(noteId)
        commit('SET_EDITOR_SAVE_STATUS', true)
      })
      .catch(err => {
        log.error('Error occurred while saving note in saveNote action' + err)
        remote.dialog.showErrorBox('Error', 'Error occurred while saving note ' + err.message)
      })
  },

  moveNote ({commit}, payload) {
    window.collate.collection.moveNote(payload.noteId, payload.targetNotebookId)
      .then(newNoteId => {
        let newNote = window.collate.collection.getId(newNoteId)
        // Replace the old note ids in the note history with the new one
        window.collate.vue.$store.dispatch('replaceNoteIdHistory', {oldId: payload.noteId, newId: newNoteId})
        // Update search index
        searchIndex.remove({id: payload.noteId})
        searchIndex.add(newNoteId)

        // If a notebook is active, handle that.
        if (window.collate.vue.$store.state.mainWindow.activeNotebookId) {
          commit('SET_ACTIVE_NOTE_ID', newNote.id)
          commit('SET_ACTIVE_NOTE', newNote)
          commit('SET_ACTIVE_NOTEBOOK_ID', newNote.notebook.id)
          commit('SET_NOTES', window.collate.collection.getNotes({notebookId: newNote.notebook.id}))
        } else if (window.collate.vue.$store.state.mainWindow.activeTagId) {
          window.collate.vue.$store.dispatch('clickTag', window.collate.vue.$store.state.mainWindow.activeTagId)
        }
      })
      .catch(err => {
        log.error('Error occurred while moving note ' + err)
        remote.dialog.showErrorBox('Error', 'Error occurred while moving note: ' + err.message)
      })
  },

  contextMoveNote ({commit}, noteId) {
    commit('SET_ACTIVE_NOTE_ID', noteId)
    commit('SET_EDITOR_VISIBLE', true)
    window.collate.collection.getNote(noteId)
      .then(note => { commit('SET_ACTIVE_NOTE', note) })
      .catch(err => { log.error('Error encountered while fetching note data ' + err) })
  },

  addAttachments ({commit}, files) {
    let attachmentPromises = []
    if (typeof files !== 'undefined' && files) {
      let noteId = window.collate.vue.$store.state.mainWindow.activeNoteId
      for (let file of files) {
        try {
          attachmentPromises.push(window.collate.collection.addAttachmentToNote(noteId, file))
        } catch (e) {
          log.error('Error occurred while adding attachment to note ' + e)
        }
      }
      searchIndex.update(noteId)
    }

    return Promise.all(attachmentPromises)
  },

  attachmentModalActivate ({commit}) {
    commit('SET_ATTACHMENT_MODAL_ACTIVE', true)
  },

  attachmentModalDeactivate ({commit}) {
    commit('SET_ATTACHMENT_MODAL_ACTIVE', false)
  },

  deleteAttachmentFromNote ({commit}, payload) {
    window.collate.collection.deleteAttachmentFromNote(payload.noteId, payload.path)
      .then(() => {
        searchIndex.update(payload.noteId)
      })
      .catch(err => {
        log.error('Error occurred while deleting attachment from note ' + err)
      })
  },

  deleteTagFromNote ({commit}, payload) {
    try {
      window.collate.collection.deleteTagFromNote(payload.noteId, payload.tag)
    } catch (e) {
      log.error('Error occurred while deleting tag from note ' + e)
    }
    commit('SET_TAGS', {})
    commit('SET_TAGS', window.collate.collection.getTags())
    searchIndex.update(payload.noteId)
  },

  updateSearchQuery ({commit}, query) {
    log.info('Search query initiated ' + query)
    let state = window.collate.vue.$store.state
    if (typeof window.collate.searchStorage === 'undefined') {
      window.collate.searchStorage = {}
    }
    commit('SET_SEARCH_QUERY', query)
    // If the query is empty, return to the previous active state
    if (query.length === 0 || query.length === '') {
      log.info('Query empty, disabling search mode and return to previous state')
      commit('SET_EDITOR_VISIBLE', false)
      commit('SET_ACTIVE_NOTE', {})
      commit('SET_ACTIVE_NOTE_ID', '')

      if (!window.collate.searchStorage.notebookId && !window.collate.searchStorage.noteId && !window.collate.searchStorage.tagId) {
        commit('SET_NOTES', [])
      }
      if (window.collate.searchStorage.notebookId) {
        commit('SET_ACTIVE_NOTEBOOK_ID', window.collate.searchStorage.notebookId)
        commit('SET_NOTES', window.collate.collection.getNotes({notebookId: window.collate.searchStorage.notebookId}))
        window.collate.searchStorage.notebookId = ''
      }
      if (window.collate.searchStorage.tag) {
        commit('SET_ACTIVE_TAG_ID', window.collate.searchStorage.tag)
        commit('SET_NOTES', window.collate.collection.getNotesFromTags({tag: window.collate.searchStorage.tag}))
        window.collate.searchStorage.tag = ''
      }
      if (window.collate.searchStorage.noteId) {
        commit('SET_ACTIVE_NOTE_ID', window.collate.searchStorage.noteId)
        window.collate.collection.getNote(window.collate.searchStorage.noteId)
          .then(note => {
            commit('SET_ACTIVE_NOTE', note)
            commit('SET_EDITOR_VISIBLE', true)
            window.collate.searchStorage.noteId = ''
          })
          .catch(err => { log.error('Error encountered while fetching note data ' + err) })
      }
      commit('SET_SEARCH_MODE', false)
    } else {
      log.info('Storing active state and switching to search mode')
      // store the active state
      if (!state.searchMode) {
        window.collate.searchStorage.noteId = state.mainWindow.activeNoteId
        window.collate.searchStorage.notebookId = state.mainWindow.activeNotebookId
        window.collate.searchStorage.tag = state.mainWindow.activeTagId
      }
      // Enable search mode so that the stored state isn't overwritten until
      // the search query is cleared
      commit('SET_SEARCH_MODE', true)
      // Clear state
      commit('SET_ACTIVE_NOTEBOOK_ID', '')
      commit('SET_ACTIVE_NOTE_ID', '')
      commit('SET_ACTIVE_TAG_ID', '')
      commit('SET_ACTIVE_NOTE', {})
      commit('SET_EDITOR_VISIBLE', false)
      if (window.collate.collection.searchIndex == null || window.collate.vue.$store.state.mainWindow.progressPercentage) {
        log.info('Initiating basic search ' + query)
        commit('SET_NOTES', window.collate.collection.getNotes({query: query, mode: 'basic'}))
      } else {
        log.info('Initiating indexed search ' + query)
        commit('SET_NOTES', window.collate.collection.getNotes({query: query, mode: 'indexed'}))
      }
    }
  },

  genSearchIndex ({commit}, val) {
    commit('UPDATE_GEN_SEARCH_INDEX', val)
  },

  disableSearchMode ({commit}) {
    commit('SET_SEARCH_QUERY', '')
    commit('SET_EDITOR_VISIBLE', false)
    commit('SET_ACTIVE_NOTE', {})
    commit('SET_ACTIVE_NOTE_ID', '')

    if (!window.collate.searchStorage.notebookId && !window.collate.searchStorage.noteId && !window.collate.searchStorage.tagId) {
      commit('SET_NOTES', [])
    }
    if (window.collate.searchStorage.notebookId) {
      commit('SET_ACTIVE_NOTEBOOK_ID', window.collate.searchStorage.notebookId)
      commit('SET_NOTES', window.collate.collection.getNotes({notebookId: window.collate.searchStorage.notebookId}))
      window.collate.searchStorage.notebookId = ''
    }
    if (window.collate.searchStorage.tag) {
      commit('SET_ACTIVE_TAG_ID', window.collate.searchStorage.tag)
      commit('SET_NOTES', window.collate.collection.getNotesFromTags({tag: window.collate.searchStorage.tag}))
      window.collate.searchStorage.tag = ''
    }
    if (window.collate.searchStorage.noteId) {
      commit('SET_ACTIVE_NOTE_ID', window.collate.searchStorage.noteId)
      window.collate.collection.getNote(window.collate.searchStorage.noteId)
        .then(note => {
          commit('SET_ACTIVE_NOTE', note)
          commit('SET_EDITOR_VISIBLE', true)
          window.collate.searchStorage.noteId = ''
        })
        .catch(err => { log.error('Error encountered while fetching note data ' + err) })
    }
    commit('SET_SEARCH_MODE', false)
  },

  updateHideNotebookPane ({commit}, status) {
    commit('UPDATE_HIDE_NOTEBOOK_PANE', status)
  },

  updateHideNotePane ({commit}, status) {
    commit('UPDATE_HIDE_NOTE_PANE', status)
  },

  updateNoteListType ({commit}, type) {
    commit('UPDATE_NOTE_LIST_TYPE', type)
  },

  updateHideHelpPane ({commit}, status) {
    commit('UPDATE_HIDE_HELP_PANE', status)
  },

  updateHideCollectionPane ({commit}, status) {
    commit('UPDATE_HIDE_COLLECTION_PANE', status)
  },

  updateHelpPanePage ({commit}, page) {
    commit('UPDATE_HELP_PANE_PAGE', page)
  },

  updateWindowType ({commit}, type) {
    commit('UPDATE_WINDOW_TYPE', type)
  },

  addNoteIdHistory ({commit}, id) {
    let currentHistory = window.collate.vue.$store.state.mainWindow.noteIdHistory
    let history = currentHistory.slice(0)
    history.push(id)
    if (history.length > 5) {
      history.shift()
    }
    commit('SET_NOTE_ID_HISTORY', history)
  },

  replaceNoteIdHistory ({commit}, payload) {
    // Replace an id with a new id
    let newHistory = []
    for (let id of window.collate.vue.$store.state.mainWindow.noteIdHistory) {
      if (id === payload.oldId) {
        newHistory.push(payload.newId)
      } else {
        newHistory.push(id)
      }
    }
    commit('SET_NOTE_ID_HISTORY', newHistory)
  },

  updateProgressPercentage ({commit}, payload) {
    commit('UPDATE_PROGRESS_PERCENTAGE', payload)
  },

  updateMode ({commit}, payload) {
    commit('UPDATE_MODE', payload)
  }

}

export default {
  state,
  mutations,
  actions
}
