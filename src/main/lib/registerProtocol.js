// Register the collection:// file protocol

import { protocol } from 'electron'
import path from 'path'
import log from 'electron-log'

export default function () {
  log.info('Registering collection:// handler')
  protocol.registerFileProtocol('collection', (request, callback) => {
    const url = unescape(request.url.substr(12))
    log.info('Collection path handler: ' + path.normalize(url))
    callback({path: path.normalize(url)}) // eslint-disable-line
  }, (error) => {
    if (error) log.error('Failed to register protocol')
  })
  log.info('Finished registering collection:// handler')
}
