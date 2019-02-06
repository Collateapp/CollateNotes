<template>
  <div class="outline-editor">
    <div class="breadcrumbs">
      <template v-for="routeItem in generateRoute()">
        <a
          @click.prevent="zoomResolver(routeItem.id)"
          class="breadcrumb"
        >{{routeItem.title}}</a>
        <span class="breadcrumb-caret">></span>
      </template>
    </div>

    <div
      class="outline"
    >
      <outline-item
        parentId="root"
        :item="zoomParent"
        :parent="null"
        :ancestor="null"
        :isRoot="true"
        @removeItem="removeId"
        @addEmpty="addItem"
        @zoom="zoomResolver"
        @complete="completeResolver"
      ></outline-item>
    </div>

    <span class="icon outline-btn" v-if="windowType === 'main'">
      <i class="fa fa-info-circle" @click.prevent.stop="openHelp"></i>
    </span>
  </div>
</template>

<script>
import {remote} from 'electron'
import OutlineItem from './OutlineItem'
import debounce from '../../../../lib/debounce.js'
import log from 'electron-log'
export default {
  components: {
    OutlineItem
  },
  data () {
    return {
      zoomParent: {},
      item: {
        id: this.generateId(),
        title: 'Home',
        children: []
      },
      default: {
        id: this.generateId(),
        title: 'Home',
        children: []
      }
    }
  },
  created () {
    window.collate.outlineMenuTarget = null
    window.collate.outlineMenu = new remote.Menu()
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Zoom',
      click: (menuItem, browserWindow, event) => {
        this.zoomResolver(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Complete',
      click: (menuItem, browserWindow, event) => {
        this.completeResolver(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Delete',
      click: (menuItem, browserWindow, event) => {
        this.removeId(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      type: 'separator'
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Up',
      click: (menuItem, browserWindow, event) => {
        this.moveUp(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Down',
      click: (menuItem, browserWindow, event) => {
        this.moveDown(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Nest',
      click: (menuItem, browserWindow, event) => {
        this.nestItem(window.collate.outlineMenuTarget)
      }
    }))
    window.collate.outlineMenu.append(new remote.MenuItem({
      label: 'Flatten',
      click: (menuItem, browserWindow, event) => {
        this.unNestItem(window.collate.outlineMenuTarget)
      }
    }))
  },
  mounted () {
    this.initialize()
    this.debouncedUpdate = debounce(() => {
      this.$store.dispatch('updateNoteMetadata', {key: 'outline', value: this.item})
    }, 200)
    this.debouncedAutoSave = debounce((body) => {
      this.$store.dispatch('updateSaveStatus')
    }, 500)
  },
  watch: {
    item: {
      handler: function () {
        let activeNote = this.$store.state.mainWindow.activeNoteId
        this.debouncedUpdate()
        if (activeNote === window.collate.activeNoteIdStorage) {
          this.debouncedAutoSave()
        }
        window.collate.activeNoteIdStorage = activeNote
      },
      deep: true
    },
    noteId (v) {
      this.initialize()
    }
  },
  computed: {
    noteId () {
      return this.$store.state.mainWindow.activeNoteId
    },
    windowType () {
      return this.$store.state.mainWindow.windowType
    }
  },
  methods: {
    initialize () {
      if (!window.collate.hasOwnProperty('editorHistory')) {
        window.collate.activeNoteIdStorage = ''
      }
      try {
        // Try loading data from the YAML metadata
        if (this.$store.state.mainWindow.activeNote.metadata.outline != null) {
          this.item = this.$store.state.mainWindow.activeNote.metadata.outline
        } else {
          // Legacy - stored data as JSON in body.
          this.item = JSON.parse(this.$store.state.mainWindow.activeNote.body)
        }
      } catch (e) {
        log.warn('Error while initializing Outline Editor ' + e)
        // If errors go to default
        this.item = this.default
      }
      this.zoomParent = this.item
    },
    generateId (item) {
      return Math.random().toString(36).substr(2, 16)
    },
    generateAndAppendId (item) {
      let id = Math.random().toString(36).substr(2, 16)
      item.id = id
      return id
    },
    generateEmpty () {
      return {
        id: this.generateId(),
        title: '',
        children: [],
        completed: false
      }
    },
    processResult (node, id, result) {
      if (result) {
        let childIndex = node.children.indexOf(result)
        if (childIndex > -1) {
          // Remove the item with the id
          node.children.splice(childIndex, 1)
          // Find the next item and focus on it
          let nextSiblingIndex
          let el
          if (childIndex > 0 && childIndex < node.children.length) {
            nextSiblingIndex = childIndex
          } else if (childIndex === 0) {
            el = document.getElementById(node.id + '-title')
          } else {
            nextSiblingIndex = node.children.length - 1
            el = document.getElementById(node.children[nextSiblingIndex].id + '-title')
          }
          if (el) el.focus()
        }
      } else {

      }
    },
    removeId (id) {
      let result = this.findId(this.item, id)
      this.processResult(this.item, id, result)
    },
    findId (node, id, remove) {
      if (typeof remove === 'undefined') remove = true
      if (node.id === id) {
        return node
      } else if (node.hasOwnProperty('children')) {
        for (let child of node.children) {
          let result = this.findId(child, id, remove)
          if (result) {
            if (remove) this.processResult(node, id, result)
            return result
          }
        }
      } else {
        return null
      }
    },
    getParent (node, id) {
      if (node.id === id) {
        return true
      } else {
        if (node.hasOwnProperty('children')) {
          for (let i = 0; i < node.children.length; i++) {
            let child = node.children[i]
            let result = this.getParent(child, id)
            if (result === true) {
              return node
            } else if (typeof result !== 'undefined') {
              return result
            }
          }
        }
      }
    },
    addItem () {
      let empty = this.generateEmpty()
      this.zoomParent.children.push(empty)
      this.$set(this.zoomParent, 'children', this.zoomParent.children)
      this.$nextTick(() => {
        let el = document.getElementById(empty.id + '-title')
        if (el) {
          this.$nextTick(() => {
            el.focus()
          })
        }
      })
    },
    zoomResolver (id) {
      let node = this.findId(this.item, id, false)
      if (node) this.zoomParent = node
    },
    generateRoute () {
      let routeMap = this.mapPath(this.item, this.zoomParent.id, [])
      if (typeof routeMap === 'undefined') routeMap = []
      return routeMap.reverse()
    },
    mapPath (node, id, pathMap) {
      if (node.id === id) {
        pathMap.push(node)
        return pathMap
      } else {
        if (node.hasOwnProperty('children')) {
          for (let i = 0; i < node.children.length; i++) {
            let result = this.mapPath(node.children[i], id, pathMap)
            if (result && typeof result !== 'undefined') {
              pathMap.push(node)
              return pathMap
            }
          }
        }
      }
    },
    completeResolver (id) {
      let node = this.findId(this.item, id, false)
      node.completed = !node.completed
    },
    nestItem (id) {
      let node = this.getParent(this.item, id)
      if (node.children.length <= 1) return
      let targetChild
      let newParent
      for (let i = 0; i < node.children.length; i++) {
        // Get id match
        if (node.children[i].id === id) {
          // if it's the first element in array, exit
          if (i === 0) return
          // find next sibling and nest under there
          targetChild = node.children[i]
          newParent = node.children[i - 1]
          // Remove the item from the current item
          node.children.splice(i, 1)
          // Insert it into the target parent
          newParent.children.push(targetChild)
          // Focus on the child element
          this.$nextTick(() => {
            let el = document.getElementById(targetChild.id + '-title')
            if (el) el.focus()
          })
          return
        }
      }
    },
    unNestItem (id) {
      let parentNode = this.getParent(this.item, id)
      let ancestorNode = this.getParent(this.item, parentNode.id)
      if (parentNode.id === 'root') return
      let target
      for (let i = 0; i < parentNode.children.length; i++) {
        if (parentNode.children[i].id === id) {
          target = parentNode.children[i]
          // Remove item from children
          parentNode.children.splice(i, 1)
          let selfIndex = ancestorNode.children.indexOf(parentNode)
          ancestorNode.children.splice(selfIndex + 1, 0, target)
          this.$nextTick(() => {
            let el = document.getElementById(id + '-title')
            if (el) el.focus()
          })
          return
        }
      }
    },
    moveUp (id) {
      let parent = this.getParent(this.item, id)
      if (typeof parent !== 'undefined' && parent.hasOwnProperty('children')) {
        let targetIndex
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].id === id) {
            targetIndex = i
          }
        }
        if (targetIndex > 0) {
          parent.children.splice(targetIndex - 1, 2, parent.children[targetIndex], parent.children[targetIndex - 1])
        }
      }
    },
    moveDown (id) {
      let parent = this.getParent(this.item, id)
      if (typeof parent !== 'undefined' && parent.hasOwnProperty('children')) {
        let targetIndex
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].id === id) {
            targetIndex = i
          }
        }
        if (targetIndex < parent.children.length - 1) {
          parent.children.splice(targetIndex, 2, parent.children[targetIndex + 1], parent.children[targetIndex])
        }
      }
    },
    openHelp () {
      this.$store.dispatch('updateHelpPanePage', 'outline')
      this.$store.dispatch('updateHideHelpPane', false)
    }
  }
}
</script>

<style scoped lang="scss">
@import "../../../../variables.scss";
.outline-editor {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
  width: 100%;
  padding: 1em 1em 1em 0;
  border: 1px solid $border-color-dark;
  box-shadow: inset 0 1px 2px rgba(10, 10, 10, 0.1);
  color: $text;
  border-radius: 4px;
  overflow-y: auto;
}
.outline {
  margin-left: -1em;
  padding-left: 0;
}
.breadcrumbs {
  margin-left: 0.75em;
  margin-bottom: 0.5em;
  font-size: 12pt;
  border-bottom: 1px solid $border-color-dark;
}
.breadcrumb-caret {
  font-size: 10pt;
  color: $grey;
  margin-right: 0.5em
}
.help {
  position: absolute;
  display: block;
  margin: 0;
  padding: 0;
  top: 0;
  right: 0;
}
.outline-btn {
  position: absolute;
  display: block;
  right: 30px;
  color: rgba(0,0,0,0.50);
  cursor: pointer;
}
.outline-btn:hover {
  color: rgba(0,0,0,0.9);
}
</style>
