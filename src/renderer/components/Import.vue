<template>
  <div class='import-window'>
    <import-toolbar></import-toolbar>
    <div class="import-tabs">
      <span class="back"><a @click.prevent="goBack">←Back</a></span>

      <div class='columns'>
        <div class='column'>
          <div class="tabs is-centered">
            <ul>
              <li :class="{'is-active': evernote}">
                <a @click="select('evernote')">
                  From Evernote Archive
                </a>
              </li>
              <li :class="{'is-active': text}">
                <a @click="select('text')">
                  From Text Files
                </a>
              </li>
              <li :class="{'is-active': markdown}">
                <a @click="select('markdown')">
                  From Markdown Files
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <evernote v-if="evernote">
    </evernote>

    <text-file v-if="text">
    </text-file>

    <markdown v-if="markdown">
    </markdown>

  </div>
</template>

<script>
  import ImportToolbar from './Import/ImportToolbar.vue'
  import Evernote from './Import/Evernote.vue'
  import TextFile from './Import/TextFile.vue'
  import Markdown from './Import/Markdown.vue'
  export default {
    name: 'import',
    components: {
      ImportToolbar,
      Evernote,
      TextFile,
      Markdown
    },
    data: function () {
      return {
        evernote: true,
        text: false,
        markdown: false
      }
    },
    methods: {
      goBack () {
        this.$store.commit('SET_LOADING_MODAL_ACTIVE', true)
        this.$router.push('/')
        setTimeout(() => {
          this.$store.dispatch('initProgram', {})
        }, 1)
      },
      clearActive () {
        this.evernote = false
        this.text = false
        this.markdown = false
      },
      select (tab) {
        this.clearActive()
        this[tab] = true
      }
    }
  }
</script>

<style scoped>
  @import "../variables.scss";
  *, a, li {
    color: $primary;
  }

  .import-window {
    position: absolute;
    top: 0;
    left: 0;
    background-color: $background-alt;
    color: $primary;
    height: 100%;
    width: 100%;
    margin-top: 60px;
  }
  .back {
    margin-left: 10px;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }
  .back:active {
    top: 2px;
  }

</style>
