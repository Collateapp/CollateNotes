// Convert between Collection:/// protocol and relative path.
import path from 'path'
import fileURL from '../renderer/lib/fileUrl.js'

let converter = {}

// Convert from collection:/// to relative path ./
converter.toFile = function (text) {
  const notePathRE = new RegExp(/(\(|"|')?(collection:\/\/?)(\/.*)(\/attachments\/.*)(\)|"|')?/g)
  return text.replace(notePathRE, function (match, g1, g2, g3, g4, g5) {
    g1 = g1 == null ? '' : g1
    g5 = g5 == null ? '' : g5
    return g1 + '.' + decodeURI(g4) + g5
  })
}

// Convert from relative path ./attachment/blah.jpg to collection:///notebook/note/attachments/blah.jpg
converter.fromFile = function (collectionPath, notePath, text) {
  const re = new RegExp(/(\(|"|')?\.(\/attachments\/.*)(\)|"|')?/g)
  return text.replace(re, function (match, g1, g2, g3) {
    g1 = g1 == null ? '' : g1
    g3 = g3 == null ? '' : g3
    return g1 + fileURL(path.join(notePath, g2), 0) + g3
  })
}

export default converter
