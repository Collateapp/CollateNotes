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
          <b>Keyboard shortcuts</b>
        </p>
        <p class="content text">
          <ul>
            <li>
              <p>
                <code>Ctrl/Cmd + Up/Down Arrow</code> - Navigate up and down note pane
              </p>
            </li>
            <li>
              <p>
                <code>Ctrl/Cmd + Shift + Up/Down Arrow</code> - Navigate up and down notebook pane
              </p>
            </li>
          </ul>
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
