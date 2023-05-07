const jwt = require('jsonwebtoken');

// const JWT_SECRET = '123456789';

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    res
      .status(401)
      .send({ message: 'Необходима авторизация' });
    return;
  }
  // const token = jwt.sign({_id:user._id}, JWT_SECRET);
  const token = authorization.replace('Bearer ', '');
  let payload;
  console.log('tokenAUTh=>', token);
  try {
    payload = jwt.verify(token, 'some-secret-key');
    console.log('payload=>', payload);
  } catch (err) {
    res.status(401).send({ message: 'Необходима авторизация' });
  }
  req.user = payload;
  next();
};
