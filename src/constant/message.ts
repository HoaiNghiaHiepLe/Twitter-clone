export const USER_MESSAGE = {
  VALIDATION_ERROR: 'validation error',
  IS_REQUIRED: ':field is required',
  MUST_BE_A_STRING: ':field must be a string',
  LENGTH: ':field must be between :min and :max characters',
  ALREADY_EXISTS: ':field already exists',
  INVALID: ':field is invalid',
  PASSWORD_STRONG: 'password must be at least 6 characters, 1 uppercase letter and 1 symbol',
  STRONG: ':field must be at least :minLength characters, :minUppercase uppercase letter and :minSymbols symbol',
  NOT_MATCH: ':field does not match',
  NOT_FOUND: ':field not found',
  INCORRECT: ':field is incorrect',
  SUCCESSFUL: ':work successful',
  ALREADY: ':field already :work before',
  SEND_EMAIL: 'A :link has been sent to your email',
  UNVERIFIED: ':field is unverified',
  EXPIRED: ':field is expired'
} as const
