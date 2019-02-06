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
        </nav>
      </div>
    </div>

    <div class="columns">
      <div class="column">
        <p class="content text">
          <b>Tips</b>
          <ul>
            <li>
              <strong>Default Notebook</strong></br>
              Right click on a notebook and click <code>Set as Default</code> to pin a notebook. New notes will be created in here by default unless a notebook has been selected.
            </li>
            <li>
              <strong>Default Note Title</strong></br>
              Change the default title for new notes in Settings.
            </li>
            <li>
              <strong>Drag and Drop Attachments</strong></br>
              Drag a file to the editor and drop in the target box to attach to the currently opened note.
            </li>
            <li>
              <strong>Outline Editor</strong></br>
              In the Outline editor, right click on the bullet for additional options.
            </li>
            <li>
              <strong>Find on page</strong></br>
              Use `Ctrl + F` to open find-on-page to search the page.  Works exactly like a web browser. Note: Doesn't currently work in web clipped pages.
            </li>
            <li>
              <strong>Insert an Image</strong></br>
              Embed an image in a Markdown or Rich Text note by clicking the image icon in the toolbar. You can also embed an image by right clicking on an attached image in the attachment dropdown and selecting `Insert Image`.
            </li>
          </ul>
        </p>
        <p class="content text">
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goHome () {
      this.$emit('goHome')
    }
  }
}
</script>
