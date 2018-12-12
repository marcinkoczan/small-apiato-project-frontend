import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        clientId: 4,
        clientSecret: 'OxEGvZgwkVDsUn1kkDWzaPvcsntJxTRY9QoqHZTd',
        tokenData: {
            tokenType: 'Bearer',
            expiresIn: new Date(),
            accessToken: null,
            refreshToken: null,
        },
        appName: 'Leagues Manager',
        userData: {},
    },
    mutations: {
        setAppName(state, appName) {
            state.appName = appName
        },
        authorizeUser(state, tokenData) {
            state.tokenData = {
                tokenType: tokenData.token_type,
                expiresIn: new Date(new Date().getTime() + (tokenData.expires_in * 1000)),
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
            }

            localStorage.setItem('token', state.tokenData.accessToken)
            localStorage.setItem('refreshToken', state.tokenData.refreshToken)
            localStorage.setItem('expirationDate', state.tokenData.expiresIn)
        },
        clearAuthorizationData(state) {
            state.tokenData = {
                tokenType: 'Bearer',
                expiresIn: new Date(),
                accessToken: null,
                refreshToken: '',
            }

            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('expirationDate')
        },
        setUserData(state, userData) {
            state.userData = userData
        }
    },
    actions: {
        setAppName({commit}, appName) {
            commit('setAppName', appName)
        },
        userRegistration({commit, state}, userData) {
            axios.post('http://api.leagues-manager.localhost/v1/register', userData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}
            })
                .then((response) => {
                    if (response.status == 200) {
                        router.replace('/login')
                    }
                })
                .catch(error => console.log(error))
        },
        userLogin({commit, state}, userData) {
            userData.append('client_id', state.clientId);
            userData.append('client_secret', state.clientSecret);
            userData.append('grant_type', 'password');

            axios.post('http://api.leagues-manager.localhost/v1/oauth/token', userData, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}
            })
                .then((response) => {
                    if (response.status === 200) {
                        commit('authorizeUser', response.data)
                        router.replace('/')
                    } else {
                        console.log('Sth gone wrong!');
                    }
                })
                .catch(error => console.log(error))
        },
        refreshToken({commit, state, dispatch}) {
            const payload = new URLSearchParams();
            payload.append('client_id', state.clientId);
            payload.append('client_secret', state.clientSecret);
            payload.append('grant_type', 'refresh_token');
            payload.append('refresh_token', localStorage.getItem('refreshToken'));

            axios.post('http://api.leagues-manager.localhost/v1/oauth/token', payload, {
                headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}
            })
                .then((response) => {
                    console.log(response);
                    if (response.status === 200) {
                        console.log('1');
                        commit('authorizeUser', response.data)
                    } else {
                        console.log('2');
                        dispatch('logout')
                    }
                })
                .catch(error => {
                    console.log('3');
                    console.log(error)
                    dispatch('logout')
                })
        },
        autoLogin({commit, dispatch}) {
            const token = localStorage.getItem('token')
            if (!token) {
                return
            }
            const expirationDate = localStorage.getItem('expirationDate')
            const now = new Date()

            if (now >= new Date(expirationDate)) {
                console.log('if')
                dispatch('refreshToken')
                return
            } else {
                console.log('else')

            }
            const refreshToken = localStorage.getItem('refreshToken')

            commit('authorizeUser', {
                'token_type': 'Bearer',
                'expires_in': 60,
                'access_token': token,
                'refresh_token': refreshToken,
            })
        },
        logout({commit, state}) {
            commit('clearAuthorizationData')

            if (state.tokenData.accessToken) {
                const payload = new URLSearchParams();
                payload.append('token', state.tokenData.accessToken);

                axios.post('http://api.leagues-manager.localhost/v1/oauth/token', payload, {
                    headers: {'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json'}
                })
                    .then(() => {
                        router.replace('/login')
                    })
                    .catch(error => console.log(error))
            }
        },
        getUserData({commit, state}) {
            return new Promise((resolve, reject) => {
                axios.get('http://api.leagues-manager.localhost/v1/user/profile/', {
                    headers: {Accept: 'application/json', 'Authorization': 'Bearer ' + state.tokenData.accessToken}
                })
                    .then(response => {
                        commit('setUserData', response.data)
                        resolve(response);
                    })
                    .catch(error => {
                        console.log(error)
                        reject(error);
                    })
            })

        },
        updateUserData({commit, state}, newUserData) {
            return new Promise((resolve, reject) => {

                const payload = new URLSearchParams();
                payload.append('name', newUserData.name);

                axios.put('http://api.leagues-manager.localhost/v1/users/' + newUserData.id, {name: newUserData.name}, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + state.tokenData.accessToken,
                    }
                })
                    .then(response => {
                        commit('setUserData', response.data)
                        resolve(response);
                    })
                    .catch(error => {
                        console.log(error)
                        reject(error);
                    })
            })
        }
    },
    getters: {
        appName: state => {
            return state.appName
        },
        isLogged: state => {
            return state.tokenData.accessToken != null
        },
        userData: state => {
            return state.userData
        }
    }
})
