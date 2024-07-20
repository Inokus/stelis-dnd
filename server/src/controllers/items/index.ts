import { router } from '@server/trpc';
import create from './create';
import getAll from './getAll';

export default router({
  create,
  getAll,
});
