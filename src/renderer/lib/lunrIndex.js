import lunr from 'lunr'
import striptags from 'striptags'
import log from 'electron-log'
// import debounce from '../lib/debounce.js'

// https://github.com/olivernn/lunr.js/issues/100
let searchMapper = function (noteId, col) {
  if (noteId === undefined || !noteId) return
  let note = col.notes[noteId]
  let attachments = []
  if (note != null && note.hasOwnProperty('attachments')) {
    for (let attachment of note.attachments) {
      attachments.push(attachment.name)
    }
  }
  return {
    id: note.id,
    title: note.metadata.title != null ? note.metadata.title : '',
    body: note.metadata.type === 'richtext' ? striptags(note.body) : note.body == null ? '' : note.body,
    attachments: attachments,
    tags: note.metadata.tags != null ? note.metadata.tags : []
  }
}

export function create (collectionId) {
  log.info('Creating search index')
  let start = window.performance.now()
  let col
  if (collectionId != null) {
    col = window.collate.collections[collectionId]
  } else {
    col = window.collate.collection
  }
  col.searchIndex = lunr()
  col.searchIndex.field('body')
  col.searchIndex.field('title', {boost: 10})
  col.searchIndex.field('tags')
  col.searchIndex.field('attachments')
  col.searchIndex.ref('id')
  for (let key of Object.keys(col.notes)) {
    try {
      const payload = searchMapper(key, col)
      col.searchIndex.add(payload)
    } catch (e) {
      log.error('Error while adding document to search index: ' + e)
      return
    }
  }
  const end = window.performance.now()
  window.collate.vue.$store.dispatch('genSearchIndex', false)
  log.info('Search index created. Took: ' + Math.floor((end - start) / 1000) + ' seconds')
}

export function createAsync (collectionId) {
  log.info('Creating search index')
  const start = window.performance.now()
  // Create the search index
  let col
  if (collectionId != null) {
    col = window.collate.collections[collectionId]
  } else {
    col = window.collate.collection
  }

  col.searchIndex = lunr()
  col.searchIndex.field('body')
  col.searchIndex.field('title', {boost: 10})
  col.searchIndex.field('tags')
  col.searchIndex.field('attachments')
  col.searchIndex.ref('id')
  // Get the notes and create a queue
  const notes = Object.keys(col.notes)
  const total = notes.length
  let queue = notes.slice()
  let count = 0
  // Begin recursive async function

  const addDoc = () => {
    setTimeout(() => {
      if (queue.length === 0) {
        let end = window.performance.now()
        log.info('Search index created. Took: ' + Math.floor((end - start) / 1000) + ' seconds')
        window.collate.vue.$store.dispatch('genSearchIndex', false)
        return
      }
      try {
        const doc = searchMapper(queue.pop(), col)
        col.searchIndex.add(doc)
        count++
        if (count === total) {
          window.collate.vue.$store.dispatch('updateProgressPercentage', 0)
        } else {
          window.collate.vue.$store.dispatch('updateProgressPercentage', Math.floor((1 - (queue.length / total)) * 100))
        }
        log.debug('Added document ' + doc.title + ' ' + doc.id + ' ' + count + '/' + total)
      } catch (e) {
        log.error('Error while adding document to search index: ' + e)
        count++
      }
      addDoc()
    }, 0)
  }
  addDoc()
}

export function update (noteId, colId) {
  log.info('Updating search index for note ' + noteId)
  console.time('Update search index')
  let col
  if (colId != null) {
    col = window.collate.collections[colId]
  } else {
    col = window.collate.collection
  }

  if (col.searchIndex === undefined || noteId === undefined || !noteId) return
  try {
    col.searchIndex.update(searchMapper(noteId, col))
  } catch (e) {
    log.error('Error while updating search index: ' + e)
    return
  }

  console.timeEnd('Update search index')
}

export function remove (noteId, colId) {
  log.info('Remove note from search index ' + noteId)
  console.time('Remove note from search index')
  let col
  if (colId != null) {
    col = window.collate.collections[colId]
  } else {
    col = window.collate.collection
  }
  if (col.searchIndex === undefined || noteId === undefined || !noteId) return
  try {
    col.searchIndex.remove({id: noteId})
  } catch (e) {
    log.error('Error while removing note from search index: ' + e)
    return
  }
  console.timeEnd('Remove note from search index')
}

export function add (noteId, colId) {
  log.info('Add note to search index ' + noteId)
  console.time('Add note to search index')
  let col
  if (colId != null) {
    col = window.collate.collections[colId]
  } else {
    col = window.collate.collection
  }
  if (col.searchIndex == null || noteId == null || !noteId) return
  try {
    col.searchIndex.add(searchMapper(noteId, col))
  } catch (e) {
    log.error('Error while adding a note to search index: ' + e)
    return
  }
  console.timeEnd('Add note to search index')
}
