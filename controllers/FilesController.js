const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

async function postUpload(req, res) {
  const token = req.get('X-Token');
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const {
    name, type, parentId, isPublic, data,
  } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Missing name' });
    return;
  }
  const acceptedTypes = ['file', 'folder', 'image'];
  if (!type || !acceptedTypes.includes(type)) {
    res.status(400).json({ error: 'Missing type' });
    return;
  }
  if (!data && type !== 'folder') {
    res.status(400).json({ error: 'Missing data' });
    return;
  }

  if (parentId) {
    const result = await dbClient.findFileByParent(parentId);
    if (result.length === 0) {
      res.status(400).json({ error: 'Parent not found' });
      return;
    }
    if (result[0].type !== 'folder') {
      res.status(400).json({ error: 'Parent is not a folder' });
      return;
    }
  }

  if (type === 'folder') {
    const result = await dbClient.insertFile(
      userId, name, isPublic, parentId, type,
    );
    res.status(201).json(result);
  } else {
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filename = uuid.v4();
    const filePath = path.join(folderPath, filename);
    const decodedData = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, decodedData);

    const result = await dbClient.insertFile(
      userId, name, isPublic, parentId, type, filePath,
    );
    res.status(201).json(result);
  }
}

module.exports = { postUpload };
