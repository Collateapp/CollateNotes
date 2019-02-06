import fs from 'fs-extra'
import path from 'path'
import matter from 'gray-matter'
import moment from 'moment'
import md5hex from 'md5-hex'
import md5file from 'md5-file'
import striptags from 'striptags'
import log from 'electron-log'
import sanitize from 'sanitize-filename'
import junk from '../../shared/junk.js'
import protoConverter from '../../shared/protocolConverter.js'

import webpageify from '../lib/webpageify.js'

export default class Collection {
  constructor (collectionPath) {
    this.collectionPath = collectionPath
    this.id = this._generateId(collectionPath)
    this.name = path.basename(collectionPath)
    this.notebooks = {}
    this.notes = {}
    this.tags = {}
  }

  /**
   * Given an id, it will return the associated object if its a Notebook, Note or Tag.
   */
  getId (id) {
    let note = this.notes[id]
    let notebook = this.notebooks[id]
    let tag = this.tags[id]
    if (typeof note === 'object') {
      return note
    }
    if (typeof notebook === 'object') {
      return notebook
    }
    if (typeof tag === 'object') {
      return tag
    }
    return {}
  }

  /**
   *  Retrieve all notebooks.
   */
  getNotebooks () {
    return Object.values(this.notebooks)
  }

  /**
   * Create a new notebook given a name
   * @param {string} name Name of the new notebook
   * @return {id} Returns notebook id of newly created notebook
   */
  createNotebook (name) {
    return new Promise((resolve, reject) => {
      let notebook = {}
      notebook.name = this._titleToFileName(name, '')
      notebook.displayName = this._toDisplayName(notebook.name)
      notebook.path = path.join(this.collectionPath, notebook.name)
      notebook.id = this._generateId(notebook.path)
      notebook.notes = []

      fs.mkdir(notebook.path, err => {
        if (err) {
          log.error('Error encountered while creating notebook ' + err)
          return reject(err)
        }
        this.notebooks[notebook.id] = notebook
        return resolve(notebook.id)
      })
    })
  }

  /**
   * Renames a notebook folder,
   * @param {string} notebookId 16 Character Id for notebook object
   * @param {string} newName The new notebook name
   * @return {string} newNotebookId The notebookId for new notebook path.
   */
  renameNotebook (notebookId, newName) {
    return new Promise((resolve, reject) => {
      console.time('renameNotebook')
      const notebook = this.notebooks[notebookId]
      if (notebook == null || !notebook) {
        return reject(new Error('Notebook at id ' + notebookId + ' does not exist'))
      }
      const newNotebookName = this._titleToFileName(newName, '')
      const newNotebookPath = path.join(this.collectionPath, newNotebookName)
      const newNotebookId = this._generateId(newNotebookPath)
      fs.rename(notebook.path, newNotebookPath, err => {
        if (err) {
          log.error('Failed to move notebook from ' + notebook.path + ' to ' + newNotebookPath + ' ' + err)
          return reject(err)
        }
        // Re-reference notebook under new id
        this.notebooks[newNotebookId] = notebook

        // De-reference old notebook id
        delete this.notebooks[notebookId]

        // Update values in the notebook itself
        notebook.id = newNotebookId
        notebook.name = newNotebookName
        notebook.displayName = newName
        notebook.path = newNotebookPath

        // Loop through notes and update paths
        if (notebook.notes.length > 0) {
          for (let noteId of notebook.notes) {
            let note = this.notes[noteId]
            note.notebook = notebook.id
            note.path = path.join(this.collectionPath, notebook.name, note.name)
            note.file = path.join(this.collectionPath, notebook.name, note.name, path.basename(note.file))
          }
        }
        return resolve(newNotebookId)
      })
    })
  }

  /**
   * Delete a notebook and all files within it
   * @param {string} notebookId 16 character Id for notebook
   * @return {undefined}
   */
  deleteNotebook (notebookId) {
    return new Promise((resolve, reject) => {
      const notebook = this.notebooks[notebookId]
      // Loop through notes and run deleteNote to ensure a clean removal of notes
      let deleteProms = []
      for (let noteId of notebook.notes) {
        deleteProms.push(this.deleteNote(noteId))
      }
      Promise.all(deleteProms)
        .then(() => {
          fs.remove(notebook.path, err => {
            if (err) {
              return reject(err)
            }
            // Remove reference from notebook
            delete this.notebooks[notebookId]
            return resolve()
          })
        })
        .catch(err => {
          log.error('Error occurred while resolving delete note promises ' + err)
        })
    })
  }

