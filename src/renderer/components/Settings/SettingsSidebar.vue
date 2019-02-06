<style scoped lang="scss">
  @import "../../variables.scss";
  .settings-sidebar {
    display: flex;
    flex: 1;
    align-items: stretch;
    flex-direction: column;
  }
  .settings-sidebar-header {
    display: flex;
    flex: 1;
    align-items: flex-start;
    justify-content: left;
  }
  .settings-sidebar-footer {
    display: flex;
    flex: 1;
    align-items: flex-end;
    justify-content: left;
  }
  .back:hover {
    color: $hover-highlight;
  }
  .back:active {
    padding-top: 2px;
    color: $hover-highlight;
  }
</style>

<template>
    <div class="settings-sidebar">
      <div class="settings-sidebar-header">
        <a class="back" @click.prevent="goBack">←Back</a>
      </div>
      <div class="settings-sidebar-footer">
        <a class="back" @click.prevent="resetSettings" title="Reset settings to default">Reset Settings</a>
      </div>
    </div>
</template>

<script>
export default {
  name: 'settings-sidebar',
  methods: {
    goBack () {
      if (!this.$store.state.settings.collectionPath) {
        alert('Please set the Collection Path')
        return false
      }
      this.$router.push('/')
    },
    resetSettings () {
      let conf = confirm('Reset all settings to their default values?')
      if (conf) {
        this.$store.dispatch('resetSettings')
      }
    }
  }
}
</script>
