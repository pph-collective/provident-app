import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      user: {
        authenticated: false,
        data: null,
        admin: false
      }
    };
  },
  mutations: {
    SET_LOGGED_IN(state, value) {
      state.user.authenticated = value;
    },
    SET_USER(state, data) {
      state.user.data = data;
    },
    SET_ADMIN(state, admin) {
      state.user.admin = admin;
    }
  },
  actions: {
    fetchUser({ commit }, user) {
      commit("SET_LOGGED_IN", user !== null);
      if (user) {
        commit("SET_USER", {
          ...user
        });
      } else {
        commit("SET_USER", null);
      }
    },
    fetchAdmin({ commit }, admin) {
      commit("SET_ADMIN", admin);
    }
  }
});

export default store;
