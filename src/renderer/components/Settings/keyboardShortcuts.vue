<style lang="scss" scoped>
li {
  margin-left: 2em;
}
</style>

<template>
  <div>
    <div class="columns">
      <div class="column">
        <label class="label">Keyboard Shortcuts</label>
      </div>
    </div>
    <div class="columns">
      <div class="column">
        <template v-for="(shortcut, name) in shortcuts">
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label">{{name}}</label>
                <p class="control">
                  <input class="input" type="text" :value="shortcut" @change="saveKeyCombo(name, $event)">
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="column">
        <strong>Keyboard shortcuts <small>beta</small></strong>
        <p>
          Modify keyboard shortcuts by inputting the desired key combo. Leave blank for no keyboard shortcut. Restart the programing after changing the shortcut for changes to take effect.
        </p>
        <p>
          Valid keys are designated by the following:
        </p>
        <p>
          <ul>
            <li>
              <code>ctrl</code> Use ctrl for the Control key on Windows/Linux or Command on Mac
            </li>
            <li>
              <code>alt</code> Use alt for the Alt key on Windows/Linux or Option on Mac
            </li>
            <li>
              <code>shift</code>
            </li>
            <li>
              <code>a-z0-9,./\ <small>etc...</small></code> Alphanumeric keys and symbols
            </li>
            <li>
              <code>up, down, left, right</code> arrow keys
            </li>
            <li>
              <code>f1 - f12</code> Function keys
            </li>
          </ul>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    shortcuts () {
      return this.$store.state.settings.keyboardShortcuts
    }
  },
  methods: {
    saveKeyCombo (name, event) {
      event.target.value = event.target.value.toLowerCase()

      // Check if keyboard shortcut is already taken
      if (this.shortcutTaken(event.target.value)) {
        let comboName
        let currentCombo
        for (let shortcutName in this.shortcuts) {
          const shortcut = this.shortcuts[shortcutName]
          if (shortcut === event.target.value) {
            comboName = shortcutName
          }
          if (shortcutName === name) {
            currentCombo = shortcut
          }
        }
        this.$store.dispatch('showNotification', {
          message: 'Shortcut is currently being used by ' + comboName + '. Please choose another shortcut.',
          class: 'is-danger',
          duration: 10000
        })
        event.target.value = currentCombo
        return
      }
      this.$store.dispatch('setKeyboardShortcut', {name: name, keyCombo: event.target.value})
      this.$store.dispatch('showNotification', {
        message: 'Shortcut saved. Restart program to implement changes.',
        class: 'is-success',
        duration: 10000
      })
    },
    shortcutTaken (keyCombo) {
      if (Object.values(this.shortcuts).indexOf(keyCombo) >= 0) {
        return true
      } else {
        return false
      }
    }
  }
}
</script>
