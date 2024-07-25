import { router } from '@server/trpc';
import create from './create';
import getAvailable from './getAvailable';

export default router({
  create,
  getAvailable,
});
