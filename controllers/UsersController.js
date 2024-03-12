const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function postNew(req, res) {
  const { email, password } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Missing email' });
    return;
  }
  if (!password) {
    res.status(400).json({ error: 'Missing password' });
    return;
  }

  // check if email already exists
  const user = await dbClient.getUserByEmail(email);
  if (user.length > 0) {
    res.status(400).json({ error: 'Already exist' });
    return;
  }

  // Hash Password
  const hash = crypto.createHash('sha1');
  hash.update(password);
  const hashedPwd = hash.digest('hex');

  // Save to db
  const newUser = await dbClient.insertUser(email, hashedPwd);
  res.status(201).json(newUser);
}

async function getMe(req, res) {
  const token = req.get('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const user = await dbClient.getUserById(userId);
  res.status(200).json({ id: user[0]._id, email: user[0].email });
}

module.exports = { postNew, getMe };
