import useCampaignStore from '@/stores/campaign';
import useUserStore from '@/stores/user';

export const authenticate = () => {
  const userStore = useUserStore();
  return userStore.isLoggedIn;
};

export const validateSlug = async (slug: string) => {
  const campaignStore = useCampaignStore();

  if (campaignStore.campaigns.length === 0) {
    await campaignStore.fetchCampaigns();
  }

  return campaignStore.campaigns.some((campaign) => campaign.slug === slug);
};
