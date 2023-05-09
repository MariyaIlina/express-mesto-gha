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

cardRouter.get('/cards', getCards);

cardRouter.post('/cards', createCardValidation, createCard);

cardRouter.delete('/cards/:cardId', validateCardId, deleteCard);

cardRouter.put('/cards/:cardId/likes', validateCardId, likeCard);

cardRouter.delete('/cards/:cardId/likes', validateCardId, dislikeCard);

module.exports = { cardRouter };
