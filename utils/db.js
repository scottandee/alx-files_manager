const { MongoClient, ObjectId } = require('mongodb');

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

  async getUserByEmail(email) {
    const db = this.client.db(this.db);
    const collection = db.collection('users');
    const result = await collection.find({ email }).toArray();
    return result;
  }

  async getUserById(id) {
    const db = this.client.db(this.db);
    const collection = db.collection('users');
    const result = await collection.find({ _id: ObjectId(id) }).toArray();
    return result;
  }

  async insertUser(email, hashedPwd) {
    const db = this.client.db(this.db);
    const collection = db.collection('users');
    collection.insertOne({ email, password: hashedPwd });

    const newUser = await collection.find({ email }).toArray();
    return { id: newUser[0]._id, email: newUser[0].email };
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
