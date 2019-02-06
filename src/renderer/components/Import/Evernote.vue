<style scoped>
.importer {
  overflow: auto;
  height: 100%;
  margin: 0;
  padding: 2em;
  padding-bottom: 150px;
}
</style>

<template>
  <div class="container is-fluid importer">
    <div class='columns'>
      <div class='column'>
        <p>
          <a class="subtitle" style="text-decoration: underline;" href="http://collatenotes.com/export-from-evernote/">This tutorial will guide you through the steps necessary to export your data from Evernote and import it into Collate.</a>
        </p>
      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Note Data</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column instruction'>
        <p>
          Where is the Evernote archive (.enex) file?
        </p>
      </div>
      <div class='column options'>
        <div class="field is-grouped">
          <p class="control">
            <a class="button is-info"
              @click.prevent="enexFile"
              >
              Select File
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" type="text" disabled v-model="enexFilePath">
          </p>
        </div>

      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Attachment Data</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column instruction'>
        <p>
          Where is the folder containing the attachments exported from Evernote?
        </p>
      </div>
      <div class='column options'>
        <div class="field is-grouped">
          <p class="control">
            <a class="button is-info" @click="attachmentFolder">
              Select Folder
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" type="text" disabled v-model="attachmentFolderPath">
          </p>
        </div>
      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Collate Collection Name</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column instruction'>
        <p>
          What Collection would you like to import into?
        </p>
      </div>
      <div class='column options'>
        <div class="field">
          <p class="control">
            <span class="select">
              <select v-model="collectionId">
                <option selected></option>
                <option v-for="collection in collections" :value="collection.id">{{ collection.name }}</option>
              </select>
            </span>
          </p>
        </div>
      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Collate Notebook Name</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column instruction'>
        <p>
          What would you like to call your new notebook?
        </p>
      </div>
      <div class='column options'>
        <div class="field is-grouped">
          <p class="control is-expanded">
            <input class="input" type="text" v-model="notebookName">
          </p>
        </div>
      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Note Type</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column'>
        <p title="Markdown notes are more readable in plain text using markdown formatting while rich text formats notes using HTML.">
          Would you like to import to Rich Text or Markdown? (Default: Rich Text)
        </p>
      </div>
      <div class='column'>
        <div class="field">
          <p class="control">
            <label class="radio">
              <input type="radio" name="note-type" value="richtext" v-model="noteType">
              Rich Text
            </label>
            <label class="radio">
              <input type="radio" name="note-type" value="markdown" v-model="noteType">
              Markdown
            </label>
          </p>
        </div>
      </div>
    </div>

    <div class='columns'>
      <div class="column">
        <h1 class="title">Import</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column'>
        <p>
          Ready to import?
        </p>
      </div>
      <div class='column'>
        <a class="button is-success" @click="runImport" :disabled="unlocked">Import Notes</a>
      </div>
    </div>

  </div>
</template>

<script>
import path from 'path'
import {remote} from 'electron'
import Evernote from '../../collection/import/evernote.js'
export default {
  name: 'evernote',
  data: function () {
    return {
      enexFilePath: '',
      attachmentFolderPath: '',
      notebookName: 'Evernote Import',
      noteType: 'richtext',
      collectionId: ''
    }
  },
  computed: {
    unlocked () {
      if (this.enexFilePath.length > 0 && this.notebookName.length > 0) {
        return false
      } else {
        return true
      }
    },
    collections () {
      return this.$store.state.mainWindow.collections
    }
  },
  methods: {
    enexFile () {
      let file = remote.dialog.showOpenDialog({
        title: 'Select Evernote Archive',
        properties: ['openFile'],
        filters: [
          {name: 'Evernote Archive', extensions: ['enex']},
          {name: 'All Files', extensions: ['*']}
        ]
      })
      if (file && typeof file[0] !== 'undefined' && file[0]) {
        this.enexFilePath = file[0]
      }
    },
    attachmentFolder () {
      let folder = remote.dialog.showOpenDialog({
        title: 'Select Attachment Folder',
        properties: ['openDirectory']
      })
      if (folder.length > 0 && folder[0] !== null && folder[0]) {
        this.attachmentFolderPath = folder[0]
      }
    },
    runImport () {
      window.collate.collection = window.collate.collections[this.collectionId]
      const collectionPath = window.collate.collection.collectionPath
      const noteboookName = window.collate.collection._titleToFileName(this.notebookName, '.notebook')
      const outputFolder = path.join(collectionPath, noteboookName)
      new Evernote(this.enexFilePath, this.attachmentFolderPath, outputFolder, this.noteType)
        .convert()
          .then(() => {
            alert('Import completed successfully')
          })
          .catch(err => {
            alert('Import encountered an error: ' + err)
          })
    }
  }
}
</script>
