<template>
  <div
    class='markdown-editor'
    @contextmenu.prevent='context'
  >
    <textarea title="SimpleMDE hidden text area"></textarea>
  </div>
</template>

<script>
// Code from https://github.com/F-loat/vue-simplemde/blob/master/markdown-editor.vue
import electron from 'electron'
import SimpleMDE from 'simplemde'
import log from 'electron-log'

import debounce from '../../../../lib/debounce.js'
import fileUrl from '../../../../lib/fileUrl.js'
import ShortcutConverter from '../../../../../shared/shortcutConverter.js'

const SC = new ShortcutConverter()

function attachImage () {
  let files = electron.remote.dialog.showOpenDialog({
    title: 'Attachments',
    buttonLabel: 'Attach',
    properties: ['openFile', 'multiSelections'],
    filters: [
      {name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg', 'bmp', 'webp']}
    ]
  })
  let attachmentPayloads = window.collate.vue.$store.dispatch('addAttachments', files)
  attachmentPayloads.then((files) => {
    let embeds = ''
    for (let file of files) {
      let imageUrl = fileUrl(file.path, 0)
      embeds += `![](${imageUrl})\n`
    }
    // let editorContents = window.collate.simplemde.value()
    // window.collate.simplemde.value(editorContents + '\n' + embeds)
    const pos = window.collate.simplemde.codemirror.getCursor()
    window.collate.simplemde.codemirror.setSelection(pos, pos)
    window.collate.simplemde.codemirror.replaceSelection(embeds)
  })
}

export default {
  name: 'markdown-editor',
  data () {
    let ks = window.collate.vue.$store.state.settings.keyboardShortcuts
    return {
      config: {
        autoDownloadFontAwesome: false,
        status: false,
        autofocus: false,
        spellChecker: this.$store.state.settings.spellcheck,
        hideIcons: ['guide'],
        showIcons: ['code', 'table', 'horizontal-rule', 'strikethrough'],
        renderingConfig: {
          codeSyntaxHighlighting: true,
          theme: 'tomorrow'
        },
        shortcuts: {
          toggleBlockquote: SC.toSimpleMDE(ks.editorBlockQuote),
          toggleBold: SC.toSimpleMDE(ks.editorBold),
          cleanBlock: SC.toSimpleMDE(ks.editorCleanBlock),
          toggleHeadingSmaller: SC.toSimpleMDE(ks.editorHeadingSmaller),
          toggleItalic: SC.toSimpleMDE(ks.editorItalic),
          drawLink: SC.toSimpleMDE(ks.editorInsertLink),
          toggleUnorderedList: SC.toSimpleMDE(ks.editorUnorderedList),
          togglePreview: SC.toSimpleMDE(ks.editorPreview),
          toggleCodeBlock: SC.toSimpleMDE(ks.editorCodeBlock),
          attachImage: SC.toSimpleMDE(ks.editorInsertImage),
          toggleOrderedList: SC.toSimpleMDE(ks.editorOrderedList),
          toggleHeadingBigger: SC.toSimpleMDE(ks.editorHeadings),
          toggleSideBySide: SC.toSimpleMDE(ks.editorSideBySide),
          toggleFullScreen: SC.toSimpleMDE(ks.editorFullScreen)
        },
        indentWithTabs: true,
        tabSize: 4,
        toolbar: [
          'bold',
          'italic',
          'strikethrough',
          'heading',
          'code',
          'quote',
          'unordered-list',
          'ordered-list',
          'link',
          {
            'name': 'image',
            'className': 'fa fa-picture-o no-disable',
            'title': 'Attach image to note and embed',
            action: attachImage
          },
          'table',
          'horizontal-rule',
          '|',
          'preview',
          'side-by-side',
          'fullscreen',
          '|',
          {
            'name': 'tab-insert',
            'className': 'fa fa-text-width no-disable simplemde-toggle-tab-insert',
            'title': 'Toggle Tab key between Insert Mode and Shift Mode',
            action: function () {
              let tabKey = window.collate.simplemde.codemirror.options.extraKeys['Tab']
              if (tabKey === 'tabAndIndentMarkdownList') {
                let toggle = document.getElementsByClassName('simplemde-toggle-tab-insert')

                toggle[0].classList.add('tab-btn')
                window.collate.simplemde.codemirror.options.extraKeys['Tab'] = 'insertTab'
                window.collate.simplemde.codemirror.options.extraKeys['Shift-Tab'] = function () {
                  window.collate.simplemde.codemirror.execCommand('delCharBefore')
                }
              } else {
                window.collate.simplemde.codemirror.options.extraKeys['Tab'] = 'tabAndIndentMarkdownList'
                window.collate.simplemde.codemirror.options.extraKeys['Shift-Tab'] = 'shiftTabAndUnindentMarkdownList'
                let toggle = document.getElementsByClassName('simplemde-toggle-tab-insert')
                if (toggle.length > 0) {
                  toggle[0].classList.remove('tab-btn')
                }
              }
            }
          },
          '|',
          {
            'name': 'cheatsheet',
            'className': 'fa fa-info-circle',
            'title': 'Open the markdown cheat sheet',
            action: function () {
              this.$store.dispatch('updateHelpPanePage', 'markdown')
              this.$store.dispatch('updateHideHelpPane', false)
            }
          }
        ]
      }
    }
  },
  computed: {
    noteBody () {
      return this.$store.state.mainWindow.activeNote.body
    },
    activeNote () {
      return this.$store.state.mainWindow.activeNote
    }
    // focusOnEditor () {
    //   return this.$store.state.mainWindow.focusEditor
    // }
  },
  mounted () {
    this.initialize()
    // make this reload method globally available.
    window.collate.editorReload = this.reload

    this.debouncedAutoSave = debounce((body) => {
      this.$store.dispatch('updateSaveStatus')
    }, 100)
    this.debouncedUpdate = debounce(() => {
      this.$store.dispatch('updateNoteBody', this.simplemde.value())
    }, 50)
  },
  methods: {
    initialize () {
      log.info('Initializing simpleMDE Editor')
      require('simplemde/dist/simplemde.min.css')
      let configs = this.config
      configs.element = configs.element || this.$el.firstChild
      // configs.initialValue = this.noteBody
      this.simplemde = new SimpleMDE(configs)
      this.simplemde.value(this.noteBody)

      if (this.$store.state.settings.markdownEditor.previewEnabled && !this.simplemde.isPreviewActive()) {
        this.simplemde.togglePreview()
      }

      window.collate.simplemde = this.simplemde
      // On initialize add the active note id to storage

      // Autosave was firing when a new note was loaded due to the change event handler.
      // By keeping track of the active note id, we only fire auto save when the
      // change event fires and the active note has not changed.
      this.$store.dispatch('addNoteIdHistory', this.$store.state.mainWindow.activeNoteId)

      this.simplemde.codemirror.on('change', () => {
        let activeNoteId = this.$store.state.mainWindow.activeNoteId
        log.debug('SimpleMDE Change detected. Active Note: ' + activeNoteId + ' Previous Note: ' + window.collate.activeNoteIdStorage)
        this.debouncedUpdate()
        // On change, if the note id is the same as the previous change,
        // save the note, otherwise destroy the simpleMDE instance and start again
        let noteHistory = this.$store.state.mainWindow.noteIdHistory
        let prevNoteId = noteHistory[noteHistory.length - 1]
        if (prevNoteId != null && prevNoteId !== activeNoteId) {
          log.debug('SimpleMDE Detected a new note, re-initializing')
          this.simplemde.toTextArea()
          this.simplemde = null
          window.collate.simplemde = null
          this.initialize()
        } else {
          log.debug('SimpleMDE Calling debounced Auto Save')
          this.debouncedAutoSave()
        }

        // if (activeNote === window.collate.activeNoteIdStorage ||) {
        //   log.debug('SimpleMDE Calling debounced Auto Save')
        //   this.debouncedAutoSave()
        // } else if (!window.collate.activeNoteIdStorage || window.collate.activeNoteIdStorage == null) {
        //   // If its a brand new editor with no previous notes, do nothing.\
        //   log.debug('SimpleMDE Empty active note storage, do nothing')
        //   void 0
        // } else {
        //   log.debug('SimpleMDE Detected a new note, re-initializing')
        //   this.simplemde.toTextArea()
        //   this.simplemde = null
        //   window.collate.simplemde = null
        //   this.initialize()
        // }
        this.$store.dispatch('addNoteIdHistory', activeNoteId)
        window.collate.activeNoteIdStorage = activeNoteId
      })

      // Need to focus on the input field otherwise the initial input doesn't
      // trigger and you have to click in the editor area again.
      window.collate.simplemde.codemirror.getInputField().focus()
    },
    context () {
      try {
        window.collate.editMenu.popup()
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    },
    drag (e) {
      e.dataTransfer.dropEffect = 'copy'
    }
  },
  watch: {
    noteBody (val) {
      if (val === this.simplemde.value()) return
      this.simplemde.value(val)
    }
    // focusEditor (val) {
    //   if (val) {
    //     window.collate.simplemde.codemirror.focus()
    //   }
    // }
  }
}
</script>

<style lang='scss'>
.CodeMirror {
  height: calc(100vh - 190px);
}

@media (max-width: 1030px) {
  .CodeMirror {
    height: calc(100vh - 220px);
  }
}
.editor-toolbar {
  .fa {
    font-size: 12pt;
  }
}

.editor-pane {
  .fullscreen {
    margin-top: 50px;
  }
  .CodeMirror-fullscreen {
    margin-top: 50px;
  }
  .editor-preview-active-side {
    margin-top: 50px;
  }
}

.editor-preview,
.editor-preview-side {
  /*
  This document has been created with Marked.app <http://marked2app.com>, Copyright 2013 Brett Terpstra
  Content is property of the document author
  Please leave this notice in place, along with any additional credits below.
  ---------------------------------------------------------------
  Title: GitHub
  Author: Brett Terpstra
    Description: Github README style. Includes theme for Pygmentized code blocks.
  */
  html, body {
    color: black; }

  *:not(#mkdbuttons) {
    margin: 0;
    padding: 0; }

  #wrapper {
    font: 15px helvetica,arial,freesans,clean,sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.7;
    padding: 3px;
    background: #fff;
    border-radius: 3px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px; }

  p {
    margin: 1em 0; }

  a {
    color: #4183c4;
    text-decoration: none; }

  #wrapper {
    background-color: #fff;
    padding: 30px;
    margin: 15px;
    font-size: 15px;
    line-height: 1.6; }
    #wrapper > *:first-child {
      margin-top: 0 !important; }
    #wrapper > *:last-child {
      margin-bottom: 0 !important; }

  @media screen {
    #wrapper {
      box-shadow: 0 0 0 1px #cacaca, 0 0 0 4px #eee; } }
  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.7;
    cursor: text;
    position: relative;
    margin: 1em 0 15px;
    padding: 0; }

  h1 {
    font-size: 2.5em;
    border-bottom: 1px solid #ddd; }

  h2 {
    font-size: 2em;
    border-bottom: 1px solid #eee; }

  h3 {
    font-size: 1.5em; }

  h4 {
    font-size: 1.2em; }

  h5 {
    font-size: 1em; }

  h6 {
    color: #777;
    font-size: 1em; }

  p, blockquote, table, pre {
    margin: 0 0 15px 0; }

  ul {
    padding-left: 30px; }

  ol {
    padding-left: 30px; }
    ol li ul:first-of-type {
      margin-top: 0px; }

  hr {
    background: transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAECAYAAACtBE5DAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OENDRjNBN0E2NTZBMTFFMEI3QjRBODM4NzJDMjlGNDgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OENDRjNBN0I2NTZBMTFFMEI3QjRBODM4NzJDMjlGNDgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4Q0NGM0E3ODY1NkExMUUwQjdCNEE4Mzg3MkMyOUY0OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4Q0NGM0E3OTY1NkExMUUwQjdCNEE4Mzg3MkMyOUY0OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PqqezsUAAAAfSURBVHjaYmRABcYwBiM2QSA4y4hNEKYDQxAEAAIMAHNGAzhkPOlYAAAAAElFTkSuQmCC) repeat-x 0 0;
    border: 0 none;
    color: #ccc;
    height: 4px;
    margin: 15px 0;
    padding: 0; }

  #wrapper > h2:first-child {
    margin-top: 0;
    padding-top: 0; }
  #wrapper > h1:first-child {
    margin-top: 0;
    padding-top: 0; }
    #wrapper > h1:first-child + h2 {
      margin-top: 0;
      padding-top: 0; }
  #wrapper > h3:first-child, #wrapper > h4:first-child, #wrapper > h5:first-child, #wrapper > h6:first-child {
    margin-top: 0;
    padding-top: 0; }

  a:first-child h1, a:first-child h2, a:first-child h3, a:first-child h4, a:first-child h5, a:first-child h6 {
    margin-top: 0;
    padding-top: 0; }

  h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p, ul li > :first-child, ol li > :first-child {
    margin-top: 0; }

  dl {
    padding: 0; }
    dl dt {
      font-size: 14px;
      font-weight: bold;
      font-style: italic;
      padding: 0;
      margin: 15px 0 5px; }
      dl dt:first-child {
        padding: 0; }
      dl dt > :first-child {
        margin-top: 0; }
      dl dt > :last-child {
        margin-bottom: 0; }
    dl dd {
      margin: 0 0 15px;
      padding: 0 15px; }
      dl dd > :first-child {
        margin-top: 0; }
      dl dd > :last-child {
        margin-bottom: 0; }

  blockquote {
    border-left: 4px solid #DDD;
    padding: 0 15px;
    color: #777; }
    blockquote > :first-child {
      margin-top: 0; }
    blockquote > :last-child {
      margin-bottom: 0; }

  table {
    border-collapse: collapse;
    border-spacing: 0;
    font-size: 100%;
    font: inherit; }
    table th {
      font-weight: bold;
      border: 1px solid #ccc;
      padding: 6px 13px; }
    table td {
      border: 1px solid #ccc;
      padding: 6px 13px; }
    table tr {
      border-top: 1px solid #ccc;
      background-color: #fff; }
      table tr:nth-child(2n) {
        background-color: #f8f8f8; }

  img {
    max-width: 100%; }

  code, tt {
    margin: 0 2px;
    padding: 0 5px;
    white-space: nowrap;
    border: 1px solid #eaeaea;
    background-color: #f8f8f8;
    border-radius: 3px;
    font-family: "Inconsolata", "Consolas", "Monaco", monospace !important;
    font-size: 0.9em !important;
    color: #333333; }

  pre > code {
    margin: 0;
    padding: 0;
    white-space: pre;
    border: none;
    background: transparent; }

  .highlight pre {
    background-color: #f8f8f8;
    border: 1px solid #ccc;
    font-size: 13px;
    line-height: 19px;
    overflow: auto;
    padding: 6px 10px;
    border-radius: 3px; }

  pre {
    background-color: #f8f8f8;
    border: 1px solid #ccc;
    font-size: 14px;
    line-height: 19px;
    overflow: auto;
    padding: 6px 10px;
    border-radius: 3px;
    margin: 26px 0; }
    pre code, pre tt {
      background-color: transparent;
      border: none; }

  .poetry pre {
    font-family: Georgia, Garamond, serif !important;
    font-style: italic;
    font-size: 110% !important;
    line-height: 1.6em;
    display: block;
    margin-left: 1em; }
    .poetry pre code {
      font-family: Georgia, Garamond, serif !important;
      word-break: break-all;
      word-break: break-word;
      /* Non standard for webkit */
      -webkit-hyphens: auto;
      -moz-hyphens: auto;
      hyphens: auto;
      white-space: pre-wrap; }

  sup, sub, a.footnote {
    font-size: 1.4ex;
    height: 0;
    line-height: 1;
    vertical-align: super;
    position: relative; }

  sub {
    vertical-align: sub;
    top: -1px; }

  @media print {
    body {
      background: #fff; }

    img, pre, blockquote, table, figure {
      page-break-inside: avoid; }

    #wrapper {
      background: #fff;
      border: none; }

    pre code {
      overflow: visible; } }
  @media screen {
    body.inverted {
      color: #eee !important;
      border-color: #555;
      box-shadow: none; }

    .inverted #wrapper, .inverted hr, .inverted p, .inverted td, .inverted li, .inverted h1, .inverted h2, .inverted h3, .inverted h4, .inverted h5, .inverted h6, .inverted th, .inverted .math, .inverted caption, .inverted dd, .inverted dt, .inverted blockquote {
      color: #eee !important;
      border-color: #555;
      box-shadow: none; }
    .inverted td, .inverted th {
      background: #333; }
    .inverted pre, .inverted code, .inverted tt {
      background: #eeeeee !important;
      color: #111; }
    .inverted h2 {
      border-color: #555555; }
    .inverted hr {
      border-color: #777;
      border-width: 1px !important; }

    ::selection {
      background: rgba(157, 193, 200, 0.5); }

    h1::selection {
      background-color: rgba(45, 156, 208, 0.3); }

    h2::selection {
      background-color: rgba(90, 182, 224, 0.3); }

    h3::selection, h4::selection, h5::selection, h6::selection, li::selection, ol::selection {
      background-color: rgba(133, 201, 232, 0.3); }

    code::selection {
      background-color: rgba(0, 0, 0, 0.7);
      color: #eeeeee; }
    code span::selection {
      background-color: rgba(0, 0, 0, 0.7) !important;
      color: #eeeeee !important; }

    a::selection {
      background-color: rgba(255, 230, 102, 0.2); }

    .inverted a::selection {
      background-color: rgba(255, 230, 102, 0.6); }

    td::selection, th::selection, caption::selection {
      background-color: rgba(180, 237, 95, 0.5); }

    .inverted {
      background: #0b2531;
      background: #252a2a; }
      .inverted #wrapper {
        background: #252a2a; }
      .inverted a {
        color: #acd1d5; } }
  .highlight .c {
    color: #998;
    font-style: italic; }
  .highlight .err {
    color: #a61717;
    background-color: #e3d2d2; }
  .highlight .k, .highlight .o {
    font-weight: bold; }
  .highlight .cm {
    color: #998;
    font-style: italic; }
  .highlight .cp {
    color: #999;
    font-weight: bold; }
  .highlight .c1 {
    color: #998;
    font-style: italic; }
  .highlight .cs {
    color: #999;
    font-weight: bold;
    font-style: italic; }
  .highlight .gd {
    color: #000;
    background-color: #fdd; }
    .highlight .gd .x {
      color: #000;
      background-color: #faa; }
  .highlight .ge {
    font-style: italic; }
  .highlight .gr {
    color: #a00; }
  .highlight .gh {
    color: #999; }
  .highlight .gi {
    color: #000;
    background-color: #dfd; }
    .highlight .gi .x {
      color: #000;
      background-color: #afa; }
  .highlight .go {
    color: #888; }
  .highlight .gp {
    color: #555; }
  .highlight .gs {
    font-weight: bold; }
  .highlight .gu {
    color: #800080;
    font-weight: bold; }
  .highlight .gt {
    color: #a00; }
  .highlight .kc, .highlight .kd, .highlight .kn, .highlight .kp, .highlight .kr {
    font-weight: bold; }
  .highlight .kt {
    color: #458;
    font-weight: bold; }
  .highlight .m {
    color: #099; }
  .highlight .s {
    color: #d14; }
  .highlight .na {
    color: #008080; }
  .highlight .nb {
    color: #0086B3; }
  .highlight .nc {
    color: #458;
    font-weight: bold; }
  .highlight .no {
    color: #008080; }
  .highlight .ni {
    color: #800080; }
  .highlight .ne, .highlight .nf {
    color: #900;
    font-weight: bold; }
  .highlight .nn {
    color: #555; }
  .highlight .nt {
    color: #000080; }
  .highlight .nv {
    color: #008080; }
  .highlight .ow {
    font-weight: bold; }
  .highlight .w {
    color: #bbb; }
  .highlight .mf, .highlight .mh, .highlight .mi, .highlight .mo {
    color: #099; }
  .highlight .sb, .highlight .sc, .highlight .sd, .highlight .s2, .highlight .se, .highlight .sh, .highlight .si, .highlight .sx {
    color: #d14; }
  .highlight .sr {
    color: #009926; }
  .highlight .s1 {
    color: #d14; }
  .highlight .ss {
    color: #990073; }
  .highlight .bp {
    color: #999; }
  .highlight .vc, .highlight .vg, .highlight .vi {
    color: #008080; }
  .highlight .il {
    color: #099; }
  .highlight .gc {
    color: #999;
    background-color: #EAF2F5; }

  .type-csharp .highlight .k, .type-csharp .highlight .kt {
    color: #00F; }
  .type-csharp .highlight .nf {
    color: #000;
    font-weight: normal; }
  .type-csharp .highlight .nc {
    color: #2B91AF; }
  .type-csharp .highlight .nn {
    color: #000; }
  .type-csharp .highlight .s, .type-csharp .highlight .sc {
    color: #A31515; }

  body.dark #wrapper {
    background: transparent !important;
    box-shadow: none !important; }
}

ul {
  list-style: disc;
}

.tab-btn,
.active {
  background: #fcfcfc !important;
  border: 1px solid #95a5a6 !important;
  box-shadow: inset 0px 0px 2px 1px #ccc;
}
</style>
