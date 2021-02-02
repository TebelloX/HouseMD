import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
/*
import Buefy from 'buefy'
import 'buefy/dist/buefy.css'
*/
// import "prismjs/prism"
// import "prismjs/themes/prism-twilight.css"

Vue.config.productionTip = false
Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    markdown: ''
  },
  mutations: {
    initStore (state) {
      if (localStorage.getItem('md')) {
        state.markdown = localStorage.getItem('md');
      }
    },
    updateMarkdown(state, md) {
      state.markdown = md;
    },
    saveMarkdown(state, md) {
      localStorage.setItem('md', md);
    }
  }
})

new Vue({
  render: h => h(App),
  store,
  beforeCreate() {store.commit('initStore')}
}).$mount('#app')
