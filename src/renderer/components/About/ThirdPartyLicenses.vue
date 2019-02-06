<style scoped lang="scss">
  @import "../../variables.scss";

  .about-container {
    position: fixed;
    top: 0;
    left: 0;
    background-color: $primary;
    color: $text-dark;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-flow: column;
    overflow: scroll;
  }

  p, a, h1 {
    color: $text-dark;
    margin: 5px;
  }
  a {
    text-decoration: underline;
    color: $text-dark;
  }
  th {
    color: $text-dark;
    padding-left: 5px;
    font-size: 2em;
  }
  .collate-back {
    color: $text-dark;
    font-size: 18pt;
    display: block;
    top: 0;
    left: 0;
    margin: 10px;
    padding-left: 10px;
    width: 100%;
    text-decoration: none;
  }
  .collate-back:hover {
    color: $hover-highlight;
  }
  .license-table {
    color: $text-dark;
    background-color: $primary;
  }
</style>

<template>
  <div class="about-container">
    <router-link class="collate-back" :to="{name: 'about'}">← Back</router-link>
    <div class="container">
        <div class="columns">
          <div class="column">
            <table class="license-table">
              <thead>
                <tr>
                  <th>
                    Software
                  </th>
                  <th>
                    License
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="val, key in licenses">
                  <td>
                    <a :href="val.repository">{{key}}</a>
                  </td>
                  <td>
                    <a :href="val.licenseUrl">{{val.licenses}}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'third-party-license',
  data () {
    return {
      licenses: {}
    }
  },
  created () {
    this.licenses = require('./licenses.json')
  }
}
</script>
