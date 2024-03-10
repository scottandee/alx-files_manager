const redis = require('redis');
const util = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.connected = true;
    this.client.on('error', (err) => {
      console.log('Redis client error', err);
      this.connected = false;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    return util.promisify(this.client.get).bind(this.client)(key);
  }

  async set(key, value, duration) {
    return util.promisify(this.client.set).bind(this.client)(key, value, 'EX', duration);
  }

  async del(key) {
    return util.promisify(this.client.del).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
