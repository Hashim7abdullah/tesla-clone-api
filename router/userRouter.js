import express from 'express'
import { loginUser, registerUser } from '../controller/userController.js'


const userRouter = express.Router()

userRouter.post("/login" , loginUser)
userRouter.post("/signin" , registerUser)

export default userRouter