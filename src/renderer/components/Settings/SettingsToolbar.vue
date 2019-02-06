<style scoped>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #4c4c6e;
  }
  .logo {
    color: #fdfdfd;
  }
</style>

<template>
  <nav class="nav">
    <div class="nav-center">
      <a class="nav-item">
        <h1 class="title toolbar-title logo">Settings</h1>
      </a>
    </div>
  </nav>
</template>

<script>
  export default {
    name: 'toolbar'
  }
</script>
