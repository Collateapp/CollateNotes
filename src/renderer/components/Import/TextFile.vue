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
          This tool will import data from a directory containing text files (.txt).  It will not import any attachments, each text file will create a single note.
        </p>
      </div>
    </div>

    <div class='columns'>
      <div class="column is-12">
        <h1 class="title">Text Files</h1>
      </div>
    </div>

    <div class='columns'>
      <div class='column instruction is-half'>
        <p>
          Where is the folder containing the text files?
        </p>
      </div>
      <div class='column options is-half'>
        <div class="field is-grouped">
          <p class="control">
            <a class="button is-info" @click="textFolder">
              Select Folder
            </a>
          </p>
          <p class="control is-expanded">
            <input class="input" type="text" disabled v-model="textFolderPath">
          </p>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-offset-half is-half">
        <p class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="recursive">
            Include subfolders
          </label>
        </p>
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
        <div class="control is-grouped">
          <p class="control is-expanded">
            <input class="input" type="text" v-model="notebookName">
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
import TextFile from '../../collection/import/textfile.js'
export default {
  name: 'text-file',
  data: function () {
    return {
      textFolderPath: '',
      notebookName: 'Text File Import',
      recursive: false
    }
  },
  computed: {
    unlocked () {
      if (this.textFolderPath.length > 0 && this.notebookName.length > 0) {
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
    textFolder () {
      let folder = remote.dialog.showOpenDialog({
        title: 'Select Folder',
        properties: ['openDirectory']
      })
      if (typeof folder[0] !== 'undefined' && folder[0]) {
        this.textFolderPath = folder[0]
      }
    },
    runImport () {
      let collectionPath = window.collate.collection.collectionPath
      let noteboookName = window.collate.collection._titleToFileName(this.notebookName, '.notebook')
      let outputFolder = path.join(collectionPath, noteboookName)
      let output = new TextFile(this.textFolderPath, outputFolder, this.recursive).convert()
      if (output.completed) {
        alert('Import completed successfully')
      } else {
        alert('Import encountered an error: ' + output.message)
      }
    }
  }
}
</script>
