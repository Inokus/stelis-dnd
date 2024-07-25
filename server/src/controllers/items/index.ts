import { router } from '@server/trpc';
import create from './create';
import getAvailable from './getAvailable';
import update from './update';
import remove from './remove';

export default router({
  create,
  getAvailable,
  update,
  remove,
});
