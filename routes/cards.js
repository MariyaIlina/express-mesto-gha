const express = require('express');

const cardRouter = express.Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');
const { createCardValidation, validateCardId } = require('../middlewares/validator');

cardRouter.get('/', getCards);

cardRouter.post('/', createCardValidation, createCard);

cardRouter.delete('/:cardId', validateCardId, deleteCard);

cardRouter.put('/:cardId/likes', validateCardId, likeCard);

cardRouter.delete('/:cardId/likes', validateCardId, dislikeCard);

module.exports = { cardRouter };