  /**
   * Get an ordered and sorted list of Notes
   */
  getNotes (params = {}) {
    let defaults = {
      notebookId: '',
      // Query string
      query: '',
      // Note key to sort by: Notebook.modified || Notebook.created || notebook.name
      sortBy: 'modified',
      // true = ascending || false = descending
      asc: false,

      mode: 'basic'
    }

    // Merge in defaults
    params = Object.assign(defaults, params)

    // Execute the search for the note
    let filteredNotes = []
    if (params.query != null) {
      // Pull the contents of a notebook
      if (params.notebookId && !params.query) {
        for (let note of Object.values(this.notes)) {
          if (note.notebook === params.notebookId) {
            filteredNotes.push(note)
          }
        }
      // Pull the contents from a search
      } else if (params.query && !params.notebookId) {
        // If search index is available
        if (this.searchIndex != null && this.searchIndex && params.mode === 'indexed') {
          let searchResults = this.searchIndex.search(params.query)
          for (let hit of searchResults) {
            filteredNotes.push(this.notes[hit.ref])
          }
        // If the search index isn't available, fallback search method
        } else {
          let queryHit = (note, query) => {
            // Combine all criteria into one array of strings
            let criteria = [note.body, note.displayName, note.metadata.title]
            criteria.push.apply(criteria, note.metadata.tags)
            for (let attachment of note.attachments) {
              criteria.push(attachment.name)
            }
            for (let crit of criteria) {
              if (crit.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
                return true
              }
            }
            return false
          }
          log.info('Falling back to regular search ' + params.query)
          // Fallback search if search index not available.
          for (let noteId in this.notes) {
            const note = this.notes[noteId]
            if (queryHit(note, params.query)) {
              filteredNotes.push(note)
            }
          }
        }
      }
    }

    // Sort the filtered array
    filteredNotes = this._sortArrayOfObjects(filteredNotes, params.sortBy)

    // Invert
    if (!params.asc) {
      filteredNotes.reverse()
    }
    return filteredNotes
  }

  /**
   * Open a note file with given id, reload the data, then pass back the note object.
   */
  getNote (id) {
    return new Promise((resolve, reject) => {
      this._openNoteFile(id)
        .then(note => {
          this._refreshNoteAttachments(id)
            .then(note => {
              return resolve(note)
            })
            .catch(err => {
              return reject(err)
            })
        })
        .catch(err => {
          return reject(err)
        })
    })
  }

  /**
   *  Return tags
   */
  getTags (params) {
    return this.tags
  }

  /**
   * Given a tag, return an array of note objects
   */
  getNotesFromTags (params) {
    // Merge in default param values if not passed in
    params = Object.assign({
      tag: '',
      sortBy: 'modified',  // Note key to sort by: Notebook.modified || Notebook.created || notebook.name
      asc: false // true = ascending || false = descending
    }, params)
    if (params.tag == null) return {}

    let noteIds = this.tags[params.tag]
    let notes = []
    for (let noteId of noteIds) {
      if (this.notes[noteId] != null) {
        notes.push(this.notes[noteId])
      }
    }
    notes = this._sortArrayOfObjects(notes, params.sortBy)
    if (!params.asc) notes.reverse()
    return notes
  }

