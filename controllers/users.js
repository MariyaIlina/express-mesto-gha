const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/users');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const EmailError = require('../errors/email-error');
const TokenError = require('../errors/token-error');

const getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.status(200).send({ user });
    } else {
      throw new NotFoundError('Пользователь по указанному id не найден');
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidationError('Невалидный id'));
    } else {
      next(err);
    }
  }
};

const getUserMe = async (req, res, next) => {
  const userId = req.user._id;
  console.log('userId=>', userId);
  try {
    const user = await User.findById(userId);
    if (user) {
      res.status(200).send({ user });
    } else {
      throw new NotFoundError('Пользователь по указанному id не найден');
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidationError('Невалидный id'));
    } else {
      next(err);
    }
  }
};

const createUser = async (req, res, next) => {
  if (!req.body) {
    next(new NotFoundError('Invalid request body'));
  }

  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!email || !password) {
    next(new NotFoundError('Email or password is required'));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    next(new NotFoundError('User with this email already exists'));
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(
      {
        name, about, avatar, email, password: hash,
      },
    );
    console.log('=>', user._id);
    const objectId = user._id;
    const idOnly = objectId.toString();
    console.log(idOnly);
    if (user) {
      res.status(201).send(
        {
          data: name, about, avatar, email, idOnly,
        },
      );
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Некоректные данные'));
    } if (err.code === 11000) {
      next(new EmailError('Данный email уже существует в базе данных'));
    } else {
      next(err);
    }
  }
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'some-secret-key', { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true }).send({ message: 'Всё верно!' });
      console.log('token=>', token);
    })
    .catch(() => {
      next(new TokenError('Ошибка авторизации: неправильный логин или пароль'));
    });
};

// const updateUser = (req, res) => {
//   const { _id } = req.user;
//   const { name, about } = req.body;

//   if (name && (name.length < 2 || name.length > 30)) {
//     res
//       .status(400)
//       .send({ message: 'Name should be between 2 and 30 characters long' });
//     return;
//   }

//   if (about && (about.length < 2 || about.length > 30)) {
//     res
//       .status(400)
//       .send({ message: 'About should be between 2 and 30 characters long' });
//     return;
//   }

//   const options = { new: true, omitUndefined: true, runValidators: true };

//   if (
//     (!name || name.length < 2 || name.length > 30)
//   && (!about || about.length < 2 || about.length > 30)
//   ) {
//     res.status(400).send({
//       message:
//         'Name or About should be provided, and be between 2 and 30 characters long',
//     });
//     return;
//   }

//   User.findByIdAndUpdate(_id, { name, about }, options)
//     .orFail(() => {
//       throw new Error('Not found');
//     })
//     .then((user) => {
//       res.send({ data: user });
//     })
//     .catch((e) => {
//       if (e.name === 'CastError') {
//         res.status(400).send({ message: 'ValidationError' });
//       } else if (e.name === 'ValidationError') {
//         const message = Object.values(e.errors)
//           .map((err) => err.message)
//           .join('; ');
//         res.status(404).send({ message });
//       } else if (e.message === 'Not found') {
//         res.status(404).send({ message: 'Not found' });
//       } else {
//         res.status(500).send({ message: 'Smth went wrong' });
//       }
//     });
// };
const updateUser = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    console.log('req.body=>', name, about);
    const opts = { new: true, runValidators: true };
    if (!name || !about) {
      throw new ValidationError('Поля "name" и "about" должно быть заполнены');
    } else {
      const ownerId = req.user._id;
      console.log('ownerId=>', ownerId);
      const userPatchMe = await User.findByIdAndUpdate(ownerId, { name, about }, opts);
      if (userPatchMe) {
        res.status(200).send({ data: userPatchMe });
      } else {
        throw new NotFoundError('Переданы некорректные данные');
      }
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Некорректные данные'));
    } else {
      next(err);
    }
  }
};

const updateAvatar = (req, res) => {
  const { _id } = req.user;
  const { avatar } = req.body;
  if (!avatar) {
    res.status(400).send({ message: 'Avatar URL is required' });
    return;
  }
  const options = { new: true, omitUndefined: true, runValidators: true };

  User.findByIdAndUpdate(_id, { avatar }, options)
    .orFail(() => {
      throw new Error('Not found');
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        res.status(400).send({ message: 'ValidationError' });
      } else if (e.name === 'ValidationError') {
        const message = Object.values(e.errors)
          .map((err) => err.message)
          .join('; ');
        res.status(404).send({ message });
      } else if (e.message === 'Not found') {
        res.status(404).send({ message: 'Not found' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateAvatar,
  login,
  getUserMe,
};
