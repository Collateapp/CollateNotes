import {remote} from 'electron'
import defaultSettings from '../../../shared/defaultSettings.js'
import log from 'electron-log'
import merge from 'deepmerge'
const settings = require('electron').remote.require('electron-settings')

const state = merge(defaultSettings, settings.getAll())

const mutations = {
  INIT_SETTINGS (state) {
    log.info('Initializing settings state')
    const settingsFile = settings.getAll()
    state = merge(state, settingsFile)
    settings.setAll(state, {prettify: true})
    log.info('Initialization complete')
  },
  ADD_COLLECTION_PATH (state, colpath) {
    if (!Array.isArray(state.collectionPath) && typeof state.collectionPath === 'string') {
      state.collectionPath = [state.collectionPath]
    }
    state.collectionPath.push(colpath)
    settings.set('collectionPath', state.collectionPath)
  },
  REMOVE_COLLECTION_PATH (state, path) {
    const idx = state.collectionPath.indexOf(path)
    if (idx >= 0) {
      state.collectionPath.splice(idx, 1)
      settings.set('collectionPath', state.collectionPath)
    }
  },
  UPDATE_SETTINGS (state, settingArray) {
    for (let setting of settingArray) {
      settings.set(setting.key, setting.val)
      state[setting.key] = setting.val
    }
  },
  SET_EDITOR_NOTE_TYPE (state, setting) {
    settings.set('editorNewNoteType', setting)
    state.editorNewNoteType = setting
  },
  SET_EDITOR_NOTE_TYPE_BUTTON_TEXT (state, text) {
    settings.set('editorNewNoteTypeButtonText', text)
    state.editorNewNoteTypeButtonText = text
  },
  UPDATE_DEFAULT_TITLE_FORMAT (state, format) {
    settings.set('defaultTitleFormat', format)
    state.defaultTitleFormat = format
  },
  UPDATE_NOTE_LIST_TYPE (state, type) {
    settings.set('notePaneListType', type)
    state.notePaneListType = type
  },
  UPDATE_MARKDOWN_PREVIEW_ENABLED (state, val) {
    settings.set('markdownEditor.previewEnabled', val)
    state.markdownEditor.previewEnabled = val
  },
  SET_RICHTEXT_FONT (state, val) {
    state.richtextEditor.font = val
  },
  SET_LOAD_STRATEGY (state, val) {
    state.loadStrategy = val
  },
  SET_DEFAULT_NOTEBOOK (state, payload) {
    if (typeof state.defaultNotebookId === 'string') {
      state.defaultNotebookId = {}
    }
    window.collate.vue.$set(state.defaultNotebookId, payload.colId, payload.notebookId)
    settings.set('defaultNotebookId', state.defaultNotebookId)
  },
  SET_KEYBOARD_SHORTCUT (state, payload) {
    state.keyboardShortcuts[payload.name] = payload.keyCombo
  },
  SET_AUTO_HIDE_MENUBAR (state, val) {
    state.autoHideMenuBar = val
  },
  UPDATE_WALKTHROUGH (state, val) {
    settings.set('walkthrough', val)
    state.walkthrough = val
  }
}

const actions = {
  resetSettings ({commit}) {
    log.info('Resetting settings')
    settings.deleteAll()
    settings.setAll(defaultSettings)
    commit('INIT_SETTINGS')
  },
  updateSettings ({commit}, setting) {
    log.info('Updating setting: ' + setting)
    commit('UPDATE_SETTINGS', setting)
  },
  updateNoteType ({commit}, type) {
    log.info('Updating note type ', type)
    switch (type) {
      case 'richtext':
        commit('SET_EDITOR_NOTE_TYPE', 'richtext')
        commit('SET_EDITOR_NOTE_TYPE_BUTTON_TEXT', 'Rich Text')
        break
      case 'clipper':
        commit('SET_EDITOR_NOTE_TYPE', 'clipper')
        commit('SET_EDITOR_NOTE_TYPE_BUTTON_TEXT', 'Web Clipper')
        break
      case 'outline':
        commit('SET_EDITOR_NOTE_TYPE', 'outline')
        commit('SET_EDITOR_NOTE_TYPE_BUTTON_TEXT', 'Outline')
        break
      default:
        commit('SET_EDITOR_NOTE_TYPE', 'markdown')
        commit('SET_EDITOR_NOTE_TYPE_BUTTON_TEXT', 'Markdown')
        break
    }
  },

  updateMarkdownPreviewEnabled ({commit}, val) {
    commit('UPDATE_MARKDOWN_PREVIEW_ENABLED', val)
  },

  setRichTextFont ({commit}, val) {
    settings.set('richtextEditor.font', val)
    commit('SET_RICHTEXT_FONT', val)
  },

  setLoadStrategy ({commit}, val) {
    settings.set('loadStrategy', val)
    commit('SET_LOAD_STRATEGY', val)
  },

  setDefaultNotebook ({commit}, payload) {
    commit('SET_DEFAULT_NOTEBOOK', payload)
  },

  setKeyboardShortcut ({commit}, payload) {
    settings.set('keyboardShortcuts.' + payload.name, payload.keyCombo)
    commit('SET_KEYBOARD_SHORTCUT', payload)
  },

  setAutoHideMenuBar ({commit}, val) {
    settings.set('autoHideMenuBar', val)
    commit('SET_AUTO_HIDE_MENUBAR', val)
    const win = remote.getCurrentWindow()
    win.setAutoHideMenuBar(val)
    // If the menubar is not visible, set it.
    if (!val) {
      if (!win.isMenuBarVisible()) {
        win.setMenuBarVisibility(true)
      }
    }
  }

}

export default {
  state,
  mutations,
  actions
}
