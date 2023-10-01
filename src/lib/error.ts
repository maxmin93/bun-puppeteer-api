import { ErrorHandler } from 'elysia';

// https://github.com/stooezy/api-w-elysiajs/blob/main/src/lib/error.ts
export const handleError: ErrorHandler = ({ code, error, request, set }) => {
  // set.status = 400;
  set.headers['Content-Type'] = 'application/json';

  let message = 'Something went wrong.';
  switch (code) {
    case 'VALIDATION':
      message = 'Validation went wrong.';
      break;

    default:
      message = error.message;
      break;
  }

  return new Response(
    JSON.stringify({
      success: false,
      message: message,
      data: error,
    })
  );
};
