<template>
  <p class="control" v-on-clickaway="closeDropdown">
    <a
      class="button"
      @click.prevent="toggleDropdown"
      @keydown.prevent.enter="toggleDropdown"
      @keydown.prevent.space="toggleDropdown"
      @keydown.prevent.esc="toggleDropdown"
      tabindex="6"
    >
      <span class="icon is-small">
        <i class="fa fa-ellipsis-v"></i>
      </span>
    </a>
    <span class="box dropdown" v-if="dropdown">
      <aside class="menu">
        <ul class="menu-list">
          <li>
            <a
              @click="email"
              @keydown.prevent.enter="email"
              @keydown.prevent.space="email"
              @keydown.prevent.esc="toggleDropdown"
              tabindex="6"
            >Email</a>
          </li>
          <li>
            <a
              @click="exportWindow"
              @keydown.prevent.enter="exportWindow"
              @keydown.prevent.space="exportWindow"
              @keydown.prevent.esc="toggleDropdown"
              tabindex="6"
            >Export</a>
          </li>
        </ul>
      </aside>
    </span>
  </p>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import electron from 'electron'
import showdown from 'showdown'
import htmlToText from 'html-to-text'
export default {
  name: 'options',
  mixins: [
    clickaway
  ],
  data () {
    return {
      dropdown: false
    }
  },
  computed: {
  },
  methods: {
    toggleDropdown () {
      this.dropdown = !this.dropdown
    },
    closeDropdown () {
      this.dropdown = false
    },
    exportWindow () {
      let type = this.$store.state.mainWindow.activeNote.metadata.type
      let title = this.$store.state.mainWindow.activeNote.metadata.title
      let html
      if (type === 'outline') {
        let body = this.$store.state.mainWindow.activeNote.metadata.outline
        html = `<style>
        .outline-item {
          margin-left: 2em;
          margin-top: 0.1em;
          margin-bottom: 0.1em;
        }
        .outline-bullet {
          margin: 0;
          padding: 0;
        }
        .outline-bullet i {
          vertical-align: middle;
          margin-bottom: 3px;
          font-size: 12pt;
          color: #666;
        }
        .outline-title {
          margin-left: 0.5em;
          font-size: 1.1em;
        }
        .outline-header {
          border-bottom: 1px solid rgba(10, 10, 10, 0.1);
          margin-bottom: 2em;
        }
        .outline-body {
          margin-left: -2em;
        }
        .strikethrough {
          text-decoration: line-through;
        }
        </style>`
        html += '<div class="outline-header"><h2>' + title + '</h2></div>'
        html += '<div class="outline-body">' + this.outlineToHtml(body) + '</div>'
      } else if (type === 'markdown') {
        let converter = new showdown.Converter()
        let body = this.$store.state.mainWindow.activeNote.body
        converter.setFlavor('github')
        html = converter.makeHtml(body)
      } else if (type === 'richtext') {
        html = this.$store.state.mainWindow.activeNote.body
      } else {

      }
      electron.ipcRenderer.send('openPrint', {
        html: html,
        activeNote: this.$store.state.mainWindow.activeNote
      })
      this.exportDropdown = false
    },
    email () {
      let type = this.$store.state.mainWindow.activeNote.metadata.type
      let contents = this.$store.state.mainWindow.activeNote.metadata.outline
      let text
      if (type === 'markdown') {
        let converter = new showdown.Converter()
        let html = converter.makeHtml(contents)
        text = htmlToText.fromString(html, {
          ignoreImage: true,
          uppercaseHeadings: false,
          singleNewLineParagraphs: true
        })
      } else if (type === 'richtext') {
        text = htmlToText.fromString(contents, {
          ignoreImage: true,
          uppercaseHeadings: false,
          singleNewLineParagraphs: true
        })
      } else if (type === 'outline') {
        text = this.$store.state.mainWindow.activeNote.metadata.title + '\n'
        text += this.outlineToPlainText(contents)
      } else {
        text = contents
      }

      let body = encodeURIComponent(text)
      let title = encodeURIComponent(this.$store.state.mainWindow.activeNote.metadata.title)
      window.location.href = `mailto:?Subject=${title}&Body=${body}`
      this.exportDropdown = false
    },
    outlineToPlainText (node, text, indent = 0) {
      if (text === undefined) text = '\n'
      let checkbox
      if (!node.completed) {
        checkbox = '[ ] '
      } else {
        checkbox = '[X] '
      }
      text += '    '.repeat(indent)
      text += checkbox + node.title + '\n'
      if (node.hasOwnProperty('children')) {
        indent++
        for (let child of node.children) {
          text = this.outlineToPlainText(child, text, indent)
        }
      }
      return text
    },
    outlineToHtml (node, html) {
      if (html === undefined) html = ''
      let checkbox = node.completed ? 'fa-check-circle-o' : 'fa-circle-o'
      let strikethrough = node.completed ? 'strikethrough' : ''
      html += '<div class="outline-item">'
      html += '<span class="outline-bullet"><i class="fa ' + checkbox + '"></i></span>'
      html += '<span class="outline-title ' + strikethrough + '">' + node.title + '</span>'

      if (node.hasOwnProperty('children')) {
        for (let child of node.children) {
          html = this.outlineToHtml(child, html)
        }
      }
      html += '</div>'
      return html
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../variables.scss";
.dropdown {
  position: absolute;
  background-color: $body-background;
  top: 40px;
  right: 0px;
  z-index: 9999;
  padding: 5px;
  width: 120px;
}
.dropdown li {
  list-style: none;
}
.options {
  width: 100%;
}
</style>
