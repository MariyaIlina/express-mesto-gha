const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('../models/users');
const NotFoundError = require('../errors/not-found-error');
const ValidationError = require('../errors/validation-error');
const EmailError = require('../errors/email-error');
const Unauthorized = require('../errors/unauthorized');

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
    next(new NotFoundError('Email и password обязательные поля'));
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    next(new EmailError('Пользователь с такими данными уже существует'));
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create(
      {
        name, about, avatar, email, password: hash,
      },
    );
    if (user) {
      res.status(201).send.select('-password')(
        { user },
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
      res.send({ token });
    })
    .catch(() => {
      next(new Unauthorized('Ошибка авторизации: неправильный логин или пароль'));
    });
};

const updateUser = (req, res, next) => {
  const { _id } = req.user;
  const { name, about } = req.body;

  if (name && (name.length < 2 || name.length > 30)) {
    next(new ValidationError('Поле name должно быть от 2 до 30 символов'));
    return;
  }

  if (about && (about.length < 2 || about.length > 30)) {
    next(new ValidationError('Поле about должно быть от 2 до 30 символов'));
    return;
  }

  const options = { new: true, omitUndefined: true, runValidators: true };

  if (
    (!name || name.length < 2 || name.length > 30)
  && (!about || about.length < 2 || about.length > 30)
  ) {
    next(new ValidationError('Поля name и about должны быть длинной от 2 до 30 символов'));
  }
  User.findByIdAndUpdate(_id, { name, about }, options)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Некорректные данные'));
      } else {
        next(err);
      }
    });
};

const updateAvatar = (req, res, next) => {
  const { _id } = req.user;
  const { avatar } = req.body;
  if (!avatar) {
    next(new ValidationError('Поле avatar должно быть заполнено'));
    return;
  }
  const options = { new: true, omitUndefined: true, runValidators: true };

  User.findByIdAndUpdate(_id, { avatar }, options)
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((avatarUpdate) => {
      res.status(200).send({ avatarUpdate });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Некорректные данные'));
      } else {
        next(err);
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
