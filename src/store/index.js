import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import createPersistedState from 'vuex-persistedstate'
import tagsView from './modules/tagsView'

const PERSIST_PATHS = ['user']
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    tagsView
  },
  getters,
  // 新增规则保存vuex的值
  plugins: [createPersistedState({
    storage: window.sessionStorage,
    // 在此使用
    paths: PERSIST_PATHS
  })]
})

export default store