  /**
   * Create a new note in notebook
   * @param {string} name Name of new note
   * @param {string} 16 character notebook ID to place new note
   * @return {string} 16 character note ID of newly created note
   */
  createNote (name, notebookId, type) {
    return new Promise((resolve, reject) => {
      const notebook = this.notebooks[notebookId]
      if (notebook == null || !notebook) reject(new Error('Notebook not found ' + notebookId))

      // Create note and populate data
      let note = {}
      note.notebook = notebook.id
      note.name = this._titleToFileName(name, '')
      note.path = path.join(notebook.path, note.name)
      note.id = this._generateId(note.path)
      note.body = ''
      note.displayName = name
      note.attachments = []
      note.metadata = {}
      note.metadata.title = name
      note.metadata.created = moment()
      note.metadata.modified = moment()
      note.metadata.type = (typeof type !== 'undefined') ? type : 'markdown'
      note.metadata.tags = []
      let noteContents
      if (type === 'richtext') {
        noteContents = webpageify.stringify('', JSON.parse(JSON.stringify(Object.assign({}, note.metadata))))
        note.file = path.join(note.path, this._titleToFileName(name, '.html'))
      } else {
        noteContents = matter.stringify('', JSON.parse(JSON.stringify(Object.assign({}, note.metadata))))
        note.file = path.join(note.path, this._titleToFileName(name, '.md'))
      }
      fs.outputFile(note.file, noteContents, err => {
        if (err) {
          return reject(err)
        }
        note.fileHash = md5file(note.file, (err, hash) => {
          if (err) return reject(err)
          // Add the new note to notes
          this.notes[note.id] = note
          this.notebooks[notebookId].notes.push(note.id)
          return resolve(note.id)
        })
      })
    })
  }

  /**
   * Rename a note by updaing the file paths and note object in Collections.notes
   */
  renameNote (name, noteId) {
    return new Promise((resolve, reject) => {
      const note = this.notes[noteId]
      const notebook = this.notebooks[note.notebook]

      const newNoteName = this._titleToFileName(name, '')
      const newNotePath = path.join(notebook.path, newNoteName)
      let newNoteFileName
      if (note.metadata.type === 'richtext' || note.path.endsWith('.html')) {
        newNoteFileName = this._titleToFileName(name, '.html')
      } else {
        newNoteFileName = this._titleToFileName(name, '.md')
      }
      const intermediateNoteFilePath = path.join(note.path, newNoteFileName)
      const newNoteFilePath = path.join(newNotePath, newNoteFileName)

      // First rename the note file
      fs.rename(note.file, intermediateNoteFilePath, err => {
        if (err) return reject(err)

        // Then rename the note directory
        fs.rename(note.path, newNotePath, err => {
          if (err) {
            fs.rename(intermediateNoteFilePath, note.file, err => {
              if (err) return reject(err)
            })
          }

          log.debug('renamed ' + note.path + ' to ' + newNotePath)
          // Read in the note file to modify meta values
          fs.readFile(newNoteFilePath, 'utf8', (err, noteFileContents) => {
            if (err) {
              // If there is an error, roll back
              fs.rename(newNotePath, note.path, err => {
                if (err) return reject(err)
                fs.rename(intermediateNoteFilePath, note.file, err => {
                  if (err) return reject(err)
                })
              })
            }
            let parsedFileContents
            let newFileContents
            // Parse webpage content if richtext
            if (newNoteFilePath.endsWith('.html')) {
              parsedFileContents = webpageify(noteFileContents)
              parsedFileContents.data.title = name
              parsedFileContents.data.modified = moment()

              // Make sure any images inserted with a collate:/// protocol in the front matter is converted to relative path
              if (parsedFileContents.data.hasOwnProperty('delta') && parsedFileContents.data.delta.hasOwnProperty('ops')) {
                for (let op of parsedFileContents.data.delta.ops) {
                  if (op.hasOwnProperty('insert') && op.insert.hasOwnProperty('image')) {
                    op.insert.image = protoConverter.toFile(op.insert.image)
                  }
                }
              }
              newFileContents = webpageify.stringify(parsedFileContents.content, JSON.parse(JSON.stringify(Object.assign({}, parsedFileContents.data))))
            } else {
              // Parse markdown
              parsedFileContents = matter(noteFileContents)
              parsedFileContents.data.title = name
              parsedFileContents.data.modified = moment()
              newFileContents = matter.stringify(parsedFileContents.content, JSON.parse(JSON.stringify(Object.assign({}, parsedFileContents.data))))
            }
            // Write modified metadata
            fs.writeFile(newNoteFilePath, newFileContents, err => {
              if (err) return reject(err)

              // Get attachments if available
              const attachmentDir = path.join(newNotePath, 'attachments')
              fs.readdir(attachmentDir, (err, rawAttachments) => {
                if (err) {
                  console.log('no attachmentdir')
                  rawAttachments = []
                }
                const attachments = rawAttachments.filter(junk.not)
                // Modify the note object in Collection.notes
                const newId = this._generateId(newNotePath)
                let noteClone = Object.assign({}, note)
                delete this.notes[noteId]

                noteClone.id = newId
                noteClone.displayName = name
                noteClone.name = newNoteName
                noteClone.path = newNotePath
                noteClone.file = newNoteFilePath
                noteClone.fileHash = md5file.sync(noteClone.file)
                noteClone.metadata.title = name
                noteClone.metadata.modified = moment()
                noteClone.attachments = (typeof attachments !== 'undefined') ? attachments : []
                this.notes[newId] = noteClone
                log.debug('new note', noteClone)
                return resolve(newId)
              })
            })
          })
        })
      })
    })
  }

