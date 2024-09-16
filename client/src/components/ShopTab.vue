<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, minLength, maxLength, minValue, helpers } from '@vuelidate/validators';
import useCampaignStore from '@/stores/campaign';
import useCharacterStore from '@/stores/character';
import useItemStore from '@/stores/item';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';
import type { ItemWithQuantityPublic } from '@server/entities/items';

const campaignStore = useCampaignStore();
const characterStore = useCharacterStore();
const itemStore = useItemStore();
const toast = useToast();

const shopItems = ref<(ItemWithQuantityPublic & { convertedValue: string })[]>([]);
const inputData = ref<{
  itemData: { name: string; description: string; value: number; isCurrency: boolean };
  campaignId?: number;
}>({
  itemData: {
    name: '',
    description: '',
    value: 1,
    isCurrency: false,
  },
});
const isUniqueItem = ref(false);
const currencies = ref(['cp', 'sp', 'gp', 'pp']);
const selectedCurrency = ref('cp');
const loadingBuyId = ref<number | null>(null);
const isDialogLoading = ref(false);
const isDialogVisible = ref(false);

const rules = computed(() => {
  return {
    itemData: {
      name: {
        required: helpers.withMessage(() => 'Item name is required', required),
        maxLength: helpers.withMessage(
          () => 'Item name must be at most 30 characters long',
          maxLength(30)
        ),
      },
      description: {
        required: helpers.withMessage(() => 'Item description is required', required),
        minLength: helpers.withMessage(
          () => 'Item description must be at least 3 characters long',
          minLength(3)
        ),
        maxLength: helpers.withMessage(
          () => 'Item description must be at most 5000 characters long',
          maxLength(5000)
        ),
      },
      value: {
        required: helpers.withMessage(() => 'Item value is required', required),
        minValue: helpers.withMessage(() => 'Item must have a minimum value of 1', minValue(1)),
      },
    },
  };
});

const v$ = useVuelidate(rules, inputData);

watch(
  () => itemStore.items,
  (newItems) => {
    const itemsArray = Object.values(newItems);

    shopItems.value = itemsArray
      .filter((item) => !item.isCurrency)
      .map((item) => {
        return { ...item, quantity: 1 };
      });
  },
  { immediate: true, deep: true }
);

watch(isUniqueItem, (newValue) => {
  if (newValue) {
    inputData.value.campaignId = campaignStore.selectedCampaign!.id;
  } else {
    delete inputData.value.campaignId;
  }
});

const openDialog = () => {
  isDialogVisible.value = true;
};

const closeDialog = () => {
  isDialogVisible.value = false;
  v$.value.$reset();
  (inputData.value.itemData.name = ''),
    (inputData.value.itemData.description = ''),
    (inputData.value.itemData.value = 1);
  selectedCurrency.value = 'cp';
};

