const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.db = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url);
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(this.db);
    const collection = db.collection('users');
    const users = await collection.find({}).toArray();
    return users.length;
  }

  async nbFiles() {
    const db = this.client.db(this.db);
    const collection = db.collection('files');
    const users = await collection.find({}).toArray();
    return users.length;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
