import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectDatabase, disconnectDatabase } from '../../src/config/database.js';

let mongoServer;

export async function startTestDatabase() {
  mongoServer = await MongoMemoryServer.create();
  await connectDatabase(mongoServer.getUri());
}

export async function clearTestDatabase() {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({}),
    ),
  );
}

export async function stopTestDatabase() {
  await disconnectDatabase();
  await mongoServer?.stop();
  mongoServer = undefined;
}
