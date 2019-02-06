<template>
  <div class='collection-pane' v-on-clickaway="closePane">
    <nav class="panel">
      <p class="panel-heading">
        Collections
      </p>
      <a class="panel-block">
        <button
          class="button is-primary is-outlined is-fullwidth collection-btn"
          title="Create a new Collection"
          @click.prevent="newCollection"
        >
          New
        </button>
        <button
          class="button is-primary is-outlined is-fullwidth collection-btn"
          title="Load an existing Collection"
          @click.prevent="loadCollection"
        >
          Load
        </button>
      </a>
      <template v-for="val in collections">
        <a class="panel-block collection-item"
          :class="[activeCollectionId === val.id ? 'is-active collection-active' : '', defaultCollectionId === val.id ? 'default-collection' : '']"
          @click.prevent="clickCollection(val.id)"
          @contextmenu.prevent="contextCollection(val.id)"
        >
          <div class="panel-container">
            <p class="panel-name">
              {{val.name}}
            </p>
            <p class="panel-path">
              <small>{{val.path}}</small>
            </p>
          </div>
        </a>
      </template>

    </nav>
  </div>
</template>

<script>
import {remote} from 'electron'
import { mixin as clickaway } from 'vue-clickaway'
export default {
  name: 'collection-pane',
  mixins: [
    clickaway
  ],
  computed: {
    collections () {
      return this.$store.state.mainWindow.collections
    },
    activeCollectionId () {
      return this.$store.state.mainWindow.activeCollectionId
    },
    defaultCollectionId () {
      return this.$store.state.settings.defaultCollectionId
    }
  },
  methods: {
    newCollection () {
      let collectionPath = remote.dialog.showOpenDialog({
        title: 'Select folder to hold the new collection.',
        properties: ['openDirectory', 'createDirectory']
      })
      if (collectionPath != null && collectionPath) {
        this.$store.dispatch('addCollectionPath', {path: collectionPath[0], new: true})
      }
      this.newCollectionLoading = false
    },
    loadCollection () {
      this.loadCollectionLoading = true
      let collectionPath = remote.dialog.showOpenDialog({
        title: 'Select Collection to open',
        properties: ['openDirectory']
      })
      if (collectionPath != null && collectionPath) {
        this.$store.dispatch('addCollectionPath', {path: collectionPath[0], new: false})
      }
      this.loadCollectionLoading = false
    },
    clickCollection (collectionId) {
      this.$store.dispatch('loadCollection', collectionId)
      // this.closePane()
    },
    contextCollection (collectionId) {
      window.collate.contextCollectionId = collectionId
      window.collate.collectionMenu.popup()
    },
    closePane () {
      this.$store.dispatch('updateHideCollectionPane', true)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../variables.scss";

.panel-heading {
  font-size: 1.5em;
  -webkit-user-select: none;
  user-select: none;
}

.collection-pane {
  position: fixed;
  bottom: 0;
  left:0;
  width: 300px;
  height: calc(100% - 52px);
  z-index: 999;
  border-right: 1px solid $grey-lightest;
  background-color: $body-background;
  -webkit-box-shadow: 0px 2px 6px 0px $box-shadow-color;
  -moz-box-shadow: 0px 2px 6px 0px $box-shadow-color;
  box-shadow: 0px 2px 6px 0px $box-shadow-color;
}

.panel-container {
  display:block;
  width: 100%;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
}

.panel-path {
  small {
    display: inline;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-user-select: none;
    user-select: none;
  }
  color: $grey-dark;
}

.panel-name {
  font-size: 1.5em;

}

.collection-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-active {
  background: $primary;
  color: $white;
  .panel-name {
    color: $white;
  }
  .panel-path {
    color: $white;
  }
  &:hover {
    background: $primary;
    color: $white;
  }
}

.default-collection {
  border-left: 10px solid $secondary;
}

.collection-btn {
  margin-right: 5px;
  margin-left: 5px;
}
</style>
