import { Chance } from 'chance';
import {
  characterFirstNames,
  characterLastNames,
  campaignAdjectives,
  campaignModifiers,
  campaignNouns,
  itemAdjectives,
  itemNames,
} from './randomData';
import { downtimeTypes } from '@server/entities/downtimes';
import { transactionTypes } from '@server/entities/transactions';
import config from '@server/config';

export const random = config.isCi ? Chance(1) : Chance();

export const generateCharacterName = () => {
  const firstName = random.pickone(characterFirstNames);
  const lastName = random.pickone(characterLastNames);

  return `${firstName} ${lastName}`;
};

export const generateCampaignName = () => {
  const adjective = random.pickone(campaignAdjectives);
  const noun = random.pickone(campaignNouns);
  const modifier = random.pickone(campaignModifiers);

  return `${adjective} ${noun} ${modifier}`;
};

export const generateItemName = () => {
  const adjective = random.pickone(itemAdjectives);
  const item = random.pickone(itemNames);

  return `${adjective} ${item}`;
};

export const generateDowntimeType = () => random.pickone([...downtimeTypes]);

export const generateTransactionType = () =>
  random.pickone([...transactionTypes]);
