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

userRouter.get('/me', getUserMe);
userRouter.get('/', getUsers);
userRouter.get('/:userId', userIdValidation, getUser);
userRouter.patch('/me', patchUserMeValidation, updateUser);
userRouter.patch('/me/avatar', patchUserAvatarValidation, updateAvatar);

module.exports = { userRouter };
