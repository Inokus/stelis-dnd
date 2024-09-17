<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import useCharacterStore from '@/stores/character';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const characterStore = useCharacterStore();
const toast = useToast();

const isLoading = ref(false);

const selectedCharacterTransactions = computed(
  () => characterStore.transactionsMap[characterStore.selectedCharacter!.id]
);

watch(
  () => characterStore.selectedCharacter,
  async (newCharacter, oldCharacter) => {
    if (newCharacter && newCharacter.id !== oldCharacter?.id) {
      isLoading.value = true;
      try {
        if (characterStore.selectedCharacter) {
          await characterStore.fetchTransactions(characterStore.selectedCharacter.id);
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
</script>

<template>
  <Skeleton class="h-full" v-if="isLoading"></Skeleton>

  <template v-else>
    <DataTable
      :value="selectedCharacterTransactions"
      size="small"
      v-if="selectedCharacterTransactions.length > 0"
    >
      <Column field="name" header="Name"></Column>
      <Column field="type" header="Type"></Column>
      <Column field="convertedValue" header="Value"></Column>
      <Column field="quantity" header="Quantity"></Column>
      <Column field="createdAt" header="Date"></Column>
    </DataTable>
    <p class="p-4" v-else>No transactions to display.</p>
  </template>
</template>
