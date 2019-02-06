<style scoped lang="scss">
  @import "../../variables.scss";
  * {
    -webkit-app-region: no-drag;
    -webkit-user-select: none;
  }
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: $primary;
  }
  .logo {
    color: $text-dark;
    cursor: default;
  }
</style>

<template>
  <nav class="nav">
    <div class="nav-center">
      <a class="nav-item">
        <h1 class="title toolbar-title logo">Import</h1>
      </a>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'import-toolbar'
  }
</script>
