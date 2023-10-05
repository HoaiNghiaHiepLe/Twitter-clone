import { Request, Response } from 'express'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body

  if (email !== 'hieple@mail.com' || password !== '123456') {
    return res.status(401).json({
      code: 401,
      message: 'Email or password is incorrect'
    })
  }

  res.json({ message: 'Login sucessful' })
}
