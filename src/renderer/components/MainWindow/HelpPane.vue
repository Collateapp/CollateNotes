<style lang="scss" scoped>
@import "../../variables.scss";
.help-pane {
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  right: 0;
  height: 100%;
  width: 400px;
  z-index: 999;
  background-color: $body-background;
  -webkit-box-shadow: 0px 2px 6px 0px $box-shadow-color;
  -moz-box-shadow: 0px 2px 6px 0px $box-shadow-color;
  box-shadow: 0px 2px 6px 0px $box-shadow-color;
}
.toolbar {
  height: 52px;
  width: 100%;
  background-color: $primary;
  display: flex;
  align-items: center;
}
.close {
  color: $white;
  margin-left: 10px;
  cursor: pointer;
}
.close:hover {
  color: $warning;
}
.toolbar-title {
  width: 100%;
  text-align: center;
  color: $white;
  margin-left: -37px;
}
</style>

<template>
  <div
    class='help-pane'
  >
    <!-- Nav bar -->
    <div class="toolbar">
      <span class="icon close"
        @click.prevent="closeHelpPane"
      >
        <i class="fa fa-times"></i>
      </span>
      <h3 class="title is-3 toolbar-title">Help</h3>
    </div>
    <!-- End nav bar -->
    <!-- table of contents -->
    <div class="columns help-body" v-if="page === 'home'">
      <div class="column">
        <nav class="panel">
          <p class="panel-heading">
            Help Topics
          </p>
          <a
            class="panel-block"
            @click.prevent="reportBug"
          >
            <span class="panel-icon">
              <i class="fa fa-bug"></i>
            </span>
            Report a bug
          </a>
          <a
            class="panel-block"
            @click.prevent="viewLogs"
          >
            <span class="panel-icon">
              <i class="fa fa-exclamation-triangle"></i>
            </span>
            View Error Logs
          </a>
          <a class="panel-block" @click.prevent.stop="changePage('tips')">
            <span class="panel-icon">
              <i class="fa fa-lightbulb-o"></i>
            </span>
            Collate Tips
          </a>
          <a class="panel-block" @click.prevent.stop="changePage('keyboard')">
            <span class="panel-icon">
              <i class="fa fa-keyboard-o"></i>
            </span>
            Keyboard Shortcuts
          </a>
          <a class="panel-block" @click.prevent.stop="changePage('markdown')">
            <span class="panel-icon">
              <i class="fa fa-hashtag"></i>
            </span>
            Markdown
          </a>
          <a class="panel-block" @click.prevent.stop="changePage('richtext')">
            <span class="panel-icon">
              <i class="fa fa-font"></i>
            </span>
            Rich Text
          </a>
          <a class="panel-block" @click.prevent.stop="changePage('outline')">
            <span class="panel-icon">
              <i class="fa fa-list"></i>
            </span>
            Outline
          </a>
          <!-- <a class="panel-block">
            <span class="panel-icon">
              <i class="fa fa-scissors"></i>
            </span>
            Web Clipper
          </a> -->
        </nav>
      </div>
    </div>
    <!-- end toc -->
    <tips v-if="page === 'tips'" @goHome="changePage('home')"></tips>
    <keyboard v-if="page === 'keyboard'" @goHome="changePage('home')"></keyboard>
    <markdown v-if="page === 'markdown'" @goHome="changePage('home')"></markdown>
    <rich-text v-if="page === 'richtext'" @goHome="changePage('home')"></rich-text>
    <outline v-if="page === 'outline'" @goHome="changePage('home')"></outline>
  </div>
</template>

<script>
import {shell, remote} from 'electron'
import Markdown from './HelpPane/markdown.vue'
import RichText from './HelpPane/richtext.vue'
import Outline from './HelpPane/outline.vue'
import Keyboard from './HelpPane/keyboard.vue'
import Tips from './HelpPane/tips.vue'
export default {
  components: {
    Markdown,
    RichText,
    Outline,
    Keyboard,
    Tips
  },
  computed: {
    page: {
      get () {
        return this.$store.state.mainWindow.helpPanePage
      },
      set (v) {
        this.$store.dispatch('updateHelpPanePage', v)
      }
    }
  },
  methods: {
    closeHelpPane () {
      this.$store.dispatch('updateHideHelpPane', true)
    },
    reportBug () {
      shell.openExternal('http://collatenotes.com/bug-report/')
    },
    changePage (page) {
      this.page = page
    },
    viewLogs () {
      let logPath = remote.require('electron-log').transports.file.findLogPath()
      let shown = shell.showItemInFolder(logPath)
      if (!shown) alert('Logs can be found at ' + logPath)
    }
  }
}
</script>
