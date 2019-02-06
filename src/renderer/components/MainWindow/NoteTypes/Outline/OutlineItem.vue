<template>
  <div class="outline-item" :id="item.id">
    <article class="media">

      <div class="outline-bullet">
        <span class="outline-bullet-icon"
          @contextmenu.prevent="callPopup(item.id)"
          @click.prevent="zoom(item.id)"
        >
          <i class="fa" :class="[item.completed ? 'fa-check-circle-o' : 'fa-circle-o']"></i>
        </span>
      </div>

      <div class="media-content">
        <div class="content">
          <input
            :id="item.id + '-title'"
            class="outline-input"
            :class="[item.completed ? 'strikethrough' : '']"
            v-model="item.title"
            @keydown.enter.prevent="enterKey($event)"
            @keydown.delete="backspaceKey($event)"
            @keydown.tab.prevent="tabKey($event)"
            @keydown.up.prevent="upKey($event)"
            @keydown.down.prevent="downKey($event)"
            @contextmenu.prevent="context"
          >
          </p>
        </div>
      </div>
    </article>

    <div
      class="outline-children"
      v-for="child in item.children">
      <outline-item
        :ancestor="parent"
        :parent="item"
        :item="child"
        :isRoot="false"
        :parentId="item.id"
        @removeItem="echoRemove"
        @addEmpty="addItem"
        @nestItem="nestItem"
        @unNestItem="unNestItem"
        @focusDown="focusDown"
        @zoom="zoom"
      ></outline-item>
    </div>
  </div>
</template>