const buyItem = async (item: { id: number; quantity: number }) => {
  loadingBuyId.value = item.id;
  try {
    await characterStore.createTransaction({
      type: 'Buy',
      itemId: item.id,
      characterId: characterStore.selectedCharacter!.id,
      quantity: item.quantity,
    });

    const characterId = characterStore.selectedCharacter!.id;
    const inventory = characterStore.inventoriesMap[characterId] || [];
    const itemInInventory = inventory.find((invItem) => invItem.id === item.id);

    if (itemInInventory) {
      itemInInventory.quantity += item.quantity;
    } else {
      inventory.push({
        ...itemStore.items[item.id],
        quantity: item.quantity,
      });
    }

    characterStore.inventoriesMap[characterId] = inventory;

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${itemStore.items[item.id].name} (${item.quantity}) has been bought`,
      life: 3000,
    });

    item.quantity = 1;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `${errorMessage}`,
      life: 5000,
    });
  } finally {
    loadingBuyId.value = null;
  }
};

const createItem = async () => {
  const valid = await v$.value.$validate();
  if (valid) {
    isDialogLoading.value = true;
    try {
      switch (selectedCurrency.value) {
        case 'sp':
          inputData.value.itemData.value *= 10;
          break;
        case 'gp':
          inputData.value.itemData.value *= 100;
          break;
        case 'pp':
          inputData.value.itemData.value *= 1000;
          break;
        default:
          break;
      }
      await itemStore.createItem(inputData.value);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Item (${inputData.value.itemData.name}) has been created`,
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
  <DataTable :value="shopItems" sortField="name" :sortOrder="1" size="small">
    <Column field="name" header="Name" class="min-w-16 max-w-20 sm:max-w-32"></Column>
    <Column field="convertedValue" header="Value"></Column>
    <Column field="quantity" header="Quantity"
      ><template #body="slotProps">
        <InputNumber
          v-model="slotProps.data.quantity"
          showButtons
          buttonLayout="horizontal"
          class="w-fit"
          :min="1"
          :max="999"
          :inputClass="'text-center px-0 w-8'"
          :inputId="'quantity-' + slotProps.data.id"
          :pt="{
            incrementButton: {
              class: 'w-6',
            },
            decrementButton: {
              class: 'w-6',
            },
          }"
          fluid
        >
          <template #incrementbutton></template>
          <template #incrementbuttonicon>
            <span class="pi pi-plus" />
          </template>
          <template #decrementbuttonicon>
            <span class="pi pi-minus" />
          </template> </InputNumber></template
    ></Column>
    <Column v-if="characterStore.selectedCharacter"
      ><template #body="slotProps">
        <Button
          icon="pi pi-cart-plus"
          aria-label="Buy"
          title="Buy"
          rounded
          outlined
          @click="buyItem(slotProps.data)"
          :loading="!!(loadingBuyId && loadingBuyId === slotProps.data.id)" /></template
    ></Column>
  </DataTable>

  <Dialog
    header="New Item"
    v-model:visible="isDialogVisible"
    :closable="false"
    :modal="true"
    :style="{ width: '30vw' }"
    :breakpoints="{ '1280px': '60vw', '640px': '90vw' }"
  >
    <form @submit.prevent="createItem">
      <div class="mb-8 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <label for="name" class="font-bold">Name</label>
          <InputText
            type="text"
            id="name"
            class="w-1/2"
            :class="{ 'border-red-500': v$.itemData.name.$error }"
            autocomplete="off"
            v-model="inputData.itemData.name"
          />
        </div>
        <span class="block text-center text-red-500" v-if="v$.itemData.name.$error">
          {{ v$.itemData.name.$errors[0].$message }}
        </span>
        <div class="flex items-center justify-between">
          <label for="item-value" class="font-bold">Value</label>
          <div class="flex w-1/2 items-center justify-center gap-2">
            <InputGroup>
              <InputNumber
                v-model="inputData.itemData.value"
                :min="1"
                inputId="item-value"
                class="w-1/2 text-center"
                :class="{ 'border-red-500': v$.itemData.value.$error }"
                :inputClass="'text-center px-0'"
              />
              <Select
                v-model="selectedCurrency"
                :options="currencies"
                class="w-1/2"
                aria-label="Currencies"
              />
            </InputGroup>
          </div>
        </div>
        <span class="block text-center text-red-500" v-if="v$.itemData.value.$error">
          {{ v$.itemData.value.$errors[0].$message }}
        </span>
        <div class="flex items-center justify-between">
          <span class="font-bold">Campaign unique</span>
          <div class="flex w-1/2 justify-center">
            <Checkbox
              name="isCampaignUnique"
              aria-label="Create for another user"
              v-model="isUniqueItem"
              binary
            />
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <label for="item-description" class="font-bold">Description</label>
          <Textarea
            v-model="inputData.itemData.description"
            rows="5"
            cols="30"
            id="item-description"
            class="resize-none"
            :class="{ 'border-red-500': v$.itemData.description.$error }"
            name="description"
          />
        </div>
        <span class="block text-center text-red-500" v-if="v$.itemData.description.$error">
          {{ v$.itemData.description.$errors[0].$message }}
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
