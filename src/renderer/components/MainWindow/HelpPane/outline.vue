<style scoped>
.text {
  margin: 1em;
}
.help-body {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>

<template>
  <div class="help-body">
    <div class="columns">
      <div class="column">
        <nav class="panel">
          <p class="panel-heading">
            Outline
          </p>
          <a
            class="panel-block"
            @click.prevent.stop="goHome"
          >
            <span class="panel-icon">
              <i class="fa fa-home"></i>
            </span>
            Home
          </a>
        </nav>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="content text">
          <b>The Outline Note Type</b>
          is a combination between an outline and a to-do app. Create a list, then break down individual items by creating sub lists.  The zoom feature allows you to focus on specific bullet points one at a time.
        </p>
        <p class="content text">
          <b>Usage</b>
        </p>
        <p class="content text">
          Right click on the bullet for options or use the keyboard shortcuts:
        </p>
        <p class="content text">
          <b>Keyboard Shortcuts</b>
        </p>
        <p class="content text">
          <ul>
            <li>
              <code>Up/Down Arrows</code> Navigate around
            </li>
            <li>
              <code>Enter Key</code> Create a new item
            </li>
            <li>
              <code>Tab Key</code> Nest an item under the item above it
            </li>
            <li>
              <code>Shift + Tab Key</code> Un-nest or Flatten an item
            </li>
            <li>
              <code>Shift + Up/Down Arrow</code> Move an item up or down
            </li>
          </ul>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import {shell} from 'electron'
export default {
  methods: {
    goHome () {
      this.$emit('goHome')
    },
    openExplanation () {
      shell.openExternal('https://github.com/Khan/KaTeX/wiki/Function-Support-in-KaTeX')
    }
  }
}
</script>
