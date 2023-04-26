const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    minlength: 2,
    maxlength: 30,
    required: true,
    type: String
  },
  about: {
    minlength: 2,
    maxlength: 30,
    required: true,
    type: String
  },
  avatar: {
    required: true,
    type: String
  }
})

module.exports = mongoose.model('user', userSchema)
