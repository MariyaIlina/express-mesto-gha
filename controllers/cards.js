const mongoose = require('mongoose');
const Card = require('../models/cards');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(() => {
      res.status(500).send({ message: 'Smth went wrong' });
    });
};

const createCard = (req, res) => {
  console.log('req.user._id=>', req.user._id);
  const { name, link } = req.body;

  Card.create({ name, link }).then((card) => {
    res.status(201).send({ data: card });
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
const deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Card not found' });
      }
      return res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(400).send({ message: 'Invalid Id' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const likeCard = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    res.status(400).send({ message: 'Invalid card id' });
    return;
  }

  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new Error('Card not found');
    })
    .then(() => {
      Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } },
        { new: true },
      )
        .then((card) => {
          res.send({ data: card });
        })
        .catch((e) => {
          if (e.message === 'Not found') {
            res.status(404).send({ message: 'Card not found' });
          } else {
            res.status(500).send({ message: 'Smth went wrong' });
          }
        });
    })
    .catch((e) => {
      if (e.message === 'Card not found') {
        res.status(404).send({ message: 'Card not found' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const dislikeCard = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    res.status(400).send({ message: 'Invalid card id' });
    return;
  }

  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new Error('Card not found');
    })
    .then(() => {
      Card.findByIdAndUpdate(
        req.params.cardId,
        { $pull: { likes: req.user._id } },
        { new: true },
      )
        .then((card) => {
          res.send({ data: card });
        })
        .catch((e) => {
          if (e.message === 'Not found') {
            res.status(404).send({ message: 'Card not found' });
          } else {
            res.status(500).send({ message: 'Smth went wrong' });
          }
        });
    })
    .catch((e) => {
      if (e.message === 'Card not found') {
        res.status(404).send({ message: 'Card not found' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