  moveNote (noteId, targetNotebookId) {
    return new Promise((resolve, reject) => {
      const note = this.notes[noteId]
      const notebook = this.notebooks[note.notebook]
      const oldNotebookId = notebook.id
      const newNotebook = this.notebooks[targetNotebookId]
      const newNotePath = path.join(newNotebook.path, note.name)
      const newNotefilePath = path.join(newNotebook.path, note.name, path.basename(note.file))
      const newNoteId = this._generateId(newNotePath)

      fs.move(note.path, newNotePath, (err) => {
        if (err) {
          return (reject(err))
        }
        // Clone the note object and reassign parameters
        let noteClone = Object.assign({}, note)
        noteClone.id = newNoteId
        noteClone.path = newNotePath
        noteClone.file = newNotefilePath
        noteClone.notebook = newNotebook.id
        noteClone.metadata.modified = moment()

        // Add a reference to the note in the new notebook
        this.notes[newNoteId] = noteClone
        newNotebook.notes.push(noteClone.id)

        // Replace old note id in tags with new note ids
        for (let tag of noteClone.metadata.tags) {
          let index = this.tags[tag].indexOf(noteId)
          this.tags[tag].splice(index, 1, newNoteId)
        }

        // Delete the reference to the old note
        delete this.notes[noteId]
        for (let j = this.notebooks[oldNotebookId].notes.length - 1; j >= 0; j--) {
          if (this.notebooks[oldNotebookId].notes[j] === noteId) {
            this.notebooks[oldNotebookId].notes.splice(j, 1)
          }
        }

        return resolve(newNoteId)
      })
    })
  }

  /**
   * Delete a note and remove it from this.notes and this.tags
   * @param {string} noteId 16 char note identifier
   * @return {boolean}      returns true to signify note deleted
   */
  deleteNote (noteId) {
    return new Promise((resolve, reject) => {
      const note = this.notes[noteId]
      fs.remove(note.path, err => {
        if (err) {
          log.error('Error encountered while deleting note ' + err)
          return reject(err)
        }
        // Delete the tag from this.tags
        const tags = note.metadata.tags
        if (tags != null && tags) {
          for (let i = tags.length - 1; i >= 0; i--) {
            this.deleteTagFromNote(noteId, tags[i])
          }
        }
        // Delete the note from this.notebooks
        const notebook = this.notebooks[note.notebook]
        const delIndex = notebook.notes.indexOf(noteId)
        if (delIndex > -1) {
          notebook.notes.splice(delIndex, 1)
        }

        delete this.notes[noteId]
        return resolve()
      })
    })
  }

  /**
   * Add a tag to the note
   * @param {string} noteId 16 char note identifier
   * @param {tag} tag Tag to add
   * @return {boolean} Success or failure
   */
  addTagToNote (noteId, tag) {
    let note = this.notes[noteId]
    // Add the tag to the note
    if (!note.metadata.tags.includes(tag)) {
      note.metadata.tags.push(tag)
    } else {
      return false
    }
    if (tag in this.tags) {
      this.tags[tag].push(noteId)
    } else {
      this.tags[tag] = [noteId]
    }
    note.modified = moment()
    return true
  }

