export const USER_MESSAGE = {
  VALIDATION_ERROR: 'validation error',
  IS_REQUIRED: ':field is required',
  MUST_BE_A_STRING: ':field must be a string',
  LENGTH: ':field must be between :min and :max characters',
  ALREADY_EXISTS: ':field already exists',
  INVALID: ':field is invalid',
  STRONG: ':field must be at least :minLength:maxLength characters, :additionals',
  NOT_MATCH: ':field does not match',
  NOT_FOUND: ':field not found',
  INCORRECT: ':field is incorrect',
  SUCCESSFUL: ':work successful',
  ALREADY: ':field already :work before',
  SEND_EMAIL: 'A :link has been sent to your email',
  UNVERIFIED: ':field is unverified',
  EXPIRED: ':field is expired'
} as const
