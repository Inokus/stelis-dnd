import { router } from '@server/trpc';
import create from './create';
import getAvailable from './getAvailable';
import getInventory from './getInventory';

export default router({
  create,
  getAvailable,
  getInventory,
});
