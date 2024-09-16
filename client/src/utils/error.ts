import { TRPCClientError } from '@trpc/client';

export function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred';
  }

  if (!(error instanceof TRPCClientError)) {
    return error.message;
  }

  return error.data.message || error.message;
}
