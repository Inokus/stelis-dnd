<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email, minLength, maxLength, sameAs, helpers } from '@vuelidate/validators';
import useUserStore from '@/stores/user';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const userStore = useUserStore();
const toast = useToast();
const router = useRouter();

const inputData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});
const isLoading = ref(false);

const rules = computed(() => {
  return {
    username: {
      required: helpers.withMessage(() => 'Username is required', required),
      minLength: helpers.withMessage(
        () => 'Username must be at least 3 characters long',
        minLength(3)
      ),
      maxLength: helpers.withMessage(
        () => 'Username name must be at most 30 characters long',
        maxLength(30)
      ),
      validFormat: helpers.withMessage(
        () => 'Username can only contain letters, numbers, underscores, and periods',
        helpers.regex(/^[a-zA-Z0-9_.]+$/)
      ),
    },
    email: { required: helpers.withMessage(() => 'Email is required', required), email },
    password: {
      required: helpers.withMessage(() => 'Password is required', required),
      minLength: helpers.withMessage(
        () => 'Password must be at least 8 characters long',
        minLength(8)
      ),
      maxLength: helpers.withMessage(
        () => 'Password must be at most 64 characters long',
        maxLength(64)
      ),
    },
    confirmPassword: {
      required: helpers.withMessage(() => 'Confirm password is required', required),
      sameAs: helpers.withMessage(() => 'Passwords do not match', sameAs(inputData.value.password)),
    },
  };
});

const v$ = useVuelidate(rules, inputData);

const signup = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isLoading.value = true;
    try {
      await userStore.signup(inputData.value);
      router.push('/login');
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: "You're signed up",
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
    <PageForm heading="Sign up for an account" formLabel="Signup" @submit="signup">
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
              <i class="pi pi-envelope"></i>
            </InputGroupAddon>
            <FloatLabel>
              <InputText
                type="email"
                id="email"
                :class="{ 'border-red-500': v$.email.$error }"
                autocomplete="on"
                v-model="inputData.email"
              />
              <label for="email">Email</label>
            </FloatLabel>
          </InputGroup>
          <span class="block text-center text-red-500" v-if="v$.email.$error">
            {{ v$.email.$errors[0].$message }}
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
        <div>
          <InputGroup>
            <InputGroupAddon>
              <i class="pi pi-lock"></i>
            </InputGroupAddon>
            <FloatLabel>
              <InputText
                type="password"
                id="confirm-password"
                :class="{ 'border-red-500': v$.confirmPassword.$error }"
                v-model="inputData.confirmPassword"
              />
              <label for="confirm-password">Confirm password</label>
            </FloatLabel>
          </InputGroup>
          <span class="block text-center text-red-500" v-if="v$.confirmPassword.$error">
            {{ v$.confirmPassword.$errors[0].$message }}
          </span>
        </div>
        <Button type="submit" class="w-full" label="Sign up" :loading="isLoading" />
      </template>

      <template #footer>
        <div class="mt-6 bg-transparent text-center">
          Already a member?
          <RouterLink
            to="/login"
            class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Log in
          </RouterLink>
        </div>
      </template>
    </PageForm>
  </div>
</template>
