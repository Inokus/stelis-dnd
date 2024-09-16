import { defineStore } from 'pinia';
import { ref } from 'vue';
import { trpc } from '@/trpc';
import { createSlug } from '@/utils/slug';
import type { CampaignPublic } from '@server/shared/types';

const useCampaignStore = defineStore('campaign', () => {
  const campaigns = ref<(CampaignPublic & { slug: string })[]>([]);
  const selectedCampaign = ref<(CampaignPublic & { slug: string }) | null>(null);

  const createCampaign = async (input: { name: string }) => {
    const newCampaign = await trpc.campaigns.create.mutate(input);
    campaigns.value.push({ ...newCampaign, slug: createSlug(newCampaign.name) });
    campaigns.value.sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchCampaigns = async () => {
    const campaignData = await trpc.campaigns.getAvailable.query();
    campaigns.value = campaignData.map((campaign) => ({
      ...campaign,
      slug: createSlug(campaign.name),
    }));
  };

  return {
    campaigns,
    selectedCampaign,
    createCampaign,
    fetchCampaigns,
  };
});

export default useCampaignStore;
