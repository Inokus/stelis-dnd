import { defineStore } from 'pinia';
import { ref } from 'vue';
import { trpc } from '@/trpc';
import useUserStore from './user';
import useCampaignStore from './campaign';
import { convertToCurrency } from '@/utils/currency';
import type { ItemPublic } from '@server/shared/types';

const useItemStore = defineStore('item', () => {
  const userStore = useUserStore();
  const campaignStore = useCampaignStore();

  const items = ref<Record<number, ItemPublic & { convertedValue: string }>>({});

  const createItem = async (input: {
    itemData: { name: string; description: string; value: number; isCurrency: boolean };
    campaignId?: number;
  }) => {
    const newItem = await trpc.items.create.mutate(input);
    items.value[newItem.id] = {
      ...newItem,
      convertedValue: convertToCurrency(newItem.value),
    };
  };

  const fetchItems = async () => {
    if (userStore.authUser && campaignStore.selectedCampaign) {
      const fetchedItems = await trpc.items.getAvailable.query(campaignStore.selectedCampaign.id);
      const itemMap: Record<number, ItemPublic & { convertedValue: string }> = {};

      fetchedItems.forEach((item) => {
        itemMap[item.id] = {
          ...item,
          convertedValue: convertToCurrency(item.value),
        };
      });

      items.value = itemMap;
    }
  };

  return {
    items,
    createItem,
    fetchItems,
  };
});

export default useItemStore;
