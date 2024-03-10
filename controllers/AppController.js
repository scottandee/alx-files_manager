const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

function getStatus(req, res) {
  res.status(200).json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
}

async function getStats(req, res) {
  const numUsers = await dbClient.nbUsers();
  const numFiles = await dbClient.nbFiles();
  res.status(200).json({ users: numUsers, files: numFiles });
}

module.exports = { getStats, getStatus };
