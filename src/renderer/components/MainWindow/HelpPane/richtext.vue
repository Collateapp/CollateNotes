<style scoped></style>

<template>
  <div class="columns help-body">
    <div class="column">
      <nav class="panel">
        <p class="panel-heading">
          Rich Text
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
          Formula Input
        </a>
      </nav>
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