  /**
   * Delete a tag from a note
   * @param {string} noteId 16 digit note id
   * @param {tag} tag Tag to add to the note
   * @return {boolean} True if completed successfully
   */
  deleteTagFromNote (noteId, tag) {
    try {
      // Delete the tag from the note
      let note = this.notes[noteId]
      let index = note.metadata.tags.indexOf(tag)
      if (index > -1) {
        note.metadata.tags.splice(index, 1)
      }
      // Loop through notes associated in this.tags
      const delIndex = this.tags[tag].indexOf(note.id)
      this.tags[tag].splice(delIndex, 1)
      // Delete the tag if it's empty
      if (this.tags[tag].length === 0) {
        delete this.tags[tag]
      }
      note.metadata.modified = moment()
    } catch (e) {
      log.error('Error encountered while deleting tag from note ' + e)
    }
    return true
  }

    /**
     * Add an attachment to a note
     * @param {string} noteId 16 char note id
     * @param {string} targetPath Path to file to attach
     * @return {boolean} True if completed successfully
     */
  addAttachmentToNote (noteId, targetPath) {
    return new Promise((resolve, reject) => {
      let note = this.notes[noteId]
      const attachmentPath = path.join(note.path, 'attachments')

      fs.ensureDir(attachmentPath, err => {
        if (err) return reject(err)
        const attachmentFileName = path.basename(targetPath)
        const attachmentFilePath = path.join(attachmentPath, attachmentFileName)

        fs.copy(targetPath, attachmentFilePath, err => {
          if (err) return reject(err)

          const attachmentPayload = {
            name: attachmentFileName,
            path: attachmentFilePath
          }
          if (note.attachments == null) {
            note.attachments = []
          }
          note.attachments.push(attachmentPayload)
          note.metadata.modified = moment()
          return resolve(attachmentPayload)
        })
      })
    })
  }

  /**
   * Delete an attachment from a note
   * @param {string} noteId 16 char note id
   * @param {string} attachmentPath Path to attachment to delete
   * @param {boolean} true if completed successfully
   */
  deleteAttachmentFromNote (noteId, attachmentPath) {
    return new Promise((resolve, reject) => {
      let note = this.notes[noteId]
      if (note.hasOwnProperty('attachments')) {
        for (let i = 0; i < note.attachments.length; i++) {
          let attachment = note.attachments[i]
          if (attachment.path === attachmentPath) {
            fs.remove(attachment.path, err => {
              if (err) return reject(err)
              note.attachments.splice(i, 1)
              note.modified = moment()
              return resolve(true)
            })
          }
        }
      }
    })
  }

  updateAttachmentDir (noteId) {
    let note = this.notes[noteId]
    let attachmentDirPath = path.join(note.path, 'attachments')
    if (fs.existsSync(attachmentDirPath)) {
      note.attachments = []
      const rawAttachments = fs.readdirSync(attachmentDirPath)
      const attachments = rawAttachments.filter(junk.not)

      for (let attachment of attachments) {
        let attachmentPath = path.join(attachmentDirPath, attachment)
        note.attachments.push({
          name: attachment,
          path: attachmentPath,
          id: this._generateId(attachmentPath)
        })
      }
    }
  }

  /**
   * Take a note and save it to disk
   * @param {string} noteId 16 character note id
   * @return {boolean} True if successfully saved
   */
  saveNoteToDisk (noteId) {
    return new Promise((resolve, reject) => {
      if (typeof noteId === 'undefined' || !noteId) return
      let note = this.notes[noteId]
      let metadata = {
        title: note.metadata.title,
        tags: note.metadata.tags,
        type: note.metadata.type
      }
      // Attach additional metadata
      Object.assign(metadata, note.metadata)

      // Update modified time
      note.metadata.modified = moment()

      // Replace collection:// paths with relative paths
      const body = protoConverter.toFile(note.body)
      let contents
      if (metadata.type === 'richtext') {
        // Make sure any images inserted with a collate:/// protocol in the front matter is converted to relative path
        if (metadata.hasOwnProperty('delta') && metadata.delta.hasOwnProperty('ops')) {
          for (let op of metadata.delta.ops) {
            if (op.hasOwnProperty('insert') && op.insert.hasOwnProperty('image')) {
              op.insert.image = protoConverter.toFile(op.insert.image)
            }
          }
        }

        // Webpageify the contents and metdata.
        contents = webpageify.stringify(body, JSON.parse(JSON.stringify(metadata)))

        // If the file name still ends with .md, replace the file with a .html file.
        if (note.file.endsWith('.md')) {
          fs.remove(note.file, err => {
            if (err) return reject(err)
            note.file = note.file.replace('.md', '.html')
          })
        }
      } else {
        contents = matter.stringify(body, JSON.parse(JSON.stringify(metadata)))
      }

      fs.writeFile(note.file, contents, err => {
        if (err) return reject(err)
        resolve(true)
      })
    })
  }

