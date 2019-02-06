
// Converter class that takes a general set of keyboard shortcuts
// and turns them into objects that can convert to any other systems
export default class ShortcutConverter {
  parseString (keyString) {
    let keyObj = {
      shift: false,
      cmdOrCtrl: false,
      alt: false,
      key: ''
    }
    let keys = keyString.trim().split('-')
    for (let key of keys) {
      switch (key.toLowerCase()) {
        case 'shift':
          keyObj.shift = true
          break
        case 'ctrl':
        case 'control':
        case 'command':
        case 'cmd':
          keyObj.cmdOrCtrl = true
          break
        case 'alt':
        case 'option':
        case 'opt':
          keyObj.alt = true
          break
        case 'pgup':
        case 'pageup':
          keyObj.key = 'PageUp'
          break
        case 'pgdown':
        case 'pagedown':
          keyObj.key = 'PageDown'
          break
        default:
          keyObj.key = key
      }
    }
    return keyObj
  }

  toElectron (key) {
    if (key == null || !key) return ''
    let keyObj = this.parseString(key)
    let keyString = []
    if (keyObj.cmdOrCtrl) {
      keyString.push('CmdOrCtrl')
    }
    if (keyObj.shift) {
      keyString.push('Shift')
    }
    if (keyObj.alt) {
      keyString.push('Alt')
    }
    keyString.push(this.capitalize(keyObj.key))
    return keyString.join('+')
  }

  toSimpleMDE (key) {
    if (key == null || !key) return ''
    let keyObj = this.parseString(key)
    let keyString = []
    if (keyObj.cmdOrCtrl) {
      keyString.push('Ctrl')
    }
    if (keyObj.shift) {
      keyString.push('Shift')
    }
    if (keyObj.alt) {
      keyString.push('Alt')
    }
    keyString.push(this.capitalize(keyObj.key))
    return keyString.join('-')
  }

  toQuill (key) {
    if (key == null || !key) return {}
    let keyObj = this.parseString(key)
    let quillKey = {}

    if (keyObj.cmdOrCtrl) {
      quillKey.shortKey = true
    }
    if (keyObj.shift) {
      quillKey.shiftKey = true
    }
    if (keyObj.alt) {
      quillKey.altKey = true
    }
    quillKey.key = this.capitalize(keyObj.key)
    return quillKey
  }

  capitalize (str) {
    try {
      return str.charAt(0).toUpperCase() + str.slice(1)
    } catch (e) {
      return str
    }
  }
}
