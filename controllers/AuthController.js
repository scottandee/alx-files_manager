const crypto = require('crypto');
const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function getConnect(req, res) {
  const authHeader = req.get('Authorization');
  const arr = authHeader.split(' ');
  const encoded = arr[1];
  const buff = Buffer.from(encoded, 'base64');
  const string = buff.toString('ascii');

  const credentials = string.split(':');
  const user = await dbClient.getUserByEmail(credentials[0]);
  if (user.length === 0) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const hash = crypto.createHash('sha1');
  hash.update(credentials[1]);
  const hashedPwd = hash.digest('hex');

  if (user[0].password !== hashedPwd) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = uuid.v4();
  const key = `auth_${token}`;
  redisClient.set(key, user[0]._id.toString(), 86400);
  res.status(200).json({ token });
}

async function getDisconnect(req, res) {
  const token = req.get('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await redisClient.del(key);
  res.status(204).json();
}

module.exports = { getConnect, getDisconnect };
