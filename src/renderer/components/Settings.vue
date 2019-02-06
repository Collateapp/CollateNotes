<style scoped>
</style>

<template>
  <span class='settings-window columns'>
    <notification></notification>
    <settings-toolbar></settings-toolbar>
    <settings-sidebar class="column is-2 is-gapless"></settings-sidebar>
    <settings-content class="column is-10 is-gapless"></settings-content>
  </span>
</template>

<script>
  import SettingsContent from './Settings/SettingsContent'
  import SettingsSidebar from './Settings/SettingsSidebar'
  import SettingsToolbar from './Settings/SettingsToolbar'
  import Notification from './MainWindow/Shared/Notification'
  export default {
    name: 'settings',
    components: {
      SettingsToolbar,
      SettingsContent,
      SettingsSidebar,
      Notification
    }
  }
</script>
