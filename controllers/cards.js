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

const likeCard = async (req, res) => {
  const { cardId } = req.params;
  try {
    const cardExist = await Card.exists({ _id: cardId });
    if (!cardExist) {
      res.status(404).send({ message: 'Card not found' });
      return;
    }
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).orFail(() => {
      throw new Error('CastError');
    });
    res.send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Invalid card id' });
    } else {
      res.status(500).send({ message: 'Something went wrong' });
    }
  }
};

const dislikeCard = async (req, res) => {
  const { cardId } = req.params;
  try {
    const cardExist = await Card.exists({ _id: cardId });
    if (!cardExist) {
      res.status(404).send({ message: 'Card not found' });
      return;
    }
    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).orFail(() => {
      throw new Error('CastError');
    });
    res.send({ data: card });
  } catch (err) {
    if (err.name === 'CastError') {
      res.status(400).send({ message: 'Invalid card id' });
    } else {
      res.status(500).send({ message: 'Something went wrong' });
    }
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
