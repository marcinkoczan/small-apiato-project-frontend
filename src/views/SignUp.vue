<template>
    <v-container fluid>
        <v-layout row wrap>
            <v-flex xs12 class="text-xs-center" mt-5>
                <h1>Sign In Form</h1>
            </v-flex>
            <v-flex xs12 sm6 offset-sm3 mt-3>
                <form>
                    <v-layout column>
                        <v-flex>
                            <v-text-field
                                    name="email"
                                    label="Email"
                                    id="email"
                                    type="email"
                                    v-model="email"
                                    required></v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-text-field
                                    name="password"
                                    label="Password"
                                    id="password"
                                    type="password"
                                    v-model="password"
                                    required></v-text-field>
                        </v-flex>
                        <v-flex>
                            <v-text-field
                                    name="name"
                                    label="Name"
                                    id="name"
                                    type="text"
                                    v-model="name"
                                    required></v-text-field>
                        </v-flex>
                        <v-flex class="text-xs-center" mt-5>
                            <v-btn
                                    :loading="loading"
                                    :disabled="loading"
                                    color="primary"
                                    @click="signIn">
                                <span class="mr-2">Sign In</span>  <v-icon>send</v-icon>
                            </v-btn>
                        </v-flex>
                    </v-layout>
                </form>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
    export default {
        data() {
            return {
                loading: false,
                name: '',
                email: '',
                password: '',
            }
        },
        methods: {
            signIn() {
                this.loading = true;

                const payload = new URLSearchParams();
                payload.append('name', this.name);
                payload.append('email', this.email);
                payload.append('password', this.password);

                this.$store.dispatch('userRegistration', payload)
                    .then(() => {
                        this.loading = false;
                    })
            }
        }
    }
</script>