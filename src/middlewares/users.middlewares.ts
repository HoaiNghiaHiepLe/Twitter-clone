import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      code: 400,
      message: 'Email and password are required'
    })
  }

  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: { errorMessage: 'Name is required' },
      isString: { errorMessage: 'Name must be a string' },
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: 'Name must be between 3 and 100 characters'
      },
      trim: true
    },
    email: {
      isEmail: { errorMessage: 'Email is invalid' },
      notEmpty: { errorMessage: 'Email is required' },
      trim: true
    },
    password: {
      notEmpty: { errorMessage: 'Password is required' },
      isString: { errorMessage: 'Password must be a string' },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password must be between 6 and 50 characters'
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: 'Password must be at least 6 characters, 1 uppercase letter and 1 symbol'
      }
    },
    confirm_password: {
      notEmpty: { errorMessage: 'Password confirmation is required' },
      isString: { errorMessage: 'Password confirmation must be a string' },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: 'Password confirmation must be between 6 and 50 characters'
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: 'Password must be at least 6 characters, 1 uppercase letter and 1 symbol'
      },
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password')
          }
          return true
        }
      }
    },
    date_of_birth: {
      notEmpty: { errorMessage: 'Date of birth is required' },
      isISO8601: {
        options: { strict: true, strictSeparator: true },
        errorMessage: 'Date of birth must be a valid date'
      }
    }
  })
)
