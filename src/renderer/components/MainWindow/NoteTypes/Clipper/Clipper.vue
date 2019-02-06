<style scoped lang="scss">
@import "../../../../variables.scss";
.scraper-editor {
  display: flex-block;
  height: calc(100vh - 145x);
  width: 100%;
  padding: 1em;
  border: 1px solid $border-color-dark;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  color: $text;
  border-radius: 4px;
}
.header {
  border: none;
  width: 100%;
  height: 2em;
}
#clipper-window {
  height: calc(100vh - 140px);
  border-radius: 10px;
}
.clipper-webview {
  height: calc(100vh - 190px);
  width: 100%;
  border-radius: 10px;
}
</style>

<template>
  <div class="scraper-editor">
    <div class="field has-addons">
      <p class="control is-expanded">
        <input
          class="input "
          type="text"
          placeholder="Clip URL"
          v-model="url"
          ref="clipperInput"
          @contextmenu.prevent='context'
        >
      </p>
      <p class="control">
        <a
          class="button is-info"
          :class="[loading ? 'is-loading' : '']"
          @click.prevent="scrape"
        >
          <span class="icon is-small">
            <i class="fa fa-scissors"></i>
          </span>
          <span>Clip</span>
        </a>
      </p>
    </div>
    <div id="clipper-window">
      <webview
        class="clipper-webview"
        :src="indexPath"
        autosize="on"
        minwidth="600"
        minheight="800"
        @contextmenu.prevent='context'
      ></webview>
    </div>
  </div>
</template>

<script>
import scraper from 'website-scraper'
import path from 'path'
import fs from 'fs-extra'
import log from 'electron-log'
export default {
  data () {
    return {
      loading: false
    }
  },
  mounted () {
    this.initialize()
  },
  computed: {
    noteId () {
      return this.$store.state.mainWindow.activeNoteId
    },
    attachmentPath () {
      if (this.$store.state.mainWindow.activeNote.path) {
        return path.join(this.$store.state.mainWindow.activeNote.path, 'attachments')
      } else {
        return ''
      }
    },
    wwwPath () {
      return path.join(this.attachmentPath, 'www')
    },
    indexPath () {
      return 'file:///' + path.join(this.wwwPath, 'index.html')
    },
    webview () {
      return document.querySelector('webview')
    },
    url: {
      get () {
        return this.$store.state.mainWindow.activeNote.body
      },
      set (val) {
        this.$store.dispatch('updateNoteBody', val)
      }
    }
  },
  watch: {
    noteId (v) {
      this.initialize()
    }
  },
  methods: {
    initialize () {
      if (this.$store.state.mainWindow.activeNote.body) {
        this.url = this.$store.state.mainWindow.activeNote.body.trim()
      }
      window.collate.clipper = this.$refs.clipperInput
    },
    scrape () {
      this.loading = true
      this.$store.dispatch('updateNoteBody', this.url)
      this.$store.dispatch('saveNote')
      if (!fs.existsSync(this.attachmentPath)) {
        try {
          fs.mkdirSync(this.attachmentPath)
        } catch (e) {
          log.error('Error encountered while creating attachment directory at ' + this.attachmentPath + ' ' + e)
          throw new Error('Error encountered while creating attachment directory at ' + this.attachmentPath + ' ' + e)
        }
      } else {
        let confirmation = confirm('A clipped website already exists.  Delete and re-clip?')
        if (confirmation) {
          try {
            fs.removeSync(this.attachmentPath)
            fs.mkdirSync(this.attachmentPath)
          } catch (e) {
            log.error('Error encountered while overwriting clipped website at ' + this.attachmentPath + ' ' + e)
            throw new Error('Error encountered while overwriting clipped website at ' + this.attachmentPath + ' ' + e)
          }
        } else {
          return
        }
      }
      let options = {
        urls: [this.url],
        directory: this.wwwPath
      }
      scraper(options)
        .then((result) => {
          this.loading = false
          this.webview.loadURL(this.indexPath)
        }).catch((err) => {
          this.loading = false
          log.error('Error occurred while scraping with web clpper ' + err)
        })
    },
    context () {
      try {
        window.collate.editMenu.popup()
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    }
  }
}
</script>
