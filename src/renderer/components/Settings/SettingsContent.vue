<style scoped>
  .explain {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: left;
  }
  .hint {
    font-style: italic;
  }
  .link {
    text-decoration: underline;
  }
  .settings-content {
    overflow-y: auto;
  }
</style>

<template>
  <div class="settings-content">
    <div class="columns">
      <div class="column">
        <div class="field">
          <label class="checkbox">
            <label class="label">Auto Hide Menubar</label>
            <input type="checkbox" v-model="autoHideMenuBar">
            Autohide the menubar
          </label>
        </div>
      </div>
      <div class="column explain">
        <p>
          Automatically hide the menubar (Windows/Linux).  Press the <code>alt</code> key to show the menu. (Default: Off)
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="field">
          <label class="label">Default Note Title Format</label>
          <p class="control">
            <input class="input" type="text" placeholder="MM-DD-YYYY h.mm.ss.SS a" v-model="defaultTitleFormat">
          </p>
        </div>
      </div>
      <div class="column explain">
        <p>
          Collate's default name is the current datetime formatted as <code>MMMM Do YYYY h.mm.ss.SS a</code>. Override the default date time format. <a class="link" href="https://momentjs.com/docs/#/displaying/">Token reference</a>
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="field">
          <label class="label">Note Pane View</label>
          <p class="control">
            <span class="select">
              <select v-model="notePaneListType">
                <option value="card">Card</option>
                <option value="compact">Compact List</option>
              </select>
            </span>
          </p>
        </div>
      </div>
      <div class="column explain">
        <p>
          Display notes using a Card or Compact list view. (Default: Card)
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="control">
          <label class="checkbox">
            <label class="label">Auto Save</label>
            <input type="checkbox" v-model="disableAutosave">
            Disable Autosave
          </label>
        </p>
      </div>
      <div class="column explain">
        <p>
          Disable the auto save feature.
          (Default: Off)
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <div class="field">
          <label class="label">Load Strategy</label>
          <p class="control">
            <span class="select">
              <select v-model="loadStrategy">
                <option value="async">Asynchronous</option>
                <option value="sync">Synchronous</option>
              </select>
            </span>
          </p>
        </div>
      </div>
      <div class="column explain">
        <p>
          Select Synchroneous if you're experiencing freezing or stuttering when the application first loads.
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <hr />
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="control">
          <label class="checkbox">
            <label class="label">Markdown Editor</label>
            <input type="checkbox" v-model="spellcheck">
            Enable Spellcheck
          </label>
        </p>
      </div>
      <div class="column explain">
        <p>
          Enable spellcheck in markdown editor. Requires a restart to enable.
          (Default: Off)
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="control">
          <label class="checkbox">
            <input type="checkbox" v-model="markdownEditorPreview">
            Enable Preview by Default
          </label>
        </p>
      </div>
      <div class="column explain">
        <p>
          Enable preview mode by default for all markdown notes. You will need to click the preview button to edit note. (Default: off)
        </p>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <hr />
      </div>
    </div>

    <keyboard-shortcuts></keyboard-shortcuts>

  </div>
</template>

<script>
import KeyboardShortcuts from './keyboardShortcuts.vue'
export default {
  name: 'settings-content',
  components: {
    KeyboardShortcuts
  },
  data () {
    return {
      keyObj: {}
    }
  },
  computed: {
    spellcheck: {
      get () {
        return this.$store.state.settings.spellcheck
      },
      set (val) {
        this.$store.dispatch('updateSettings', [{key: 'spellcheck', val: val}])
      }
    },
    defaultTitleFormat: {
      get () {
        return this.$store.state.settings.defaultTitleFormat
      },
      set (val) {
        this.$store.dispatch('updateDefaultTitleFormat', val)
      }
    },
    disableAutosave: {
      get () {
        return this.$store.state.settings.disableAutosave
      },
      set (val) {
        this.$store.dispatch('updateSettings', [{key: 'disableAutosave', val: val}])
      }
    },
    notePaneListType: {
      get () {
        return this.$store.state.settings.notePaneListType
      },
      set (val) {
        this.$store.dispatch('updateNoteListType', val)
      }
    },
    markdownEditorPreview: {
      get () {
        return this.$store.state.settings.markdownEditor.previewEnabled
      },
      set (val) {
        this.$store.dispatch('updateMarkdownPreviewEnabled', val)
      }
    },
    defaultRichTextFont: {
      get () {
        return this.$store.state.settings.richtextEditor.font
      },
      set (val) {
        this.$store.dispatch('setRichTextFont', val)
      }
    },
    loadStrategy: {
      get () {
        return this.$store.state.settings.loadStrategy
      },
      set (val) {
        this.$store.dispatch('setLoadStrategy', val)
      }
    },
    autoHideMenuBar: {
      get () {
        return this.$store.state.settings.autoHideMenuBar
      },
      set (val) {
        this.$store.dispatch('setAutoHideMenuBar', val)
      }
    }
  }
}
</script>
