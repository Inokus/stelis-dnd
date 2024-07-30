import { router } from '@server/trpc';
import create from './create';
import getAvailable from './getAvailable';
import update from './update';
import getInventory from './getInventory';
import getDowntimes from './getDowntimes';
import createDowntime from './createDowntime';
import createTransaction from './createTransaction';
import getTransactions from './getTransactions';

export default router({
  create,
  getAvailable,
  update,
  getInventory,
  getDowntimes,
  getTransactions,
  createDowntime,
  createTransaction,
});
