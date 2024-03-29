import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import fs from 'fs'
import { replace } from 'lodash'
import path from 'path'
import { replaceHtmlTemplateVariables } from './utils'
import { PATH } from '~/constant/path'
import { TokenType } from '~/constant/enum'
import { envConfig } from '~/constant/config'

// Create SES service object.
const sesClient = new SESClient({
  region: envConfig.awsRegion,
  credentials: {
    secretAccessKey: envConfig.awsSecretAccessKey,
    accessKeyId: envConfig.awsAccessKeyId
  }
})

// Đọc file template verify email
export const verifyEmailTemplate = fs.readFileSync(path.resolve('src/templates/verify-email.html'), 'utf8')

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string | string[]
  body: string
  subject: string
  replyToAddresses?: string | string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}
const sendEmail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: envConfig.awsSesFromAddress,
    toAddresses: toAddress,
    body,
    subject
  })
  await sesClient.send(sendEmailCommand)
  // try {
  //   console.log('Email sent to: ', toAddress)
  //   return await sesClient.send(sendEmailCommand)
  // } catch (e) {
  //   console.error('Failed to send email.')
  //   return e
  // }
}

// Test gửi email bằng command
// sendEmail('hieple.dev.1209@gmail.com', 'Tiêu đề email', '<h1>Nội dung email</h1>')

// Gửi email verify bằng gọi lại hàm sendEmail
export const sendVerifyEmail = (
  toAddress: string,
  email_verify_token: string,
  // Mặc định khi k truyền sẽ dùng sendVerifyEmailTemplate
  emailTemplate: string = verifyEmailTemplate
) => {
  // truyền vào 3 tham số: địa chỉ email người nhận, tiêu đề email, nội dung email
  return sendEmail(
    toAddress,
    'Verify Email',
    // thay thế các biến trong template bằng các giá trị tương ứng
    replaceHtmlTemplateVariables(emailTemplate, {
      title: 'Please verify your email address',
      content: 'Please verify your email address by clicking the link below.',
      titleLink: 'Verify Email',
      // Dùng khi verify token với route verify-email ở client
      // link: `${envConfig.clientUrl}${PATH.USER.VERIFY_EMAIL}?token=${email_verify_token}`
      // Dùng khi verify token với route chung verify tất cả token ở client: verify-token
      link: `${envConfig.clientUrl}${PATH.USER.VERIFY_TOKEN}?token=${email_verify_token}&tokenType=${TokenType.EmailVerifyToken}&endPoint=${PATH.BASE.USERS}${PATH.USER.VERIFY_EMAIL}`
    })
  )
}

export const sendForgotPasswordEmail = (
  toAddress: string,
  forgot_password_token: string,
  emailTemplate: string = verifyEmailTemplate
) => {
  return sendEmail(
    toAddress,
    'Reset Password',
    replaceHtmlTemplateVariables(emailTemplate, {
      title: 'Reset your password',
      content: 'Please reset your password by clicking the link below.',
      titleLink: 'Reset Password',
      // Dùng khi verify token với route verify-forgot-password ở client
      // link: `${envConfig.clientUrl}${PATH.USER.VERIFY_FORGOT_PASSWORD}?token=${forgot_password_token}`
      // Dùng khi verify token với route chung verify tất cả token ở client: verify-token
      link: `${envConfig.clientUrl}${PATH.USER.VERIFY_TOKEN}?token=${forgot_password_token}&tokenType=${TokenType.ForgotPasswordToken}&endPoint=${PATH.BASE.USERS}${PATH.USER.VERIFY_FORGOT_PASSWORD}`
    })
  )
}
