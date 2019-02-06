import fs from 'fs-extra'
import path from 'path'
import matter from 'gray-matter'
import moment from 'moment'
import md5hex from 'md5-hex'
import md5file from 'md5-file'
import log from 'electron-log'
import junk from '../../shared/junk.js'

import Collection from './Collection.js'
import defaultDocs from './defaults/defaultDocs.js'
import webpageify from '../lib/webpageify.js'
import protoConverter from '../../shared/protocolConverter'

/**
* Collection Loader
* Bootstraps the creation of a collection.
*
* @param {string} path Path to the collection
* @param {boolean} newCollection Create intro notebook and note in collectionPath
* @return {Collection} void Collection A collection object populated with data
**/
export default class CollectionLoader {
  constructor (path, newCollection = false) {
    let collection = new Collection(path)
    if (newCollection) {
      this.newCollection(collection)
    }
    return this.loadCollection(collection)
  }

  /**
   * Generates scaffold for a new collection
   */
  newCollection (collection) {
    const newNotebookName = 'Notes'
    const newNotebookPath = path.join(collection.collectionPath, newNotebookName)

    // Create inbox folder
    if (!fs.existsSync(newNotebookPath)) {
      try {
        fs.mkdirSync(newNotebookPath)
      } catch (e) {
        log.error('Error occurred while creating a new collection ' + e)
        throw new Error('Error occurred while creating a new collection ' + e)
      }
    }

    for (let doc of defaultDocs) {
      let notePath = path.join(newNotebookPath, doc.fileName)
      try {
        fs.mkdirSync(notePath)
      } catch (e) {
        log.error('Error occurred while creating note ' + e)
        throw new Error('Error occurred while creating note ' + e)
      }
      let noteFilePath = path.join(notePath, doc.noteFileName)
      try {
        fs.writeFileSync(noteFilePath, matter.stringify(doc.body, doc.frontmatter))
      } catch (e) {
        log.error('Error occurred while creating note file ' + noteFilePath + ' ' + e)
        throw new Error('Error occurred while creating note file ' + noteFilePath + ' ' + e)
      }
    }
  }
  /**
   * Takes a directory containing a Collate collection and converts it into
   * a Collection object.
   * @param {string} collectionPath Path to collection in file system.
   */
  loadCollection (collection) {
    console.time('Collection Loader')
    log.info('Beginning to load collection')
    // Open up the collection and loop through files and folders available
    const notebooks = fs.readdirSync(collection.collectionPath)
    const cleanedNotebooks = notebooks.filter(junk.not)
    for (let i = 0; i < cleanedNotebooks.length; i++) {
      log.debug('Loading notebook ' + cleanedNotebooks[i])
      try {
        let notebook = {}
        notebook.name = cleanedNotebooks[i]
        notebook.path = path.join(collection.collectionPath, notebook.name)

        const notebookStats = fs.statSync(notebook.path)
        if (notebookStats.isDirectory()) {
          notebook.id = this.generateId(notebook.path)
          notebook.displayName = this.toDisplayName(notebook.name)
          notebook.modified = moment(notebookStats.mtime)
          notebook.created = moment(notebookStats.birthtime)
          notebook.notes = []

          collection.notebooks[notebook.id] = notebook

          // Open notebook and loop through notes
          log.debug('Loading Notes')
          const notes = fs.readdirSync(notebook.path)
          const cleanedNotes = notes.filter(junk.not)
          for (let j = 0; j < cleanedNotes.length; j++) {
            log.debug('Loading Note ' + cleanedNotes[j])
            try {
              let note = {}
              note.name = cleanedNotes[j]
              note.path = path.join(notebook.path, note.name)
              const noteStats = fs.statSync(note.path)
              if (noteStats.isDirectory()) {
                // Instantiate a Note object and fill it with data available up to this point.
                note.notebook = notebook.id
                note.id = this.generateId(note.path)
                note.displayName = this.toDisplayName(note.name)
                note.file = ''
                note.fileHash = ''
                note.body = ''
                note.attachments = []
                note.metadata = {
                  title: this.toDisplayName(note.name),
                  tags: [],
                  type: 'markdown',
                  created: '',
                  modified: ''
                }

                // Open up note and go through the note contents
                const noteContents = fs.readdirSync(note.path)
                const cleanedNoteContents = noteContents.filter(junk.not)
                for (let k = 0; k < cleanedNoteContents.length; k++) {
                  const noteContent = path.join(note.path, cleanedNoteContents[k])
                  if (cleanedNoteContents[k] === 'attachments') {
                    try {
                      // Open up the attachments directory and create attachment objects
                      if (fs.existsSync(noteContent)) {
                        const attachments = fs.readdirSync(noteContent)
                        const cleanedAttachments = attachments.filter(junk.not)
                        for (let file of cleanedAttachments) {
                          let attachment = {}
                          attachment.path = path.join(noteContent, file)
                          attachment.name = file
                          attachment.id = this.generateId(attachment.path)
                          note.attachments.push(attachment)
                        }
                      } else {
                        log.error('Error, Attachment directory does not exist.')
                      }
                    } catch (e) {
                      log.error('An error occurred while loading attachment directory ' + noteContent)
                    }
                  } else if (cleanedNoteContents[k].endsWith('.md')) {
                    try {
                      // Read and parse the note file content
                      log.debug('Note file detected, loading ' + noteContent)
                      note.file = noteContent
                      note.fileHash = md5file.sync(noteContent)
                      const fileContents = matter(fs.readFileSync(noteContent, 'utf8'))
                      const noteFileStats = fs.statSync(note.file)
                      note.body = (fileContents.content != null) ? fileContents.content : ''
                      note.body = protoConverter.fromFile(collection.collectionPath, note.path, note.body)
                      note.metadata.created = fileContents.data.created == null ? moment(noteFileStats.birthtime) : fileContents.data.created
                      note.metadata.modified = fileContents.data.modified == null ? moment(noteFileStats.mtime) : fileContents.data.modified
                      note.metadata = Object.assign(note.metadata, fileContents.data)

                      for (let field in note.metadata) {
                        if (field === 'created' || field === 'modified') {
                          note.metadata[field] = moment(note.metadata[field])
                        }
                      }
                    } catch (e) {
                      log.warn('An error occurred while loading note file at ' + noteContent + ' ' + JSON.stringify(e))
                    }
                  } else if (cleanedNoteContents[k].endsWith('.html')) {
                    try {
                      note.file = noteContent
                      note.fileHash = md5file.sync(noteContent)
                      const fileContents = webpageify(fs.readFileSync(noteContent, 'utf8'))
                      const noteFileStats = fs.statSync(note.file)
                      note.body = (fileContents.content != null) ? fileContents.content : ''
                      note.body = protoConverter.fromFile(collection.collectionPath, note.path, note.body)

                      const defaultMetadata = {
                        title: '',
                        tags: [],
                        type: 'richtext',
                        created: fileContents.data.created == null ? moment(noteFileStats.birthtime) : fileContents.data.created,
                        modified: fileContents.data.modified == null ? moment(noteFileStats.mtime) : fileContents.data.modified
                      }
                      note.metadata = Object.assign(defaultMetadata, fileContents.data)

                      for (let field in note.metadata) {
                        if (field === 'created' || field === 'modified') {
                          note.metadata[field] = moment(note.metadata[field])
                        } else if (field === 'delta') {
                          for (let op of note.metadata.delta.ops) {
                            if (op.hasOwnProperty('insert') && op.insert.hasOwnProperty('image')) {
                              op.insert.image = protoConverter.fromFile(collection.collectionPath, note.path, op.insert.image)
                            }
                          }
                        }
                      }
                    } catch (e) {
                      log.error('An error occurred while loading note file at ' + noteContent + ' ' + JSON.stringify(e))
                    }
                  } else {
                    log.warn('A file not specified by the Collate Note Format found ' + note.path + ' ' + cleanedNoteContents[k])
                  }
                }

                notebook.notes.push(note.id)
                collection.notes[note.id] = note

                // Push reference to note to collection.tags.
                for (let tag of note.metadata.tags) {
                  if (tag in collection.tags) {
                    if (!collection.tags[tag].includes(note.id)) {
                      collection.tags[tag].push(note.id)
                    }
                  } else {
                    collection.tags[tag] = [note.id]
                  }
                }
              }
            } catch (e) {
              log.error('Error encountered while loading note ', cleanedNotes[j], ' error ', JSON.stringify(e))
              continue
            }
          }
        }
      } catch (e) {
        log.error('Error encountered while loading notebook', cleanedNotebooks[i], JSON.stringify(e))
        continue
      }
    }
    console.timeEnd('Collection Loader')
    return collection
  }

  /**
   * Takes a path and generates a 16 character unique id.
   */
  generateId (path) {
    return md5hex(path).slice(0, 16)
  }

  /**
   * Takes a file name and turns it into a display name.
   */
  toDisplayName (title) {
    let suffixes = [
      '.notebook',
      '.inbox',
      '.note',
      '.md'
    ]

    // Yank off suffix
    for (let suffix of suffixes) {
      if (title.endsWith(suffix)) {
        title = title.replace(suffix, '')
      }
    }

    return title.split('-').join(' ')
  }
}
