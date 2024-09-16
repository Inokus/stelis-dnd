<script setup>
import { ref, computed, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, maxLength, helpers } from '@vuelidate/validators';
import useUserStore from '@/stores/user';
import useCampaignStore from '@/stores/campaign';
import useCharacterStore from '@/stores/character';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const userStore = useUserStore();
const campaignStore = useCampaignStore();
const characterStore = useCharacterStore();
const toast = useToast();

const selectedCharacter = ref(null);
const showUserSelect = ref(false);
const selectedUser = ref(null);
const inputData = ref({
  characterData: {
    name: '',
    campaignId: campaignStore.selectedCampaign.id,
  },
});
const isDialogLoading = ref(false);
const isDialogVisible = ref(false);

const rules = computed(() => {
  return {
    characterData: {
      name: {
        required: helpers.withMessage(() => 'Character name is required', required),
        maxLength: helpers.withMessage(
          () => 'Character name must be at most 30 characters long',
          maxLength(30)
        ),
      },
    },
  };
});

const v$ = useVuelidate(rules, inputData);

const characterSelectList = computed(() => {
  return [{ id: -1, name: 'New character' }, ...characterStore.characters];
});

const otherUsers = computed(() => {
  return userStore.users
    .filter((user) => user.id !== userStore.authUser.id)
    .sort((a, b) => a.name.localeCompare(b.name));
});

watch(selectedCharacter, (newValue, oldValue) => {
  if (newValue && newValue.id === -1) {
    openDialog();
    selectedCharacter.value = oldValue;
  } else {
    characterStore.selectedCharacter = newValue;
  }
});

watch(selectedUser, (newValue) => {
  if (newValue) {
    inputData.value.userId = newValue.id;
  } else {
    delete inputData.value.userId;
  }
});

watch(showUserSelect, (newValue) => {
  if (!newValue && inputData.value.userId) {
    selectedUser.value = null;
    delete inputData.value.userId;
  }
});

const openDialog = () => {
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  v$.value.$reset();
  inputData.value.characterData.name = '';
};

const createCharacter = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isDialogLoading.value = true;
    try {
      await characterStore.createCharacter(inputData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Character has been created',
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
  <Select
    v-model="selectedCharacter"
    :options="characterSelectList"
    optionLabel="name"
    placeholder="Select a character"
    class="max-w-screen-sm border-transparent text-2xl font-semibold"
  >
    <template #option="slotProps">
      <div class="flex items-center gap-2">
        <div>{{ slotProps.option.name }}</div>
        <i class="pi pi-user-plus" v-if="slotProps.option.id === -1"></i>
      </div>
    </template>
  </Select>

  <div class="mt-6 flex justify-center" v-if="characterStore.selectedCharacter">
    <div class="flex flex-col items-center justify-center">
      <label for="available-downtime">Available downtime</label>
      <InputNumber
        v-model="characterStore.selectedCharacter.downtime"
        inputId="available-downtime"
        class="w-fit"
        :inputClass="'w-16 text-center font-bold'"
        :min="0"
        :allowEmpty="false"
        @update:modelValue="characterStore.updateDowntime"
      />
    </div>
  </div>

  <Dialog
    header="New Character"
    v-model:visible="isDialogVisible"
    :closable="false"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '1280px': '60vw', '640px': '90vw' }"
  >
    <form @submit.prevent="createCharacter">
      <div class="mb-8 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label for="name" class="font-bold">Name</label>
          <InputText
            type="text"
            id="name"
            class="w-1/2"
            :class="{ 'border-red-500': v$.characterData.name.$error }"
            autocomplete="off"
            v-model="inputData.characterData.name"
          />
        </div>
        <span class="block text-center text-red-500" v-if="v$.characterData.name.$error">
          {{ v$.characterData.name.$errors[0].$message }}
        </span>
        <div class="flex justify-between" v-if="userStore.authUser.isAdmin">
          <div class="flex w-1/2 items-center gap-2 pr-2">
            <span class="font-bold">Create for another user</span>
            <Checkbox
              name="forOtherUser"
              aria-label="Create for another user"
              v-model="showUserSelect"
              binary
            />
          </div>

          <Select
            v-model="selectedUser"
            :options="otherUsers"
            optionLabel="username"
            placeholder="Select user"
            aria-label="User"
            class="w-1/2"
            v-if="showUserSelect"
          />
        </div>
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
</template>
