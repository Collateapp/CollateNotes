import fs from 'fs-extra'
import path from 'path'
import moment from 'moment'
import matter from 'gray-matter'
import log from 'electron-log'

class TextFileToCollate {
  constructor (inputFolder, outputFolder, recursive) {
    this.inputFolder = inputFolder
    this.outputFolder = outputFolder
    this.recursive = !(typeof recursive === 'undefined' || !recursive)
    this.files = []
  }

  convert () {
    log.info('Beginning text file to Collate import')
    try {
      log.info('Collecting files')
      let textFiles
      if (this.recursive) {
        textFiles = this.collectFilesRecursive(this.inputFolder)
      } else {
        textFiles = this.collectFiles(this.inputFolder)
      }

      // Create the output notebook
      if (!fs.existsSync(this.outputFolder)) {
        try {
          fs.mkdirSync(this.outputFolder)
        } catch (e) {
          log.error('Error encountered while creating output notebook at ' + this.outputFolder + ' ' + e)
          throw new Error('Error encountered while creating output notebook at ' + this.outputFolder + ' ' + e)
        }
      } else {
        log.error('Error occurred while generating output folder ' + this.outputFolder)
        throw Error('Error occurred while generating output folder ' + this.outputFolder)
      }

      for (let textFile of textFiles) {
        let body = fs.readFileSync(textFile, {encoding: 'utf8'})
        let title = path.basename(textFile).replace('.txt', '')

        // Create the note folder
        let noteName = this.titleToFileName(title)
        let notePath = path.join(this.outputFolder, noteName)
        if (fs.existsSync(notePath)) {
          log.error('Can not create note folder ' + notePath)
          throw Error('Can not create note folder, folder already exists!')
        } else {
          try {
            fs.mkdirSync(notePath)
          } catch (e) {
            log.error('Error encountered while creating note at ' + notePath + ' ' + e)
            throw new Error('Error encountered while creating note at ' + notePath + ' ' + e)
          }
        }
        let noteFile = path.join(notePath, this.titleToFileName(title, '.md'))
        if (!fs.existsSync(noteFile)) {
          try {
            fs.writeFileSync(noteFile, matter.stringify(body, JSON.stringify(JSON.parse({title: title, tags: [], created: moment(), modified: moment()}))))
          } catch (e) {
            log.error('Error encountered while creating note file at ' + noteFile + ' ' + e)
            throw new Error('Error encountered while creating note file at ' + noteFile + ' ' + e)
          }
        } else {
          log.error('Can not write note file, file exists ' + noteFile)
          throw Error('Can not write note file, file exists ' + noteFile)
        }
      }
      return {completed: true}
    } catch (e) {
      log.error('Text file import failed ' + e)
      return {completed: false, message: e}
    }
  }

  collectFilesRecursive (dir) {
    let textFiles = []
    let files = fs.readdirSync(dir)

    for (let file of files) {
      let filePath = path.join(dir, file)
      let fileStats = fs.statSync(filePath)
      if (fileStats.isFile() && file.toLowerCase().endsWith('.txt')) {
        textFiles.push(filePath)
      } else if (fileStats.isDirectory()) {
        let subFolderFiles = this.collectFilesRecursive(filePath)
        textFiles.push.apply(textFiles, subFolderFiles)
      }
    }

    return textFiles
  }

  collectFiles (dir) {
    let textFiles = []
    let files = fs.readdirSync(dir)

    for (let file of files) {
      let filePath = path.join(dir, file)
      if (fs.statSync(filePath).isFile() && file.endsWith('txt')) {
        textFiles.push(filePath)
      }
    }
    return textFiles
  }

  /**
   * Takes a title, cleans out any invalid characters and return snake case with
   * suffix.
   */
  titleToFileName (text, suffix = '') {
    return text.trim() + suffix
  }
}

export default TextFileToCollate
