// On first run, save a JSON object to user's user data that keeps
// track of when they first opened the application.

import {app} from 'electron'
import path from 'path'
import fs from 'fs-extra'
import log from 'electron-log'

class PersistData {
  constructor () {
    this.userDataPath = app.getPath('userData')
    this.persistDataPath = path.join(this.userDataPath, 'persist.json')
    this.data = this.getData()
    log.debug('PersistData | Path: ' + this.persistDataPath + ' | Data:' + this.data)
  }

  getKey (key) {
    let data = this.getData()
    if (key in data) {
      return data[key]
    } else {
      return null
    }
  }

  getData () {
    if (fs.existsSync(this.persistDataPath)) {
      return JSON.parse(fs.readFileSync(this.persistDataPath, 'utf8'))
    } else {
      return null
    }
  }

  setKey (key, value) {
    let payload = {}
    payload[key] = value
    this.setData(payload)
  }

  setData (payload) {
    if (typeof payload !== 'object') {
      throw Error('Non object passed into setData')
    }
    const currentData = this.getData()
    let combinedData
    if (currentData) {
      combinedData = Object.assign(currentData, payload)
    } else {
      combinedData = payload
    }
    this.data = Object.assign(this.getData(), combinedData)
    if (!fs.existsSync(this.persistDataPath)) {
      try {
        fs.ensureFileSync(this.persistDataPath)
      } catch (e) {
        log.error('Error encountered while setting persist data ' + this.persistDataPath + ' ' + e)
        throw new Error('Error encountered while setting persist data ' + this.persistDataPath + ' ' + e)
      }
    }
    try {
      fs.writeFileSync(this.persistDataPath, JSON.stringify(this.data))
    } catch (e) {
      log.error('Error encountered while writing persist data' + this.persistDataPath + ' ' + e)
      throw new Error('Error encountered while writing persist data' + this.persistDataPath + ' ' + e)
    }
  }
}
export default PersistData
