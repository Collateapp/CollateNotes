import log from 'electron-log'

export default {
  /**
   * Lock a file
   */
  lock (noteId, windowId) {
    try {
      let locks = JSON.parse(localStorage.getItem('lock'))
      locks[windowId] = noteId
      localStorage.setItem('lock', JSON.stringify(locks))
      return true
    } catch (e) {
      log.error('Error occurred while locking note ' + e)
      return false
    }
  },

  /**
   *  Unlock a file
   */
  unlock (nodeId, windowId) {
    try {
      let locks = JSON.parse(localStorage.getItem('lock'))
      delete locks[windowId]
      localStorage.setItem('lock', JSON.stringify(locks))
      return true
    } catch (e) {
      log.error('Error occurred while unlocking note ' + e)
      return false
    }
  },

  /**
   * Check if file is locked.
   */
  isLocked (noteId, windowId) {
    let locks = JSON.parse(localStorage.getItem('lock'))
    if (typeof locks !== 'object' || locks === null) {
      locks = {}
      localStorage.setItem('lock', JSON.stringify(locks))
    }
    for (let winId of Object.keys(locks)) {
      if (locks[winId] === noteId && winId !== windowId) {
        return true
      }
    }
    return false
  },

  /**
   * Take control of a note
   */
  hijack (noteId, windowId) {
    try {
      let locks = JSON.parse(localStorage.getItem('lock'))
      // Remove lock from other windows
      for (let winId of Object.keys(locks)) {
        if (locks[winId] === noteId) {
          delete locks[winId]
        }
      }
      locks[windowId] = noteId
      localStorage.setItem('lock', JSON.stringify(locks))
      return true
    } catch (e) {
      log.error('Error occurred while hijacking locked note ' + e)
      return false
    }
  },

  clear (windowId) {
    let locks = JSON.parse(localStorage.getItem('lock'))
    if (typeof locks[windowId] !== 'undefined') {
      delete locks[windowId]
    }
    localStorage.setItem('lock', JSON.stringify(locks))
  },

  clearAll () {
    localStorage.clear()
  },

  validateWindows () {

  }
}
