// Initialize settings and set up default settings

import settings from 'electron-settings'
import fs from 'fs-extra'
import defaultSettings from '../../shared/defaultSettings.js'
import log from 'electron-log'
// Default settings used by electron-settings

export default function () {
  // Check if the settings file exists
  let settingsPath = settings.file()

  // If the settings file doesn't exist, set it
  if (!fs.existsSync(settingsPath)) {
    try {
      fs.ensureFileSync(settingsPath)
    } catch (e) {
      log.error('Error encountered while initializing settings at ' + settingsPath)
      throw Error('Error encountered while initializing settings at ' + settingsPath)
    }
    settings.setAll(defaultSettings)
  }
}
