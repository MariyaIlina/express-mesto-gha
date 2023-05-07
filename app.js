const express = require('express');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');

const { PORT = 3000 } = process.env;
const app = express();
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

app.use(express.json());
const { login, createUser } = require('./controllers/users');

app.post('/signin', login);
app.post('/signup', createUser);
app.use(auth);

app.use(userRouter);
app.use(cardRouter);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Такая страница не существует' });
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
