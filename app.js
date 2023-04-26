const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();
const { userRouter } = require('./routes/users');
const { cardRouter } = require('./routes/cards');

app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '64464700e112916b3a4ccbef',
  };
  next();
});
app.use(userRouter);
app.use(cardRouter);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Такая страница не существует' });
});

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
