<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useWindowSize } from '@vueuse/core';
import useUserStore from '@/stores/user';
import useCampaignStore from '@/stores/campaign';
import useCharacterStore from '@/stores/character';
import useItemStore from '@/stores/item';
import DowntimesTab from '@/components/DowntimesTab.vue';
import ShopTab from '@/components/ShopTab.vue';
import { useToast } from 'primevue/usetoast';
import { getErrorMessage } from '@/utils/error';

const props = defineProps({
  slug: String,
});

const userStore = useUserStore();
const campaignStore = useCampaignStore();
const characterStore = useCharacterStore();
const itemStore = useItemStore();
const toast = useToast();

const isLoading = ref(true);
const selectedTab = ref('0');
const downtimesTabRef = ref<InstanceType<typeof DowntimesTab> | null>(null);
const shopTabRef = ref<InstanceType<typeof ShopTab> | null>(null);

const { width } = useWindowSize();

watch(width, (newWidth) => {
  if (newWidth >= 1280 && selectedTab.value === '3') {
    selectedTab.value = '0';
  }
});

onMounted(async () => {
  campaignStore.selectedCampaign =
    campaignStore.campaigns.find((campaign) => campaign.slug === props.slug) || null;

  try {
    await itemStore.fetchItems();
    await characterStore.fetchCharacters();
    characterStore.selectedCharacter = null;

    if (userStore.authUser?.isAdmin) {
      await userStore.fetchUsers();
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
});
</script>

<template>
  <div
    class="grid-template container mx-auto grid h-full grid-cols-3 grid-rows-2 gap-6 py-6 sm:px-6"
  >
    <div class="col-span-3 w-full p-4">
      <Skeleton class="h-12 w-72" v-if="isLoading" />
      <CharacterInfo v-else />
    </div>
    <div class="col-span-3 row-span-1 overflow-hidden xl:col-span-2">
      <Tabs v-model:value="selectedTab" class="h-full" scrollable>
        <TabList class="flex-none">
          <Tab value="0">Inventory</Tab>
          <Tab value="1" class="flex gap-2"
            >Downtimes<Button
              icon="pi pi-plus"
              aria-label="Add new downtime"
              class="h-6 w-6 p-0"
              @click="downtimesTabRef?.openDialog"
              v-if="characterStore.selectedCharacter"
          /></Tab>
          <Tab value="2">Transactions</Tab>
          <Tab value="3" class="flex gap-2" v-if="width < 1280"
            >Shop<Button
              icon="pi pi-plus"
              aria-label="Add new item"
              class="h-6 w-6 p-0"
              @click="shopTabRef?.openDialog"
              v-if="userStore.authUser?.isAdmin"
          /></Tab>
        </TabList>
        <TabPanels class="flex-1 overflow-auto">
          <TabPanel value="0" class="h-full">
            <InventoryTab v-if="characterStore.selectedCharacter" />
            <p v-else>No character selected.</p>
          </TabPanel>
          <TabPanel value="1" class="h-full">
            <DowntimesTab ref="downtimesTabRef" v-if="characterStore.selectedCharacter" />
            <p v-else>No character selected.</p>
          </TabPanel>
          <TabPanel value="2" class="h-full">
            <TransactionsTab v-if="characterStore.selectedCharacter" />

            <p v-else>No character selected.</p>
          </TabPanel>
          <TabPanel value="3" class="h-full" v-if="width < 1280">
            <Skeleton class="h-full" v-if="isLoading"></Skeleton>
            <ShopTab ref="shopTabRef" v-else />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
    <div class="col-span-1 row-span-1 flex h-full flex-col overflow-hidden" v-if="width >= 1280">
      <div class="p-tablist-tab-list flex items-center justify-between font-bold">
        <span class="px-4 py-4 font-bold">Shop</span>
        <Button
          label="Add new item"
          icon="pi pi-plus"
          @click="shopTabRef?.openDialog"
          v-if="userStore.authUser?.isAdmin"
        />
      </div>
      <Skeleton class="h-full" v-if="isLoading"></Skeleton>
      <div class="overflow-auto p-3.5" v-else>
        <ShopTab ref="shopTabRef" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid-template {
  grid-template-rows: 1fr 10fr !important;
}
</style>
