const Card = require('../models/cards');

const getCards = (req, res) => {
  Card.find()
    .populate('owner')
    .then((cards) => {
      res.send({ data: cards });
    })
    .catch(() => {
      res.status(500).send({ message: 'Smth went wrong' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link })
    .then((card) => {
      res.status(201).send({ data: card });
    })
    .catch((e) => {
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
        res.status(404).send({ message: 'Card not found' });
      } else {
        res.send({ data: card });
      }
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        res.status(400).send({ message: 'Invalid card id' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const likeCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('CastError');
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((e) => {
      if (e.name === 'CastError' && e.kind === 'ObjectId') {
        res.status(400).send({ message: 'Invalid card id' });
      } else if (e.name === 'Card not found') {
        res.status(404).send({ message: 'Card not found' });
      } else {
        res.status(500).send({ message: 'Smth went wrong' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new Error('Card not found');
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((e) => {
      if (e.name === 'CastError') {
        res.status(400).send({ message: 'Invalid card id' });
      } else if (e.name === 'Card not found') {
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
