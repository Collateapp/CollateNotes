<template>
  <div class="about-container">
    <a class="collate-back" @click.prevent="goBack">← Back</a>
    <figure class="image is-128x128">
      <img src="../assets/img/icon.png" />
    </figure>
    <h1 class="collate-title title is-1">Collate</h1>
    <p>Version {{version}}</p>
    <p class="collate-about">
      <p>Thank you for using Collate!</p>
      <a href="http://collatenotes.com">Check us out at http://collatenotes.com</a>
      <p>Questions? Comments? Send us an email at <a href="mailto:hello@collate.rocks?subject=Hello">hello@collate.rocks</a></p>
      <p class="copyright">
        Copyright © Collate, LLC {{year}}
      </p>
    </p>
  </div>
</template>

<script>
  import moment from 'moment'
  const version = require('electron').remote.app.getVersion()
  export default {
    data: function () {
      return {
        version: version
      }
    },
    computed: {
      year () {
        return moment().format('YYYY')
      }
    },
    methods: {
      goBack () {
        this.$router.push('/')
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "../variables.scss";
  .about-container {
    position: fixed;
    top: 0;
    left: 0;
    background-color: $primary;
    color: $text-dark;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
  }

  p, a, h1 {
    color: $text-dark;
    margin: 5px;
  }
  a:hover {
    color: $hover-selected;
  }
  .collate-back {
    color: $text-dark;
    font-size: 18pt;
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    margin: 10px;
  }
  .collate-back:hover {
    color: $warning;
  }
  .copyright {
    display: block;
    position: fixed;
    right: 10px;
    bottom: 10px;
  }
</style>
