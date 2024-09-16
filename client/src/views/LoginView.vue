<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import useUserStore from '@/stores/user';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const userStore = useUserStore();
const toast = useToast();
const router = useRouter();

const isLoading = ref(false);
const inputData = ref({
  username: '',
  password: '',
});

const rules = computed(() => {
  return {
    username: {
      required: helpers.withMessage(() => 'Username is required', required),
    },
    password: {
      required: helpers.withMessage(() => 'Password is required', required),
    },
  };
});

const v$ = useVuelidate(rules, inputData);

const login = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isLoading.value = true;
    try {
      await userStore.login(inputData.value);
      router.push('/');
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "You're logged in",
        life: 3000,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `${errorMessage}`,
        life: 5000,
      });
    } finally {
      isLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="container mx-auto h-full">
    <PageForm heading="Log in to your account" formLabel="Login" @submit="login">
      <template #default>
        <div>
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-user"></i>
            </InputGroupAddon>
            <FloatLabel>
              <InputText
                type="text"
                id="username"
                :class="{ 'border-red-500': v$.username.$error }"
                autocomplete="on"
                v-model="inputData.username"
              />
              <label for="username">Username</label>
            </FloatLabel>
          </InputGroup>
          <span class="block text-center text-red-500" v-if="v$.username.$error">
            {{ v$.username.$errors[0].$message }}
          </span>
        </div>
        <div>
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-lock"></i>
            </InputGroupAddon>
            <FloatLabel>
              <InputText
                type="password"
                id="password"
                :class="{ 'border-red-500': v$.password.$error }"
                v-model="inputData.password"
              />
              <label for="password">Password</label>
            </FloatLabel>
          </InputGroup>
          <span class="block text-center text-red-500" v-if="v$.password.$error">
            {{ v$.password.$errors[0].$message }}
          </span>
        </div>
        <Button type="submit" class="w-full" label="Log in" :loading="isLoading" />
      </template>

      <template #footer>
        <div class="mt-6 bg-transparent text-center">
          Not a member?
          <RouterLink
            to="/signup"
            class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </RouterLink>
        </div>
      </template>
    </PageForm>
  </div>
</template>
