const Card = require('../models/cards');
const NotFoundError = require('../errors/not-found-error');
const DeleteCardError = require('../errors/delete-card-error');
const Unauthorized = require('../errors/unauthorized');
const ValidationError = require('../errors/validation-error');

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.status(200).send(cards);
  } catch (err) {
    next(err);
  }
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const ownerId = req.user._id;
    if (!name || !link) {
      throw new ValidationError('Поля "name" и "link" должны быть заполнены');
    } else {
      const card = await Card.create({ name, link, owner: ownerId });
      res.status(201).send({ data: card });
    }
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new ValidationError('Некорректные данные'));
    } else {
      next(err);
    }
  }
};
const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;
  Card.findOne({ _id: cardId })
    .then((card) => {
      if (!card) {
        throw new NotFoundError();
      }
      if (card.owner.toString() !== userId) {
        throw new DeleteCardError('Карточка не принадлежит авторизованному пользователю');
      }
      return Card.findOneAndRemove({ _id: cardId });
    })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      res.json({ deleteCard: card });
    })
    .catch(next);
};

const likeCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const cardLike = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (cardLike) {
      res.status(200).send({ cardLike });
    } else {
      throw new NotFoundError('Переданы некорректные данные');
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidationError('Невалидный id'));
    } else {
      next(err);
    }
  }
};

const dislikeCard = async (req, res, next) => {
  const { cardId } = req.params;
  try {
    const cardDisLike = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (cardDisLike) {
      res.status(200).send({ cardDisLike });
    } else {
      throw new NotFoundError('Переданы некорректные данные');
    }
  } catch (err) {
    if (err.name === 'CastError') {
      next(new ValidationError('Невалидный id'));
    } else {
      next(err);
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
