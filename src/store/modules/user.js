import { login, getInfo } from '@/api/user'
import { getAccessToken, setAccessToken, removeAccessToken, getRefreshToken, setRefreshToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    name: '',
    avatar: ''
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_ACCESS_TOKEN: (state, token) => {
    state.accessToken = token
  },
  SET_REFRESH_TOKEN: (state, token) => {
    state.refreshToken = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        // todo 昨天调试到这里
        console.log(' response ===', response)
        const data = response.body
        commit('SET_ACCESS_TOKEN', data.accessToken)
        commit('SET_REFRESH_TOKEN', data.refreshToken)
        commit('SET_NAME', data.name)
        commit('SET_AVATAR', data.avatar)
        setAccessToken(data.accessToken)
        setRefreshToken(data.refreshToken)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.accessToken).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    /*    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {*/
    removeAccessToken() // must remove  token  first
    resetRouter()
    commit('RESET_STATE')
    /*     resolve()
      }).catch(error => {
        reject(error)
      })
    })*/
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeAccessToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

