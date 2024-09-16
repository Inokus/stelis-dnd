<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength, helpers } from '@vuelidate/validators';
import useUserStore from '@/stores/user';
import useCampaignStore from '@/stores/campaign';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const userStore = useUserStore();
const campaignStore = useCampaignStore();
const toast = useToast();

const inputData = ref({
  name: '',
});
const isLoading = ref(true);
const isDialogLoading = ref(false);
const isDialogVisible = ref(false);

const rules = computed(() => {
  return {
    name: {
      required: helpers.withMessage(() => 'Campaign name is required', required),
      minLength: helpers.withMessage(
        () => 'Campaign name must be at least 3 characters long',
        minLength(3)
      ),
      maxLength: helpers.withMessage(
        () => 'Campaign name must be at most 30 characters long',
        maxLength(30)
      ),
      validFormat: helpers.withMessage(
        () => 'Campaign name can only contain letters, numbers, and spaces',
        helpers.regex(/^[a-zA-Z0-9\s]+$/)
      ),
      noLeadingTrailingSpaces: helpers.withMessage(
        () => 'Campaign name cannot start or end with a space',
        (value: string) => value.trim() === value
      ),
    },
  };
});

const v$ = useVuelidate(rules, inputData);

onMounted(async () => {
  if (campaignStore.campaigns.length === 0) {
    try {
      await campaignStore.fetchCampaigns();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `${errorMessage}`,
        life: 5000,
      });
    }
  }
  isLoading.value = false;
});

const openDialog = () => {
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  v$.value.$reset();
  inputData.value.name = '';
};

const createCampaign = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isDialogLoading.value = true;
    try {
      await campaignStore.createCampaign(inputData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Campaign has been created',
        life: 3000,
      });
      closeDialog();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: `${errorMessage}`,
        life: 5000,
      });
    } finally {
      isDialogLoading.value = false;
    }
  }
};
</script>

<template>
  <div
    class="container mx-auto flex h-full flex-row flex-wrap items-center justify-center gap-6 overflow-auto p-6"
  >
    <template v-if="isLoading">
      <Skeleton class="h-56 w-64"></Skeleton>
      <Skeleton class="h-56 w-64"></Skeleton>
      <Skeleton class="h-56 w-64"></Skeleton>
    </template>

    <template v-else-if="campaignStore.campaigns.length > 0 || userStore.authUser?.isAdmin">
      <router-link
        v-for="(campaign, index) in campaignStore.campaigns"
        :key="index"
        :to="`/${campaign.slug}`"
      >
        <Card
          class="h-56 w-64 overflow-hidden rounded-lg shadow-md transition-all hover:scale-105 hover:shadow-lg"
          :data-testid="`campaign-card-${campaign.slug}`"
        >
          <template #header>
            <div class="h-32 w-full bg-gray-500 object-cover"></div>
          </template>
          <template #content>
            <p class="m-0 p-4 text-center font-semibold">
              {{ campaign.name }}
            </p>
          </template>
        </Card>
      </router-link>
      <Card
        class="flex h-56 w-64 cursor-pointer items-center justify-center overflow-hidden rounded-lg shadow-md transition-all hover:scale-105 hover:shadow-lg"
        tabindex="0"
        role="button"
        data-testid="add-new-campaign-card"
        v-if="userStore.authUser?.isAdmin"
        @click="openDialog"
        @keydown.enter="openDialog"
        @keydown.space.prevent="openDialog"
      >
        <template #content>
          <div class="flex flex-col items-center justify-center">
            <p class="m-0 text-center font-semibold">Add New Campaign</p>
            <i class="pi pi-plus mt-2 text-2xl"></i>
          </div>
        </template>
      </Card>
    </template>

    <template v-else> There's currently no campaigns to display. </template>

    <Dialog
      header="New Campaign"
      v-model:visible="isDialogVisible"
      :closable="false"
      :modal="true"
      :style="{ width: '30vw' }"
      :breakpoints="{ '1280px': '60vw', '640px': '90vw' }"
    >
      <form @submit.prevent="createCampaign">
        <div class="mb-8 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <label for="name" class="font-bold">Name</label>
            <InputText
              type="text"
              id="name"
              class="w-1/2"
              :class="{ 'border-red-500': v$.name.$error }"
              autocomplete="off"
              v-model="inputData.name"
            />
          </div>
          <span class="block text-center text-red-500" v-if="v$.name.$error">
            {{ v$.name.$errors[0].$message }}
          </span>
        </div>
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="closeDialog"
          />
          <Button
            type="submit"
            label="Confirm"
            icon="pi pi-check"
            class="p-button-danger"
            :loading="isDialogLoading"
          />
        </div>
      </form>
    </Dialog>
  </div>
</template>
