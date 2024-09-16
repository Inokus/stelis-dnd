<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import useUserStore from '@/stores/user';

const userStore = useUserStore();

const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');
const isSignupPage = computed(() => route.path === '/signup');

const logoutUser = () => {
  userStore.logout();
  window.location.href = '/login';
};
</script>

<template>
  <nav
    class="container mx-auto flex p-6"
    :class="userStore.isLoggedIn ? 'justify-between' : 'justify-end'"
  >
    <Button
      type="button"
      as="router-link"
      label="Home"
      icon="pi pi-home"
      to="/"
      link
      v-if="userStore.isLoggedIn"
    />
    <div>
      <Button
        type="button"
        as="router-link"
        label="Sign up"
        icon="pi pi-user-plus"
        to="/signup"
        link
        v-if="!userStore.isLoggedIn && isLoginPage"
      />
      <Button
        type="button"
        as="router-link"
        label="Log in"
        icon="pi pi-sign-in"
        to="/login"
        link
        v-if="!userStore.isLoggedIn && isSignupPage"
      />
      <Button
        type="button"
        label="Log out"
        icon="pi pi-sign-out"
        link
        v-if="userStore.isLoggedIn"
        @click="logoutUser"
      />
    </div>
  </nav>
</template>
