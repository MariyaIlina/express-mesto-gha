const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  name: {
    minlength: [2, 'Минимальное колличество символов 2'],
    maxlength: 30,
    required: [true, 'Введите имя'],
    type: String,
  },
  link: {
    type: String,
    required: [true, 'Введите ссылку'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    autopopulate: true,

  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
