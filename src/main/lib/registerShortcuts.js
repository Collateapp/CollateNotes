// Binds keyboard shortcut to action that runs in main.js

import {BrowserWindow} from 'electron'
import localShortcut from 'electron-localshortcut'
import settings from 'electron-settings'
import log from 'electron-log'
import ShortcutConverter from '../../shared/shortcutConverter'

export default function (targetWin) {
  const shortcutAccelerators = settings.get('keyboardShortcuts')
  const SC = new ShortcutConverter()
  const shortcutActions = {
    findOnPage: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutFindOnPage')
      }
    },
    searchNotes: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutSearchNotes')
      }
    },
    notebookPaneUp: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        targetWin.webContents.send('keyboardShortcutNotebook', 'notebookPaneUp')
      }
    },
    notebookPaneDown: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutNotebook', 'notebookPaneDown')
      }
    },
    notePaneUp: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutNote', 'notePaneUp')
      }
    },
    notePaneDown: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutNote', 'notePaneDown')
      }
    },
    notePaneFirst: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutNote', 'notePaneFirst')
      }
    },
    notePaneLast: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcutNote', 'notePaneLast')
      }
    },
    toggleHideNotebookPane: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcut')
      }
    },
    toggleHideNotePane: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcut')
      }
    },
    openActiveNoteInEditor: () => {
      const win = BrowserWindow.getFocusedWindow()
      if (win) {
        win.webContents.send('keyboardShortcut')
      }
    }
  }

  for (let shortcutName in shortcutActions) {
    const accelerator = SC.toElectron(shortcutAccelerators[shortcutName])
    if (accelerator == null || !accelerator) {
      log.info('Blank accelerator, skipping')
    } else {
      log.info('Registering shortcut', shortcutName, accelerator)
      localShortcut.register(accelerator, shortcutActions[shortcutName])
    }
  }
}
