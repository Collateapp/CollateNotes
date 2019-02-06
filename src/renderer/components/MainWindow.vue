<template>
  <div class='main-window columns'>
    <toolbar class="toolbar"></toolbar>

    <tutorial v-if="walkthrough" @CloseTutorial="walkthroughComplete"></tutorial>
    <drop-target></drop-target>
    <transition
      enter-active-class="animated slideInLeft"
      leave-active-class="animated slideOutLeft"
    >
    <collection-pane
      id="collection-pane"
      v-if="!collectionPaneHidden"
    >
    </collection-pane>
    </transition>

    <notebook-pane
      id="notebook-pane"
      v-if="!notebookPaneHidden"
      class="notebook-pane column is-2 is-gapless"
      >
    </notebook-pane>

    <note-pane
      class="note-pane column is-gapless"
      v-if="!notePaneHidden"
      :class="[notebookPaneHidden ? 'is-4' : 'is-3']"
    ></note-pane>

    <editors
      v-if="editorVisible"
      class="editor-pane column is-gapless"
      :class="[notebookPaneHidden && !notePaneHidden ? 'is-8' : notebookPaneHidden && notePaneHidden ? 'is-12' : 'is-7']"
    ></editors>

    <transition
      enter-active-class="animated slideInRight"
      leave-active-class="animated slideOutRight"
    >
      <help-pane v-on-clickaway="closeHelpPane" v-if="!helpPaneHidden"></help-pane>
    </transition>

    <transition
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOutUp"
    >
      <new-notebook-dropdown v-if="newNotebookDropdown"></new-notebook-dropdown>
      <rename-notebook-dropdown v-if="renameNotebookDropdown"></rename-notebook-dropdown>
      <move-notebook-dropdown v-if="moveNotebookDropdown"></move-notebook-dropdown>
    </transition>

    <transition
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <loading-overlay v-if="loadingModalActive"></loading-overlay>
    </transition>

    <transition
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOutUp"
    >
      <notification></notification>
    </transition>

    <div
      class="hide-btn"
      @click="collapse"
      title="Toggle compact view"
    ></div>
    <span class="icon hide-btn-icon">
      <i class="fa" :class="toolbarCollapseIcon"></i>
    </span>

    <progress-bar class="progress-bar" v-if="percentage"></progress-bar>
  </div>
</template>

<script>
  import Toolbar from './MainWindow/Toolbar.vue'
  import Editors from './MainWindow/Editors.vue'
  import NotebookPane from './MainWindow/NotebookPane.vue'
  import NotePane from './MainWindow/NotePane.vue'
  import HelpPane from './MainWindow/HelpPane.vue'
  import InputModal from './MainWindow/Shared/InputModal.vue'
  import NewNotebookDropdown from './MainWindow/Shared/NewNotebookDropdown.vue'
  import RenameNotebookDropdown from './MainWindow/Shared/RenameNotebookDropdown.vue'
  import MoveNotebookDropdown from './MainWindow/Shared/MoveNotebookDropdown.vue'
  import LoadingOverlay from './MainWindow/Shared/LoadingOverlay.vue'
  import Notification from './MainWindow/Shared/Notification.vue'
  import ProgressBar from './MainWindow/Progress.vue'
  import CollectionPane from './MainWindow/CollectionPane.vue'
  import Tutorial from './MainWindow/Tutorial.vue'
  import DropTarget from './MainWindow/DropTarget.vue'
  import { mixin as clickaway } from 'vue-clickaway'
  export default {
    name: 'main-window',
    components: {
      Toolbar,
      Editors,
      NotebookPane,
      NotePane,
      HelpPane,
      InputModal,
      NewNotebookDropdown,
      RenameNotebookDropdown,
      MoveNotebookDropdown,
      LoadingOverlay,
      Notification,
      ProgressBar,
      CollectionPane,
      Tutorial,
      DropTarget
    },
    mixins: [
      clickaway
    ],
    data () {
      return {
        tutorialHidden: true
      }
    },
    computed: {
      newNotebookDropdown () {
        return this.$store.state.mainWindow.newNotebookDropdown
      },
      renameNotebookDropdown () {
        return this.$store.state.mainWindow.renameNotebookDropdown
      },
      moveNotebookDropdown () {
        return this.$store.state.mainWindow.moveNotebookDropdown
      },
      loadingModalActive () {
        return this.$store.state.mainWindow.loadingModalActive
      },
      editorVisible () {
        return this.$store.state.mainWindow.editorVisible
      },
      notebookPaneHidden () {
        return this.$store.state.mainWindow.hideNotebookPane
      },
      notePaneHidden () {
        return this.$store.state.mainWindow.hideNotePane
      },
      helpPaneHidden () {
        return this.$store.state.mainWindow.hideHelpPane
      },
      collectionPaneHidden () {
        return this.$store.state.mainWindow.hideCollectionPane
      },
      percentage () {
        return this.$store.state.mainWindow.progressPercentage
      },
      toolbarCollapseIcon () {
        let notebookHidden = this.$store.state.mainWindow.hideNotebookPane
        let noteHidden = this.$store.state.mainWindow.hideNotePane
        if (!notebookHidden && !noteHidden) {
          return 'fa-angle-double-left'
        } else if (notebookHidden && !noteHidden) {
          return 'fa-angle-left'
        } else if (notebookHidden && noteHidden) {
          return 'fa-undo'
        } else {
          return 'fa-angle-double-left'
        }
      },
      walkthrough () {
        return this.$store.state.settings.walkthrough
      }
    },
    methods: {
      closeHelpPane () {
        this.$store.dispatch('updateHideHelpPane', true)
      },
      getActiveNotebookId () {
        return this.$store.state.mainWindow.activeNotebookId
      },
      collapse () {
        let notebookHidden = this.$store.state.mainWindow.hideNotebookPane
        let noteHidden = this.$store.state.mainWindow.hideNotePane

        if (!notebookHidden && !noteHidden) {
          this.$store.dispatch('updateHideNotebookPane', true)
        } else if (notebookHidden && !noteHidden) {
          this.$store.dispatch('updateHideNotePane', true)
        } else if (notebookHidden && noteHidden) {
          this.$store.dispatch('updateHideNotebookPane', false)
          this.$store.dispatch('updateHideNotePane', false)
        }
      },
      walkthroughComplete () {
        this.$store.commit('UPDATE_WALKTHROUGH', false)
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import "../variables.scss";
  .notebook-pane {
    overflow-y: auto;
  }
  .hidden {
    display: none;
  }
  .editor-pane {
    margin-top: 0;
    padding-top: 0;
  }
  .progress-bar {

  }
  .hide-btn {
    display: block;
    position: fixed;
    -webkit-transform: rotate(45deg);
    width: 100px;
    height: 100px;
    left: -60px;
    bottom: -60px;
    z-index: 8;
    background-color: $primary;
    cursor: pointer;
    transition: all 250ms ease-in-out;
    &:hover {
      left: -58px;
      bottom: -58px;
    }
    &:active {
      left: -62px;
      bottom: -62px;
    }
  }
  .hide-btn-icon {
    z-index: 9;
    color: $white;
    display: block;
    position: fixed;
    bottom: 4px;
    left: 6px;
    pointer-events: none;
  }

</style>
