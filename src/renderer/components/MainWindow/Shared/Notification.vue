<style>
.notification-box {
  display: block;
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}
</style>


<template>
  <div
    class="notification notification-box"
    :class="notificationClass"
    v-if="active"
    >
    <button class="delete" @click="close"></button>
    <span v-html="message"></span>
  </div>
</template>

<script>
export default {
  name: 'notification',
  computed: {
    active () {
      return this.$store.state.notification.active
    },
    message () {
      return this.$store.state.notification.message
    },
    notificationClass () {
      return this.$store.state.notification.class
    }
  },
  methods: {
    close () {
      this.$store.dispatch('hideNotification')
    }
  }
}
</script>
