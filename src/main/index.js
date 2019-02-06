'use strict'

import { Menu, shell, app, BrowserWindow, ipcMain, dialog } from 'electron'

import log from 'electron-log'
import settings from 'electron-settings'
import windowStateKeeper from 'electron-window-state'
import merge from 'deepmerge'

import defaultMenu from './menus/default.js'
import registerShortcuts from './lib/registerShortcuts.js'
import registerFileProtocol from './lib/registerProtocol.js'
import initSettings from './lib/initSettings.js'
import defaultSettings from '../shared/defaultSettings.js'

// Configure logging
log.transports.console.format = '{h}:{i}:{s} | {level} | {text}'
log.transports.console.level = 'debug'
log.info('Loading Main Process. Environment: ' + process.env.NODE_ENV)

let mainWindow
let editorWindow
let printWindow

// Merge default settings with saved settings and save
settings.setAll(merge(defaultSettings, settings.getAll()))

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

export function createWindow (params) {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 1200,
    defaultHeight: 800
  })

  mainWindow = new BrowserWindow({
    show: false,
    height: mainWindowState.height,
    width: mainWindowState.width,
    x: mainWindowState.x,
    y: mainWindowState.y,
    minHeight: 200,
    minWidth: 850,
    title: 'Collate',
    autoHideMenuBar: settings.get('autoHideMenuBar', false)
  })

  mainWindow.init = {
    type: 'main'
  }

  if (params != null && params.context != null) {
    mainWindow.init = {
      type: params.context
    }
  }

  mainWindow.loadURL(winURL)

  mainWindow.on('ready-to-show', function () {
    log.info('Main window ready to show')
    mainWindowState.manage(mainWindow)

    mainWindow.show()
    mainWindow.focus()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Crash handler.  Log and show an error box.
  // Test in the renderer with process.crash()
  mainWindow.webContents.on('crashed', function (event) {
    log.error('Main window crashed ' + event)
    dialog.showMessageBox({
      type: 'error',
      title: 'Collate has crashed',
      message: 'Collate has crashed.  Please report this error at http://collatenotes.com/bug-report'
    }, function (response) {
      app.quit()
    })
  })

  // If a link is clicked on, open in external browser
  let wc = mainWindow.webContents
  wc.on('will-navigate', function (e, url) {
    if (url !== wc.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })

  const menu = Menu.buildFromTemplate(defaultMenu)
  Menu.setApplicationMenu(menu)

  // eslint-disable-next-line no-console
  log.info('mainWindow opened')
}

export function createEditorWindow (params = {}) {
  log.info('Opening editor window')

  let editorWindowState = windowStateKeeper({
    file: 'editor-window-state.json',
    defaultWidth: 600,
    defaultHeight: 800
  })

  editorWindow = new BrowserWindow({
    show: false,
    height: editorWindowState.height,
    width: editorWindowState.width,
    x: editorWindowState.x,
    y: editorWindowState.y,
    minWidth: 500,
    minHeight: 200,
    title: 'Collate',
    autoHideMenuBar: settings.get('autoHideMenuBar', false)
  })

  editorWindowState.manage(editorWindow)

  editorWindow.setMenu(null)
  editorWindow.loadURL(winURL)
  log.info('Setting editor window init settings. Notebook: ' + params.notebookId + ' Note:' + params.noteId)

  editorWindow.init = {
    type: 'editor',
    notebookId: params.notebookId,
    noteId: params.noteId,
    collection: params.collection,
    autoHideMenuBar: settings.get('autoHideMenuBar', false)
  }

  editorWindow.on('ready-to-show', function () {
    editorWindow.show()
    editorWindow.focus()
    log.info('Editor window opened')
  })

  editorWindow.on('closed', () => {
    printWindow = null
  })

  // Crash handler.  Log and show an error box.
  // Test in the renderer with process.crash()
  editorWindow.webContents.on('crashed', function (event) {
    log.error('Main window crashed ' + event)
    dialog.showMessageBox({
      type: 'error',
      title: 'Collate has crashed',
      message: 'Collate has crashed.  Please report this error at http://collatenotes.com/bug-report'
    }, function (response) {
      app.quit()
    })
  })

  // If a link is clicked on, open in external browser
  let wc = editorWindow.webContents
  wc.on('will-navigate', function (e, url) {
    if (url !== wc.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })
}

export function createPrintWindow (params = {}) {
  log.info('Creating print window')

  let printWindowState = windowStateKeeper({
    file: 'print-window-state.json',
    defaultWidth: 800,
    defaultHeight: 1000
  })

  printWindow = new BrowserWindow({
    show: false,
    height: printWindowState.height,
    width: printWindowState.width,
    x: printWindowState.x,
    y: printWindowState.y,
    minWidth: 600,
    title: 'Print'
  })

  printWindowState.manage(printWindow)

  printWindow.setMenu(null)
  printWindow.loadURL(winURL)

  printWindow.init = {
    type: 'print',
    html: params.html,
    activeNote: params.activeNote
  }

  printWindow.on('ready-to-show', function () {
    printWindow.show()
    printWindow.focus()
    log.info('Print window opened')
  })
  printWindow.on('closed', () => {
    printWindow = null
  })

  // Crash handler.  Log and show an error box.
  // Test in the renderer with process.crash()
  printWindow.webContents.on('crashed', function (event) {
    log.error('Main window crashed ' + event)
    dialog.showMessageBox({
      type: 'error',
      title: 'Collate has crashed',
      message: 'Collate has crashed.  Please report this error at http://collatenotes.com/bug-report'
    }, function (response) {
      app.quit()
    })
  })

  // If a link is clicked on, open in external browser
  let wc = printWindow.webContents
  wc.on('will-navigate', function (e, url) {
    if (url !== wc.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  })
}

// !!This must be the first thing that gets initialized on app ready.
app.on('ready', function () {
  initSettings()
  // Custom protocol for collection://
  registerFileProtocol()

  // Create main window
  createWindow()
})

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Communications
ipcMain.on('openEditor', (event, arg) => {
  createEditorWindow(arg)
})

ipcMain.on('openPrint', (event, arg) => {
  createPrintWindow(arg)
})

ipcMain.on('quit', function (e) {
  mainWindow.close()
})

ipcMain.on('registerShortcuts', function (event) {
  registerShortcuts()
})
