import { router } from '@server/trpc';
import signup from './signup';
import makeAdmin from './makeAdmin';
import login from './login';
import getAll from './getAll';

export default router({
  signup,
  makeAdmin,
  login,
  getAll,
});
