import { router } from '@server/trpc';
import create from './create';
import getAll from './getAll';
import getAvailable from './getAvailable';

export default router({
  create,
  getAll,
  getAvailable,
});
