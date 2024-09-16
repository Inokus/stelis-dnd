import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { trpc } from '@/trpc';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  getUserFromToken,
  storeAccessToken,
} from '@/utils/auth';
import type { UserPublic } from '@server/shared/types';

const useUserStore = defineStore('user', () => {
  const users = ref<UserPublic[] | null>(null);
  const authToken = ref<string | null>(getStoredAccessToken(localStorage));

  const authUser = computed(() => (authToken.value ? getUserFromToken(authToken.value) : null));

  const isLoggedIn = computed(() => !!authToken.value);

  const signup = async (userSignup: { username: string; email: string; password: string }) => {
    return await trpc.users.signup.mutate(userSignup);
  };

  const login = async (userLogin: { username: string; password: string }) => {
    const { accessToken } = await trpc.users.login.mutate(userLogin);

    authToken.value = accessToken;
    storeAccessToken(localStorage, accessToken);
  };

  const logout = () => {
    clearStoredAccessToken(localStorage);
  };

  const fetchUsers = async () => {
    users.value = await trpc.users.getAll.query();
  };

  return {
    users,
    authToken,
    authUser,
    isLoggedIn,
    login,
    logout,
    signup,
    fetchUsers,
  };
});

export default useUserStore;
