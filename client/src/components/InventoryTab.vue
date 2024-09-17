<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minValue, maxValue, helpers } from '@vuelidate/validators';
import useCharacterStore from '@/stores/character';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';
import type { ItemWithQuantityPublic } from '@server/entities/items';

const characterStore = useCharacterStore();
const toast = useToast();

const selectedItem = ref<(ItemWithQuantityPublic & { convertedValue: string }) | null>(null);
const inputData = ref<{
  type: 'Buy' | 'Sell';
  itemId: number | null;
  characterId: number;
  quantity: number;
}>({
  type: 'Sell',
  itemId: null,
  characterId: characterStore.selectedCharacter!.id,
  quantity: 1,
});
const isLoading = ref(false);
const isDialogLoading = ref(false);
const isDialogVisible = ref(false);

const rules = computed(() => {
  return {
    quantity: {
      required: helpers.withMessage(() => 'Item quantity is required', required),
      minValue: helpers.withMessage(
        () => 'Item quantity must have a minimum value of 1',
        minValue(1)
      ),
      maxValue: selectedItem.value
        ? helpers.withMessage(
            () => `Item quantity must have a maximum value of ${selectedItem.value!.quantity}`,
            maxValue(selectedItem.value.quantity)
          )
        : helpers.withMessage(() => 'Item quantity must have a maximum value of 1', maxValue(1)),
    },
  };
});

const v$ = useVuelidate(rules, inputData);

const selectedCharacterInventory = computed(
  () => characterStore.inventoriesMap[characterStore.selectedCharacter!.id]
);

watch(
  () => characterStore.selectedCharacter,
  async (newCharacter, oldCharacter) => {
    if (newCharacter && newCharacter.id !== oldCharacter?.id) {
      isLoading.value = true;
      try {
        if (characterStore.selectedCharacter) {
          await characterStore.fetchInventory();
          inputData.value.characterId = characterStore.selectedCharacter.id;
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

const openDialog = (item: ItemWithQuantityPublic & { convertedValue: string }) => {
  selectedItem.value = item;
  inputData.value.itemId = item.id;
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  v$.value.$reset();
  selectedItem.value = null;
  (inputData.value.itemId = null), (inputData.value.quantity = 1);
};

const sellItem = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isDialogLoading.value = true;
    try {
      await characterStore.createTransaction({
        ...inputData.value,
        itemId: inputData.value.itemId as number,
      });

      const itemInInventory = selectedCharacterInventory.value.find(
        (invItem) => invItem.id === selectedItem.value!.id
      );

      if (itemInInventory) {
        itemInInventory.quantity -= inputData.value.quantity;
        if (itemInInventory.quantity <= 0) {
          const index = selectedCharacterInventory.value.indexOf(itemInInventory);
          selectedCharacterInventory.value.splice(index, 1);
        }
      }

      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `${itemInInventory!.name} (${inputData.value.quantity}) has been sold`,
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
  <Skeleton class="h-full" v-if="isLoading"></Skeleton>

  <template v-else>
    <DataTable
      :value="selectedCharacterInventory"
      sortField="name"
      :sortOrder="1"
      size="small"
      v-if="selectedCharacterInventory.length > 0"
    >
      <Column field="name" header="Name"></Column>
      <Column field="convertedValue" header="Value"></Column>
      <Column field="quantity" header="Quantity"></Column>
      <Column
        ><template #body="slotProps">
          <Button
            icon="pi pi-cart-minus"
            aria-label="Sell"
            title="Sell"
            rounded
            outlined
            @click="openDialog(slotProps.data)" /></template
      ></Column>
    </DataTable>
    <p class="p-4" v-else>Inventory is currently empty.</p>
  </template>

  <Dialog
    header="Sell Item"
    v-model:visible="isDialogVisible"
    :closable="false"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '1280px': '60vw', '640px': '90vw' }"
  >
    <form @submit.prevent="sellItem">
      <div class="mb-8 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <span class="font-bold">Name</span>
          <span>{{ selectedItem?.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="font-bold">Value</span>
          <span>{{ selectedItem?.convertedValue }}</span>
        </div>
        <div class="flex items-center justify-between">
          <label for="sell-quantity" class="font-bold">Quantity</label>
          <div class="flex items-center">
            <InputNumber
              v-model="inputData.quantity"
              :min="1"
              :max="selectedItem?.quantity"
              class="w-12 text-center"
              :class="{ 'border-red-500': v$.quantity.$error }"
              inputId="sell-quantity"
              :inputClass="'text-center'"
              fluid
            />
            <span class="mx-2">/</span>
            <span>{{ selectedItem?.quantity }}</span>
          </div>
        </div>
        <span class="block text-center text-red-500" v-if="v$.quantity.$error">
          {{ v$.quantity.$errors[0].$message }}
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