<script>
import log from 'electron-log'
export default {
  name: 'outline-item',
  props: [
    'item',
    'parent',
    'parentId',
    'ancestor',
    'isRoot'
  ],
  methods: {
    callPopup (id) {
      window.collate.outlineMenuTarget = id
      window.collate.outlineMenu.popup()
    },
    generateEmpty () {
      return {
        id: this.generateId(),
        title: '',
        children: [],
        completed: false
      }
    },
    generateAndAppendId (item) {
      let id = Math.random().toString(36).substr(2, 16)
      item.id = id
      return id
    },
    generateId (item) {
      return Math.random().toString(36).substr(2, 16)
    },
    enterKey () {
      this.$emit('addEmpty', this.item)
    },
    backspaceKey (e) {
      if (this.item.title.length === 0) {
        e.preventDefault()
        this.$emit('removeItem', this.item.id)
      }
    },
    echoRemove (id) {
      this.$emit('removeItem', id)
    },
    tabKey (e) {
      if (e.shiftKey) {
        this.$emit('unNestItem', this.item.id)
      } else {
        this.$emit('nestItem', this.item.id)
      }
    },
    upKey (e) {
      if (e.shiftKey) {
        this.moveUp()
      } else {
        if (!this.parent) return
        let currentItemIndex = this.parent.children.indexOf(this.item)
        if (currentItemIndex < 0) {

        } else if (currentItemIndex === 0) {
          // Focus on parent
          document.getElementById(this.parent.id + '-title').focus()
        } else {
          let nextSibling = this.parent.children[currentItemIndex - 1]
          if (typeof nextSibling !== 'undefined' || !nextSibling) {
            let node = nextSibling
            while (true) {
              if (node.children.length > 0) {
                node = node.children[node.children.length - 1]
              } else {
                break
              }
            }
            document.getElementById(node.id + '-title').focus()
          }
        }
      }
    },
    downKey (e) {
      if (e.shiftKey) {
        this.moveDown()
      } else {
        if (this.item.children.length > 0) {
          // Move to first child
          document.getElementById(this.item.children[0].id + '-title').focus()
        } else {
          let currentItemIndex = this.parent.children.indexOf(this.item)

          if (currentItemIndex + 1 >= this.parent.children.length) {
            if (!this.ancestor) return
            // If last item of siblings to to parent's next sibing
            let parentIndex = this.ancestor.children.indexOf(this.parent)
            if (parentIndex + 1 >= this.ancestor.children.length) {
              // Hanging off a clif.  Call up
              this.$emit('focusDown')
              return
            }
            let nextAncestorIndex = this.ancestor.children[parentIndex + 1]
            document.getElementById(nextAncestorIndex.id + '-title').focus()
          } else {
            // If not last sibing, go to next
            document.getElementById(this.parent.children[currentItemIndex + 1].id + '-title').focus()
          }
        }
      }
    },
    focusDown () {
      if (this.parent.children.length > 0) {
        let currentItemIndex = this.parent.children.indexOf(this.item)
        if (currentItemIndex + 1 >= this.parent.children.length) {
          if (!this.ancestor) return
          // If last item of siblings to to parent's next sibing
          let parentIndex = this.ancestor.children.indexOf(this.parent)
          if (parentIndex + 1 >= this.ancestor.children.length) {
            // Hanging off a clif.  Call up
            this.$emit('focusDown')
            return
          }
          let nextAncestorIndex = this.ancestor.children[parentIndex + 1]
          document.getElementById(nextAncestorIndex.id + '-title').focus()
        } else {
          // If not last sibing, go to next
          document.getElementById(this.parent.children[currentItemIndex + 1].id + '-title').focus()
        }
      } else {
        this.$emit('focusDown')
      }
    },
    addItem (target) {
      let empty = this.generateEmpty()
      this.item.children.splice(this.item.children.indexOf(target) + 1, 0, empty)
      this.$nextTick(() => {
        let el = document.getElementById(empty.id + '-title')
        if (el) {
          this.$nextTick(() => {
            el.focus()
          })
        }
      })
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
    nestItem (id) {
      if (this.item.children.length <= 1) return
      let targetChild
      let newParent
      for (let i = 0; i < this.item.children.length; i++) {
        // Get id match
        if (this.item.children[i].id === id) {
          // if it's the first element in array, exit
          if (i === 0) return
          // find next sibling and nest under there
          targetChild = this.item.children[i]
          newParent = this.item.children[i - 1]
          // Remove the item from the current item
          this.item.children.splice(i, 1)
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
      if (this.parentId === 'root') return
      let target
      for (let i = 0; i < this.item.children.length; i++) {
        if (this.item.children[i].id === id) {
          target = this.item.children[i]
          // Remove item from children
          this.item.children.splice(i, 1)
          let selfIndex = this.parent.children.indexOf(this.item)
          this.parent.children.splice(selfIndex + 1, 0, target)
          this.$nextTick(() => {
            let el = document.getElementById(id + '-title')
            if (el) el.focus()
          })
          return
        }
      }
    },
    moveUp () {
      let parent = this.parent
      let id = this.item.id
      if (typeof parent !== 'undefined' && parent.hasOwnProperty('children')) {
        let targetIndex
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].id === id) {
            targetIndex = i
          }
        }
        if (targetIndex > 0) {
          parent.children.splice(targetIndex - 1, 2, parent.children[targetIndex], parent.children[targetIndex - 1])
          this.$nextTick(() => {
            document.getElementById(id + '-title').focus()
          })
        }
      }
    },
    moveDown () {
      let parent = this.parent
      let id = this.item.id
      if (typeof parent !== 'undefined' && parent.hasOwnProperty('children')) {
        let targetIndex
        for (let i = 0; i < parent.children.length; i++) {
          if (parent.children[i].id === id) {
            targetIndex = i
          }
        }
        if (targetIndex < parent.children.length - 1) {
          parent.children.splice(targetIndex, 2, parent.children[targetIndex + 1], parent.children[targetIndex])
          this.$nextTick(() => {
            document.getElementById(id + '-title').focus()
          })
        }
      }
    },
    zoom (id) {
      this.$emit('zoom', id)
    },
    context () {
      try {
        window.collate.editMenu.popup()
      } catch (e) {
        log.info('Error occurred while opening popup menu (window out of focus)')
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../../../variables.scss";
  .outline-item {
    margin-left: 2em;
    margin-top: 0.1em;
    margin-bottom: 0.1em;
    overflow: hidden;
    overflow-y: auto;
    width: 100%;
  }
  .media {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    margin: 0;
    padding: 0;
  }
  .outline-bullet {
    height: 24px;
    width: 24px;
    display: flex;
    align-content: center;
    justify-content: center;
    align-items: center;
    border-radius: 24px;
  }
  .outline-bullet-icon {
    margin: 0;
    padding: 0;
  }
  .outline-bullet-icon i {
    vertical-align: middle;
    margin-bottom: 4px;
    font-size: 12pt;
    color: $grey;
  }
  .outline-bullet:hover {
    background-color: $grey-light;
  }
  .outline-input {
    width: 100%;
    height: 21px;
    padding-left: 5px;
    font-size: 1.1em;
    border: none;
    outline: none;
  }
  .strikethrough {
    text-decoration: line-through;
  }
  .outline-children {
    margin: 0;
    padding: 0;
    border-left: 1px solid $border-color-dark;
    margin-left: 10px;
  }
</style>
