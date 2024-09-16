import { defineStore } from 'pinia';
import { ref } from 'vue';
import { trpc } from '@/trpc';
import useUserStore from './user';
import useCampaignStore from './campaign';
import useItemStore from './item';
import { convertToCurrency } from '@/utils/currency';
import type {
  CharacterPublic,
  ItemWithQuantityPublic,
  TransactionPublic,
  DowntimePublic,
  downtimeTypes,
} from '@server/shared/types';

const useCharacterStore = defineStore('character', () => {
  const userStore = useUserStore();
  const campaignStore = useCampaignStore();
  const itemStore = useItemStore();

  const characters = ref<CharacterPublic[]>([]);
  const selectedCharacter = ref<CharacterPublic | null>(null);
  const inventoriesMap = ref<Record<number, ItemWithQuantityPublic[]>>({});
  const transactionsMap = ref<
    Record<
      number,
      (Omit<TransactionPublic, 'createdAt'> & { createdAt: string; convertedValue: string })[]
    >
  >({});
  const downtimesMap = ref<
    Record<number, (Omit<DowntimePublic, 'createdAt'> & { createdAt: string })[]>
  >({});

  const createCharacter = async (input: {
    characterData: { name: string; campaignId: number };
    userId?: number;
  }) => {
    const newCharacter = await trpc.characters.create.mutate(input);
    characters.value.push(newCharacter);
    characters.value.sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchCharacters = async () => {
    if (userStore.authUser && campaignStore.selectedCampaign) {
      characters.value = await trpc.characters.getAvailable.query(
        campaignStore.selectedCampaign.id
      );
    }
  };

  const fetchInventory = async () => {
    if (selectedCharacter.value && !inventoriesMap.value[selectedCharacter.value.id]) {
      const inventory = await trpc.characters.getInventory.query(selectedCharacter.value.id);

      inventoriesMap.value[selectedCharacter.value.id] = inventory.map((item) => {
        return {
          ...item,
          convertedValue: itemStore.items[item.id].convertedValue,
        };
      });
    }
  };

  const createTransaction = async (transactionData: {
    type: 'Buy' | 'Sell';
    itemId: number;
    characterId: number;
    quantity: number;
  }) => {
    const newTransaction = await trpc.characters.createTransaction.mutate(transactionData);
    transactionsMap.value[transactionData.characterId].unshift({
      ...newTransaction.transactionCreated,
      createdAt: newTransaction.transactionCreated.createdAt.toLocaleString(),
      convertedValue: convertToCurrency(newTransaction.transactionCreated.value),
    });
  };

  const fetchTransactions = async (characterId: number) => {
    if (!transactionsMap.value[characterId]) {
      const transactions = await trpc.characters.getTransactions.query(characterId);
      transactionsMap.value[characterId] = transactions.map((transaction) => ({
        ...transaction,
        createdAt: transaction.createdAt.toLocaleString(),
        convertedValue: convertToCurrency(transaction.value),
      }));
    }
  };

  const createDowntime = async (downtimeData: {
    type: (typeof downtimeTypes)[number];
    days: number;
    description: string;
  }) => {
    if (selectedCharacter.value) {
      const newDowntime = await trpc.characters.createDowntime.mutate({
        ...downtimeData,
        characterId: selectedCharacter.value.id,
      });
      downtimesMap.value[selectedCharacter.value.id].unshift({
        ...newDowntime.downtimeCreated,
        createdAt: newDowntime.downtimeCreated.createdAt.toLocaleString(),
      });
      selectedCharacter.value.downtime = newDowntime.newDowntime;
    }
  };

  const updateDowntime = async () => {
    if (selectedCharacter.value) {
      await trpc.characters.update.mutate({
        id: selectedCharacter.value.id,
        downtime: selectedCharacter.value.downtime,
      });
    }
  };

  const fetchDowntimes = async (characterId: number) => {
    if (!downtimesMap.value[characterId]) {
      const downtimes = await trpc.characters.getDowntimes.query(characterId);
      downtimesMap.value[characterId] = downtimes.map((downtime) => ({
        ...downtime,
        createdAt: downtime.createdAt.toLocaleString(),
      }));
    }
  };

  return {
    characters,
    selectedCharacter,
    inventoriesMap,
    transactionsMap,
    downtimesMap,
    fetchCharacters,
    createCharacter,
    fetchInventory,
    createTransaction,
    createDowntime,
    fetchTransactions,
    updateDowntime,
    fetchDowntimes,
  };
});

export default useCharacterStore;
