import fs from 'fs-extra'
import path from 'path'
import md5file from 'md5-file'
import matter from 'gray-matter'
import enexParser from 'enex-parser'
import striptags from 'striptags'
import cheerio from 'cheerio'
import moment from 'moment'
import log from 'electron-log'

import webpageify from '../../lib/webpageify.js'

class EvernoteToCollate {
  constructor (enexFile, attachmentsFolder, outputFolder, type) {
    this.enexFile = enexFile
    this.attachmentsFolder = attachmentsFolder == null ? '' : attachmentsFolder
    this.outputFolder = outputFolder
    this.type = type
  }

  convert () {
    return new Promise((resolve, reject) => {
      log.info('Beginning Evernote to Collate conversion')
      this.buildAttachmentHashLookup()
        .then(lookup => {
          this.attachmentsHashLookup = lookup
          let enexProm

          if (this.type === 'markdown') {
            enexProm = this.parseEnexFileToMarkdown()
          } else {
            enexProm = this.parseEnexFiletoRichText()
          }

          enexProm
            .then((data) => {
              this.enexData = data
              this.generateCollateCollection()
                .then(() => {
                  return resolve()
                })
                .catch(err => {
                  return reject(err)
                })
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

  // Build a hashmap between the md5 hashed file name to look up later.
  buildAttachmentHashLookup () {
    return new Promise((resolve, reject) => {
      log.info('Building hashed attachment lookup')
      fs.readdir(this.attachmentsFolder, (err, attachments) => {
        if (err) resolve({})
        let lookup = {}
        for (let attachment of attachments) {
          let attachmentPath = path.join(this.attachmentsFolder, attachment)
          lookup[md5file.sync(attachmentPath)] = attachmentPath
        }
        return resolve(lookup)
      })
    })
  }

  parseEnexFileToMarkdown () {
    return new Promise((resolve, reject) => {
      log.info('Parsing ENEX file to markdown')
      fs.readFile(this.enexFile, 'utf8', (err, enexFileContents) => {
        if (err) return reject(err)
        return resolve(enexParser(enexFileContents))
      })
    })
  }

  parseEnexFiletoRichText () {
    return new Promise((resolve, reject) => {
      fs.readFile(this.enexFile, 'utf8', (err, enexFileContents) => {
        if (err) return reject(err)
        const $_ = ($, fn) => (i, el) => fn($(el), $)
        const parseDate = dateString => {
          const [matches, Y, M, d, h, m, s] = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(dateString) || []
          if (matches) return new Date(Y, M - 1, d, h, m, s)
        }

        const cheerioParse = fn => data => fn(cheerio.load(data, {
          xmlMode: true,
          normalizeWhitespace: true
        }))

        const parseContent = cheerioParse($ => {
          let el = $('en-note')
          return striptags(el.html(), [
            'a', 'p', 'strong', 'img', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'span', 'b', 'li', 'ol', 'ul', 'en-media', 'en-encrypt', 'data', 'table',
            'td', 'tr', 'th', 'tbody', 'theader', 'tfooter'
          ])
        })

        const parseNote = (el, $) => ({
          title: el.find('title').text(),
          created: parseDate(el.find('created').text()),
          updated: parseDate(el.find('updated').text()),
          tags: el.find('tag').map($_($, tag => tag.text())).toArray(),
          content: parseContent(el.find('content').contents().contents().text())
        })

        const parseNotes = $ => $('note').map($_($, parseNote)).toArray()
        const parser = cheerioParse(parseNotes)
        return resolve(parser(enexFileContents))
      })
    })
  }

  generateCollateCollection () {
    return new Promise((resolve, reject) => {
      try {
        fs.mkdirSync(this.outputFolder)
      } catch (e) {
        const conf = confirm('Output folder already exists, overwrite it?')
        if (conf) {
          fs.emptyDirSync(this.outputFolder)
        } else {
          return reject(new Error({message: 'Cancelled'}))
        }
      }
      log.info('Generating Collate Collection')
      if (this.enexData == null) {
        log.warn('Enex data not importable, skipping', this.enexData)
        return reject(new Error('Enex file empty or error encountered while parsing.'))
      }
      // Go through each evernote note and create a collate note
      for (let evernote of this.enexData) {
        let noteTitle = evernote.title ? evernote.title : 'title missing'
        const tags = evernote.tags ? evernote.tags : []
        let content
        if (this.type === 'markdown') {
          content = this.stripEvernoteMarkup(evernote.content)
        } else {
          content = evernote.content
        }

        const attachments = this.getAttachments(evernote.content)

        let noteName = this.titleToFileName(noteTitle)
        let notePath = path.join(this.outputFolder, noteName)
        let tryNote = true
        let tryCount = 0

        while (tryNote) {
          tryCount++
          if (tryCount > 100) {
            log.error('Could not find a suitable name for note after 100 tries')
            return reject(new Error('Error encountered while trying to find suitable name for note', evernote.title))
          }
          notePath = path.join(this.outputFolder, noteName)
          // Create the note directory
          if (!fs.existsSync(notePath)) {
            tryNote = false
          } else {
            const re = /[[0-9]+?]$/
            const num = noteTitle.match(re)
            if (num) {
              // Extract and increment
              let variationNum = parseInt(num[0].slice(1, num[0].length - 1))
              variationNum++
              noteTitle = noteTitle.replace(num, '[' + variationNum + ']')
            } else {
              noteTitle = noteTitle + '[1]'
            }
            noteName = this.titleToFileName(noteTitle)
          }
        }
        fs.mkdir(notePath, err => {
          if (err) return reject(err)
          let stringifiedData
          let noteFileName
          if (this.type === 'richtext') {
            noteFileName = this.titleToFileName(noteTitle, '.html')
            stringifiedData = webpageify.stringify(content, JSON.parse(JSON.stringify({
              title: noteTitle,
              tags: tags,
              type: this.type,
              created: evernote.created ? evernote.created : moment(),
              modified: evernote.updated ? evernote.updated : moment()
            })))
          } else {
            noteFileName = this.titleToFileName(noteTitle, '.md')
            stringifiedData = matter.stringify(content, JSON.parse(JSON.stringify({
              title: noteTitle,
              tags: tags,
              type: this.type,
              created: evernote.created ? evernote.created : moment(),
              modified: evernote.updated ? evernote.updated : moment()
            })))
          }
          const noteFilePath = path.join(notePath, noteFileName)
          const attachmentPath = path.join(notePath, 'attachments')

          fs.writeFile(noteFilePath, stringifiedData, err => {
            if (err) {
              log.error('Error encountered while creating note file at ' + noteFilePath + ' ' + err)
              return reject(Error('Error encountered while creating note file at ' + noteFilePath + ' ' + err))
            }

            // Create the attachments dir if necessary
            if (attachments.length > 0) {
              fs.mkdir(attachmentPath, err => {
                if (err) {
                  log.error('Error occurred while trying to create attachment directory ' + err)
                  return reject(Error('Error creating attachment directory', err))
                }
                // Copy attachments over
                let copyQueue = []
                for (let attachment of attachments) {
                  if (typeof attachment !== 'undefined' && attachment) {
                    let target = path.join(attachmentPath, path.basename(attachment))
                    copyQueue.push(new Promise((resolve, reject) => {
                      fs.copy(attachment, target, {overwrite: true}, err => {
                        if (err) return reject(err)
                        return resolve()
                      })
                    }))
                  }
                }
                Promise.all(copyQueue)
                  .then(() => {
                    return resolve()
                  })
                  .catch(err => {
                    return reject(err)
                  })
              })
            } else {
              return resolve()
            }
          })
        })
      }
    })
  }

  // Given an evernote content string, lookup any media hashes and return an
  // array of attachments
  getAttachments (content) {
    let attachments = []
    let re = /hash="(.*?)"/g
    let match
    /*eslint-disable */
    while (match = re.exec(content)) {
    /*eslint-enable */
      // console.log(match[0], match[1])
      // match = match.replace('hash=', '').replace('"', '')
      match = match[1]
      let file = this.attachmentsHashLookup[match]
      if (file != null) {
        attachments.push(file)
      }
    }
    return attachments
  }

  // Strip evernote markup from notes
  stripEvernoteMarkup (content) {
    let whiteList = [
    ]
    content = striptags(content, whiteList)

    return content
  }

  /**
  * Takes a title, cleans out any invalid characters and return snake case with
  * suffix.
  */
  titleToFileName (text, suffix = '') {
    return text.trim() + suffix
  }
}

export default EvernoteToCollate
