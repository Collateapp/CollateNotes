<template>
  <div class="tutorial">
    <div class="step-1 message" @click.prevent="nextMsg" >
      <a class="title" v-html="message"></a>
    </div>
    <div class="controls">
      <div class="back">
        <a class="skip-tutorial" @click.prevent="prevMsg">←</a>
      </div>
      <div class="skip">
        <a class="skip-tutorial" @click.prevent="skipTutorial" v-if="msgIdx === messages.length - 1">Close</a>
        <a class="skip-tutorial" @click.prevent="skipTutorial" v-else>Skip Introduction</a>
      </div>
      <div class="back">
        <a class="skip-tutorial" @click.prevent="nextMsg">→</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tutorial',
  data () {
    return {
      msgIdx: 0,
      messages: [
        'Let\'s begin. Click to start.',
        'Hi, Welcome to Collate!',
        'Let\'s create a collection and get started taking notes.',
        '1. Click the Collate logo on the top left to open up the Collection pane.<br /><br />2. Click New and choose a location for your data.<br /><br />3. Click on the Collection.',
        'Then click on a notebook (left pane) to open it up.',
        'Click on a note to view it in the editor.',
        'To create a new note, click on the +Markdown button.',
        'To create different types of notes, click the down caret ▼ and choose a Note Type.',
        'The right click menu opens up an additional world of possibilities. Try right clicking on a note.',
        'To change settings, defaults, and keyboard shortcuts, check out Collate > Settings in the menubar.',
        'To import notes from Evernote, Markdown or Text Files, choose Collate > Import in the menubar.',
        'Use the search bar on top to find notes.',
        'Thanks for using Collate!'
      ]
    }
  },
  computed: {
    message () {
      return this.messages[this.msgIdx]
    }
  },
  methods: {
    skipTutorial () {
      this.$emit('CloseTutorial')
    },
    prevMsg () {
      if (this.msgIdx > 0) this.msgIdx--
    },
    nextMsg () {
      if (this.msgIdx <= this.messages.length - 2) this.msgIdx++
    }
  }
}
</script>

<style scoped lang="scss">
  @import "../../variables.scss";

  .tutorial {
    display: flex;
    flex-direction: column;
    position: fixed;
    width: 100%;
    height: 100%;
    z-index: 9999;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  .message {
    display: flex;
    flex-direction: column;
    width: 45%;
    height: 45%;
    margin: 0;
    padding: 1em;
    align-self: center;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background-color: $white-bis;
    opacity: 0.9;
    line-height: 1.6;
    text-align: center;
    pointer-events: auto;
    -webkit-user-select: none;
    user-select: none;
    cursor: pointer;
  }

  .skip {
    pointer-events: auto;
  }

  .controls {
    pointer-events: auto;
    width: 45%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
</style>
