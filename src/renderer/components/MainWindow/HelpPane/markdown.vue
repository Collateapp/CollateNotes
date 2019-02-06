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
            Markdown
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
          <a
            class="panel-block"
            @click.prevent.stop="openExplanation"
          >
            <span class="panel-icon">
              <i class="fa fa-paper-plane-o"></i>
            </span>
            Github Flavored Markdown Explanation
          </a>
        </nav>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="content text">
          <b>Markdown Cheat Sheet (Github Flavored Markdown)</b>
        </p>
        <p class="content text">
          <ul>
            <li>
              <code>#</code> to <code>######</code> Headers H1 - H6
            </li>
            <li>
              <code>*emphasis*</code> or <code>_emphasis_</code> <i>Italics</i>
            </li>
            <li>
              <code>**strong**</code> or <code>__strong__</code> <strong>Bold</strong>
            </li>
            <li>
              <code>~~strikethrough~~</code> <span style="text-decoration: line-through;">Strikethrough</span>
            </li>
            <li>
              <code>1. </code> Ordered lists
            </li>
            <li>
              <code>- </code> Unordered lists
            </li>
            <li>
              <code>[Link](http://example.com)</code> Hyperlink
            </li>
            <li>
              <code>![alt text](http://ex.co/img.jpg)</code> Embed image
            </li>
            <li>
              <code>`print('inline code')`</code> Inline code block
            </li>
            <li>
              <code>```javascript<br />console.log('fenced code block')<br />```</code><br /> Fenced code block with syntax highlighting
            </li>
            <li>
              <code>
                Col 1  | Col 2   | Col 3    <br />
                ------ |:-------:| --------:<br />
                colons | align   | contents <br />
                left   | center  | right    <br />
              </code><br />
              Tables are created with pipes and hyphens. Colons determine content alignment.
            </li>
            <li>
              <code>> Blockquotes indent quoted text</code>
            </li>
            <li>
              <code>---</code> Horizontal rule
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
      shell.openExternal('https://guides.github.com/features/mastering-markdown/')
    }
  }
}
</script>
