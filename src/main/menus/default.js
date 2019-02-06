import {app, BrowserWindow} from 'electron'
import {createWindow} from '../index.js'
import settings from 'electron-settings'
import log from 'electron-log'
import merge from 'deepmerge'
import PersistData from '../lib/persistData.js'
import ShortcutConverter from '../../shared/shortcutConverter.js'
import defaultKeys from '../../shared/defaultSettings.js'

let keyboardShortcuts
try {
  keyboardShortcuts = merge(defaultKeys.keyboardShortcuts, settings.get('keyboardShortcuts', {}))
} catch (e) {
  log.warn('Settings don\'t exist, using defaults ' + e)
  keyboardShortcuts = defaultKeys.keyboardShortcuts
}

const SC = new ShortcutConverter()

let defaultMenu = [
  {
    label: app.getName(),
    submenu: [
      {
        label: 'About',
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('about', 'true')
          } else {
            const allWindows = BrowserWindow.getAllWindows()
            if (allWindows.length === 0) {
              win = createWindow({context: 'about'})
            } else {
              for (let i = 0; i < allWindows.length; i++) {
                if (allWindows[i].hasOwnProperty('init') && allWindows[i].init.hasOwnProperty('type')) {
                  if (allWindows[i].init.type === 'main' || allWindows[i].init.type === 'settings' || allWindows[i].init.type === 'about' || allWindows[i].init.type === 'collectionPane') {
                    return allWindows[i].webContents.send('about', 'true')
                  }
                }
              }
              win = createWindow({context: 'about'})
            }
          }
        }
      },
      {
        'type': 'separator'
      },
      {
        label: 'Collections',
        accelerator: SC.toElectron(keyboardShortcuts.collectionPane),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('collectionPane', 'true')
          } else {
            const allWindows = BrowserWindow.getAllWindows()
            if (allWindows.length === 0) {
              win = createWindow({context: 'collectionPane'})
            } else {
              for (let i = 0; i < allWindows.length; i++) {
                if (allWindows[i].hasOwnProperty('init') && allWindows[i].init.hasOwnProperty('type')) {
                  if (allWindows[i].init.type === 'main') {
                    return allWindows[i].webContents.send('collectionPane', 'true')
                  }
                }
              }
              win = createWindow({context: 'collectionPane'})
            }
          }
        }
      },
      {
        label: 'New Window',
        accelerator: SC.toElectron(keyboardShortcuts.newWindow),
        click: () => {
          createWindow()
        }
      },
      {
        label: 'Settings',
        accelerator: SC.toElectron(keyboardShortcuts.settings),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('settings', 'true')
          } else {
            const allWindows = BrowserWindow.getAllWindows()
            if (allWindows.length === 0) {
              win = createWindow({context: 'settings'})
            } else {
              for (let i = 0; i < allWindows.length; i++) {
                if (allWindows[i].hasOwnProperty('init') && allWindows[i].init.hasOwnProperty('type')) {
                  if (allWindows[i].init.type === 'main') {
                    return allWindows[i].webContents.send('settings', 'true')
                  }
                }
              }
              win = createWindow({context: 'settings'})
            }
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Import',
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('import', 'true')
          } else {
            const allWindows = BrowserWindow.getAllWindows()
            if (allWindows.length === 0) {
              win = createWindow({context: 'import'})
            } else {
              for (let i = 0; i < allWindows.length; i++) {
                if (allWindows[i].hasOwnProperty('init') && allWindows[i].init.hasOwnProperty('type')) {
                  if (allWindows[i].init.type === 'main') {
                    return allWindows[i].webContents.send('import', 'true')
                  }
                }
              }
              win = createWindow({context: 'import'})
            }
          }
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: SC.toElectron(keyboardShortcuts.quitProgram),
        click: () => {
          app.quit()
        }
      }
    ]
  },
  {
    label: 'File',
    submenu: [
      {
        label: 'New Notebook',
        accelerator: SC.toElectron(keyboardShortcuts.newNotebook),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('newNotebook', 'true')
          }
        }
      },
      {
        label: 'New Note',
        accelerator: SC.toElectron(keyboardShortcuts.newNote),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('newNote', 'true')
          }
        }
      },
      {
        label: 'Save',
        accelerator: SC.toElectron(keyboardShortcuts.saveNote),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('save', 'true')
          }
        }
      },
      {
        'type': 'separator'
      },
      {
        label: 'Delete Active Notebook',
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('deleteNotebook', 'true')
          }
        }
      },
      {
        label: 'Delete Active Note',
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('deleteNote', 'true')
          }
        }
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
        accelerator: 'CmdOrCtrl+Z',
        selector: 'undo:'
      },
      {
        role: 'redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        selector: 'redo:'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut',
        accelerator: 'CmdOrCtrl+X',
        selector: 'cut:'
      },
      {
        role: 'copy',
        accelerator: 'CmdOrCtrl+C',
        selector: 'copy:'
      },
      {
        role: 'paste',
        accelerator: 'CmdOrCtrl+V',
        selector: 'paste:'
      },
      {
        role: 'pasteandmatchstyle',
        accelerator: 'CmdOrCtrl+Shift+V',
        selector: 'paste:'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall',
        accelerator: 'CmdOrCtrl+A',
        selector: 'selectAll:'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Open Help Pane',
        accelerator: SC.toElectron(keyboardShortcuts.showHelpPane),
        click: () => {
          let win = BrowserWindow.getFocusedWindow()
          if (win) {
            win.webContents.send('helpPane', false)
          }
        }
      }
    ]
  }
]
// Add additional menu items
const persist = new PersistData()
const devTools = persist.getKey('devtools')
if (process.env.NODE_ENV === 'development' || devTools) {
  defaultMenu.push({
    label: 'Developer',
    submenu: [
      {
        role: 'toggledevtools'
      },
      {
        role: 'reload'
      }
    ]
  })
}

export default defaultMenu
