<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength, minValue, maxValue, helpers } from '@vuelidate/validators';
import useCharacterStore from '@/stores/character';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const characterStore = useCharacterStore();
const toast = useToast();

const downtimeTypes = [
  'Carousing',
  'Relaxation',
  'Research',
  'Training: Fighting Style',
  'Training: Language/Tools',
  'Training: Level Up',
  'Training: Skill',
  'Wandering',
  'Wandering: Taking a New Path',
  'Working',
] as const;

const inputData = ref<{
  type: (typeof downtimeTypes)[number];
  days: number;
  description: string;
}>({
  type: downtimeTypes[0],
  days: 1,
  description: '',
});
const isLoading = ref(false);
const isDialogLoading = ref(false);
const isDialogVisible = ref(false);

const rules = computed(() => {
  return {
    type: {
      required: helpers.withMessage(() => 'Downtime type is required', required),
      validType: helpers.withMessage('Invalid downtime type', (value: string) =>
        downtimeTypes.includes(value as (typeof downtimeTypes)[number])
      ),
    },
    days: {
      required: helpers.withMessage(() => 'Downtime days are required', required),
      minValue: helpers.withMessage(
        () => 'Downtime days must have a minimum value of 1',
        minValue(1)
      ),
      maxValue: helpers.withMessage(
        () =>
          `Downtime days must have a maximum value of ${characterStore.selectedCharacter!.downtime}`,
        maxValue(characterStore.selectedCharacter!.downtime)
      ),
    },
    description: {
      required: helpers.withMessage(() => 'Downtime description is required', required),
      minLength: helpers.withMessage(
        () => 'Downtime description must be at least 3 characters long',
        minLength(3)
      ),
      maxLength: helpers.withMessage(
        () => 'Downtime description must be at most 500 characters long',
        maxLength(500)
      ),
    },
  };
});

const v$ = useVuelidate(rules, inputData);

const selectedCharacterDowntimes = computed(
  () => characterStore.downtimesMap[characterStore.selectedCharacter!.id]
);

watch(
  () => characterStore.selectedCharacter,
  async (newCharacter, oldCharacter) => {
    if (newCharacter && newCharacter.id !== oldCharacter?.id) {
      isLoading.value = true;
      try {
        if (characterStore.selectedCharacter) {
          await characterStore.fetchDowntimes(characterStore.selectedCharacter.id);
        }
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
  },
  { immediate: true }
);

const openDialog = () => {
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  v$.value.$reset();
  (inputData.value.type = downtimeTypes[0]),
    (inputData.value.days = 1),
    (inputData.value.description = '');
};

const createDowntime = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isDialogLoading.value = true;
    try {
      await characterStore.createDowntime(inputData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Downtime has been created',
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

defineExpose({
  openDialog,
});
</script>

<template>
  <Skeleton class="h-full" v-if="isLoading"></Skeleton>

  <template v-else>
    <DataTable
      :value="selectedCharacterDowntimes"
      size="small"
      v-if="selectedCharacterDowntimes.length > 0"
    >
      <Column field="type" header="Type"></Column>
      <Column field="days" header="Days"></Column>
      <Column field="createdAt" header="Date"></Column>
    </DataTable>
    <p v-else>No downtimes to display.</p>
  </template>

  <Dialog
    header="New Downtime"
    v-model:visible="isDialogVisible"
    :closable="false"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '1280px': '60vw', '640px': '90vw' }"
  >
    <form @submit.prevent="createDowntime">
      <div class="mb-8 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="font-bold">Type</span>
          <Select
            class="w-1/2"
            :class="{ 'border-red-500': v$.type.$error }"
            aria-label="Type"
            v-model="inputData.type"
            :options="[...downtimeTypes]"
          />
        </div>
        <span class="block text-center text-red-500" v-if="v$.type.$error">
          {{ v$.type.$errors[0].$message }}
        </span>
        <div class="flex items-center justify-between">
          <label for="downtime-days" class="font-bold">Days</label>
          <div class="flex w-1/2 items-center justify-center">
            <InputNumber
              v-model="inputData.days"
              :min="1"
              :max="characterStore.selectedCharacter?.downtime"
              inputId="downtime-days"
              class="w-1/2 text-center"
              :class="{ 'border-red-500': v$.days.$error }"
              :inputClass="'text-center'"
              fluid
            />
            <span class="mx-2">/</span>
            <span class="w-1/2 text-center">{{ characterStore.selectedCharacter?.downtime }}</span>
          </div>
        </div>
        <span class="block text-center text-red-500" v-if="v$.days.$error">
          {{ v$.days.$errors[0].$message }}
        </span>
        <div class="flex flex-col gap-4">
          <label for="downtime-description" class="font-bold">Description</label>
          <Textarea
            v-model="inputData.description"
            rows="5"
            cols="30"
            id="downtime-description"
            class="resize-none"
            :class="{ 'border-red-500': v$.description.$error }"
            name="description"
          />
        </div>
        <span class="block text-center text-red-500" v-if="v$.description.$error">
          {{ v$.description.$errors[0].$message }}
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
</template>
