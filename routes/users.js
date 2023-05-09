const express = require('express');

const userRouter = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  updateAvatar,
  getUserMe,
} = require('../controllers/users');
const { patchUserMeValidation, patchUserAvatarValidation, userIdValidation } = require('../middlewares/validator');

userRouter.get('/users/me', getUserMe);
userRouter.get('/users', getUsers);
userRouter.get('/users/:userId', userIdValidation, getUser);
userRouter.patch('/users/me', patchUserMeValidation, updateUser);
userRouter.patch('/users/me/avatar', patchUserAvatarValidation, updateAvatar);

module.exports = { userRouter };
