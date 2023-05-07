const express = require('express');
// const { celebrate, Joi } = require('celebrate');

const userRouter = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');

userRouter.get('/users/me', getUserMe);
userRouter.get('/users', getUsers);
userRouter.get('/users/:userId', getUser);
userRouter.patch('/users/me', updateUser);
userRouter.patch('/users/me/avatar', updateAvatar);

module.exports = { userRouter };
