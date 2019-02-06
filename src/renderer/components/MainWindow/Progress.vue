<template>
  <progress
    class="progress is-primary"
    :value="val"
    :max="max"
  >
    {{val}}%
  </progress>
</template>

<script>
export default {
  data () {
    return {
      max: 100
    }
  },
  computed: {
    val () {
      return this.$store.state.mainWindow.progressPercentage
    }
  }
}
</script>

<style lang="scss">
  @import "../../variables.scss";
  .progress {
    position: fixed;
    bottom: 0;
    left: 0;
    border-radius: 0;
    height: 5px;
    z-index: 99;
  }
</style>