  /**
   * Checks if file has changed and updates note if it has
   */
  _openNoteFile (id) {
    return new Promise((resolve, reject) => {
      const note = this.notes[id]
      const noteFileStats = fs.statSync(note.file)
      fs.readFile(note.file, 'utf8', (err, file) => {
        if (err) return reject(err)
        if (note.file.endsWith('.html')) {
          // Parse data from file and merge with defaults
          const fileContents = webpageify(file)
          const defaultMetadata = {
            title: '',
            tags: [],
            type: 'richtext',
            created: fileContents.data.created == null ? moment(noteFileStats.birthtime) : fileContents.data.created,
            modified: fileContents.data.modified == null ? moment(noteFileStats.mtime) : fileContents.data.modified
          }
          note.metadata = Object.assign(defaultMetadata, fileContents.data)
          note.body = (fileContents.content != null) ? fileContents.content : ''
          // Run proto converter on parsed data
          note.body = protoConverter.fromFile(this.collectionPath, note.path, protoConverter.toFile(note.body))
          if (note.metadata.hasOwnProperty('delta') && note.metadata.delta.hasOwnProperty('ops')) {
            for (let i = 0; i < note.metadata.delta.ops.length; i++) {
              let op = note.metadata.delta.ops[i]
              if (op.hasOwnProperty('insert') && op.insert.hasOwnProperty('image')) {
                op.insert.image = protoConverter.fromFile(this.collectionPath, note.path, op.insert.image)
              }
            }
          }
        } else {
          const fileContents = matter(file)
          note.body = (fileContents.content != null) ? fileContents.content : ''
          const defaultMetadata = {
            title: '',
            tags: [],
            type: 'markdown',
            created: fileContents.data.created == null ? moment(noteFileStats.birthtime) : fileContents.data.created,
            modified: fileContents.data.modified == null ? moment(noteFileStats.mtime) : fileContents.data.modified
          }
          note.metadata = Object.assign(defaultMetadata, fileContents.data)
          note.body = protoConverter.fromFile(this.collectionPath, note.path, protoConverter.toFile(note.body))
        }
        return resolve(note)
      })
    })
  }

  _refreshNoteAttachments (id) {
    return new Promise((resolve, reject) => {
      const note = this.notes[id]
      const attachmentFolder = path.join(note.path, 'attachments')
      fs.readdir(attachmentFolder, (err, contents) => {
        if (err) return resolve(note)
        let attachments = []
        const cleanedContents = contents.filter(junk.not)
        for (let i = 0; i < cleanedContents.length; i++) {
          const file = cleanedContents[i]
          let attachment = {}
          attachment.path = path.join(attachmentFolder, file)
          attachment.name = file
          attachment.id = this._generateId(attachment.path)
          attachments.push(attachment)
        }
        note.attachments = attachments
        return resolve(note)
      })
    })
  }

  /**
   * Takes a path and generates a 16 character unique id.
   */
  _generateId (path) {
    return md5hex(path).slice(0, 16)
  }

  /**
   * Takes a title, cleans out any invalid characters and return snake case with
   * suffix.
   */
  _titleToFileName (text, suffix = '') {
    return sanitize(text).trim() + suffix
  }

  /**
   * Sort an array by specified key
   */
  _sortArrayOfObjects (arr, key) {
    return arr.sort((a, b) => {
      let aCrit = a[key]
      let bCrit = b[key]
      if (aCrit < bCrit) {
        return -1
      }
      if (aCrit > bCrit) {
        return 1
      }
      if (aCrit === bCrit) {
        return 0
      }
    })
  }

  /**
   * Takes a file name and turns it into a display name.
   */
  _toDisplayName (title) {
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

  /**
   * Generate a brief description
   */
  genDescription (text) {
    text = striptags(text)
    if (text.length > 150) {
      return text.slice(0, 147) + '...'
    } else {
      return text
    }
  }

  stringify () {
    const copy = Object.assign({}, this)
    delete copy['searchIndex']
    return JSON.stringify(copy)
  }
}
