let state = {
  active: false,
  message: '',
  class: 'is-primary',
  duration: 5000
}

const mutations = {
  SHOW_NOTIFICATION (state, val) {
    state.active = val
    if (val === true && val !== -1) {
      setTimeout(() => {
        state.active = false
      }, state.duration)
    }
  },
  UPDATE_NOTIFICATION_MESSAGE (state, val) {
    state.message = val
  },
  UPDATE_NOTIFICATION_CLASS (state, val) {
    state.class = val
  },
  UPDATE_NOTIFICATION_DURATION (state, val) {
    state.duration = val
  }
}

const actions = {
  showNotification ({commit}, payload) {
    commit('UPDATE_NOTIFICATION_MESSAGE', payload.message)
    if (payload.hasOwnProperty('class')) {
      commit('UPDATE_NOTIFICATION_CLASS', payload.class)
    }
    if (payload.hasOwnProperty('duration')) {
      commit('UPDATE_NOTIFICATION_DURATION', payload.duration)
    }
    commit('SHOW_NOTIFICATION', true)
  },

  hideNotification ({commit}, payload) {
    commit('SHOW_NOTIFICATION', false)
    commit('UPDATE_NOTIFICATION_MESSAGE', '')
    commit('UPDATE_NOTIFICATION_CLASS', 'is-primary')
    commit('UPDATE_NOTIFICATION_DURATION', 5000)
  },

  updateDefaultTitleFormat ({commit}, payload) {
    commit('UPDATE_DEFAULT_TITLE_FORMAT', payload)
  }
}

export default {
  actions,
  state,
  mutations
}
