<template>
  <!-- Tag button -->
  <p class="control"
    v-on-clickaway="closeTagDropdown"
  >
    <a class="button"
      @click.prevent="toggleTagDropdown"
      @keydown.prevent.enter="toggleTagDropdown"
      @keydown.prevent.space="toggleTagDropdown"
      @keydown.prevent.esc="toggleTagDropdown"
      title="Tags"
      tabindex="4"
    >
      <span class="icon is-small">
        <i class="fa fa-tags"></i>
      </span>
      <span v-if="hasTags">
        <template v-if="tags.length===1">1 Tag</template>
        <template v-else>{{tags.length}} Tags</template>
      </span>

    </a>

    <span class="box tag-dropdown"
      v-if="tagDropdown"
    >
      <aside class="menu">
        <ul class="menu-list">
          <li>
            <p class="control">
              <input
              class="input tag-input"
              :class="[tagError ? 'is-danger' : '']"
              type="text"
              placeholder="Add tag"
              ref="tagInputBox"
              @keydown.enter.prevent.stop="addTag"
              @keydown.down.prevent.stop="focusSuggestions"
              @keydown.esc.prevent.stop="closeTagSuggestion"
              @contextmenu.prevent="context"
              title="Type tag then hit enter"
              v-model="tagEnter"
              tabindex="4"
            >
            </p>
            <div class="box tag-help" v-if="tagSuggestions().length > 0 && tagEnter" >
              <aside class="menu">
                <ul class="menu-list tag-help-list">
                  <template v-for="tag in tagSuggestions()">
                    <li
                      @click.prevent.stop="populateTag(tag)"
                      @keydown.enter.prevent.stop="populateTag(tag)"
                      @keydown.space.prevent.stop="populateTag(tag)"
                      @keydown.down.prevent.stop="nextTagSuggestion($event)"
                      @keydown.up.prevent.stop="previousTagSuggestion($event)"
                      @keydown.tab.prevent.stop="nextTagSuggestion($event)"
                      @keydown.tab.shift.prevent.stop="previousTagSuggestion($event)"
                      @keydown.esc.prevent.stop="focusTagInput"
                      tabindex="4"
                      class="tag-help-list-item"
                      >
                      <a>{{tag}}</a>
                    </li>
                  </template>
                </ul>
              </aside>
            </div>
          </li>

          <template v-for="tag in tags">
            <li
            title="Right click to modify"
            @contextmenu.prevent="tagContext(tag)"
            >
              <a>{{tag}}</a>
            </li>
          </template>
        </ul>
      </aside>
    </span>

  </p>
  <!-- end tag button -->
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
export default {
  name: 'tag-dropdown',
  mixins: [
    clickaway
  ],
  data () {
    return {
      tagDropdown: false,
      tagEnter: '',
      tagError: false
    }
  },
  computed: {
    tags () {
      return this.$store.state.mainWindow.activeNote.metadata.tags
    },
    hasTags () {
      if (typeof this.tags !== 'undefined') {
        return this.tags.length > 0
      }
    }
  },
  methods: {
    toggleTagDropdown () {
      this.tagError = false
      this.tagDropdown = !this.tagDropdown
      if (this.tagDropdown) {
        this.$nextTick(() => {
          this.$refs.tagInputBox.focus()
        })
      }
    },
    addTag () {
      let noteId = this.$store.state.mainWindow.activeNote.id
      let newTag = this.tagEnter
      if (newTag.length === 0) {
        this.tagError = true
        return
      }
      this.$store.dispatch('updateTagInputBox', {
        id: noteId,
        tag: newTag
      })
      this.tagEnter = ''
      this.$store.dispatch('updateSaveStatus')
      this.tagError = false
    },
    closeTagDropdown () {
      this.tagDropdown = false
    },
    startsWithFilter (val) {
      if (val.toLowerCase().startsWith(this.tagEnter.toLowerCase())) {
        return true
      } else {
        return false
      }
    },
    removeTaggedFilter (val) {
      if (this.tags.indexOf(val) >= 0) {
        return false
      } else {
        return true
      }
    },
    tagSuggestions () {
      return Object.keys(window.collate.collection.tags)
        .filter(this.startsWithFilter)
        .filter(this.removeTaggedFilter)
    },
    populateTag (tag) {
      this.tagEnter = tag
      this.addTag()
      this.tagError = false
      this.$nextTick(() => {
        this.$refs.tagInputBox.focus()
      })
    },
    closeTagSuggestion () {
      if (this.tagEnter) {
        this.tagEnter = ''
      } else {
        this.closeTagDropdown()
      }
    },
    focusSuggestions () {
      let items = document.getElementsByClassName('tag-help-list-item')
      if (items.length >= 1) {
        items[0].focus()
      }
    },
    focusTagInput () {
      this.$nextTick(() => {
        this.$refs.tagInputBox.focus()
      })
    },
    nextTagSuggestion (event) {
      let next = event.target.nextElementSibling
      if (next) {
        next.focus()
      } else {
        this.focusSuggestions()
      }
    },
    previousTagSuggestion (event) {
      let previous = event.target.previousElementSibling
      if (previous) {
        previous.focus()
      }
    },
    tagContext (tag) {
      window.collate.tagMenuTag = tag
      window.collate.tagMenuNoteId = this.$store.state.mainWindow.activeNoteId
      window.collate.tagMenu.popup()
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../../variables.scss";
.tag-input {
  width: 200px;
}
.tag-dropdown {
  position: absolute;
  background-color: $body-background;
  top: 35px;
  right: 0px;
  z-index: 9999;
  padding: 10px;
  width: 200px;
}
.tag-dropdown li {
  list-style: none;
}
.tag-dropdown li a {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tag-help {
  display: block;
  position: absolute;
  top: 45px;
  left: 10px;
  padding: 0;
  margin: 0;
  min-width: 100px;
  max-width: 200px;
}
.tag-help-list {
  background-color: $body-background;
  margin: 0;
  padding: 0;
  border-left: none;
}
</style>
