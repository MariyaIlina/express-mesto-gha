const User = require('../models/users');

const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.send({ data: users });
    })
    .catch(() => {
      res.status(500).send({ message: 'Smth went wrong' });
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById({ _id: userId })
    .orFail(() => {
      throw new Error('Not found');
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      try {
        if (e.message === 'Not found') {
          res.status(404).send({ message: 'User not found' });
        } else {
          res.status(400).send({ message: 'Smth went wrong' });
        }
      } catch (error) {
        res.status(500).send({ message: 'Internal server error' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.status(201).send({ data: user });
    })
    .catch((e) => {
      console.log('e => ', e.errors);
      if (e.name === 'ValidationError') {
        const message = Object.values(e.errors)
          .map((error) => error.message)
          .join('; ');
        res.status(400).send({ message });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const updateUser = (req, res) => {
  const { _id } = req.user;
  let { name, about } = req.body;

  if (name && (name.length < 2 || name.length > 30)) {
    return res.status(400).send({ message: 'Name should be between 2 and 30 characters long' });
  }

  if (about && (about.length < 2 || about.length > 30)) {
    return res.status(400).send({ message: 'About should be between 2 and 30 characters long' });
  }

  const options = { new: true, omitUndefined: true };

  if (name === null) {
    name = undefined;
  }
  if (about === null) {
    about = undefined;
  }

  if ((!name || name.length < 2 || name.length > 30) &&
     (!about || about.length < 2 || about.length > 30)) {
    return res.status(400).send({
      message: 'Name or About should be provided, and be between 2 and 30 characters long',
    });
  }

  User.findByIdAndUpdate(_id, { name, about }, options)
    .orFail(() => {
      throw new Error('Not found');
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.message === 'Not found') {
        res.status(404).send({ message: 'User not found' });
      } else if (e.name === 'ValidationError') {
        const message = Object.values(e.errors)
          .map((error) => error.message)
          .join('; ');
        res.status(400).send({ message });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { _id } = req.user;
  const { avatar } = req.body;

  User.findByIdAndUpdate(_id, { avatar }, { new: true })
    .orFail(() => {
      throw new Error('Not found');
    })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      if (e.message === 'Not found') {
        res.status(404).send({ message: 'User not found' });
      } else if (e.name === 'ValidationError') {
        const message = Object.values(e.errors)
          .map((error) => error.message)
          .join('; ');
        res.status(400).send({ message });
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
};
