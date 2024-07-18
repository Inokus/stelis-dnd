import { router } from '@server/trpc';
import signup from './signup';
import login from './login';

export default router({
  signup,
  login,
});
