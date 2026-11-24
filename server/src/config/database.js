import mongoose from 'mongoose';

export async function connectDatabase(uri, client = mongoose) {
  await client.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDatabase(client = mongoose) {
  await client.disconnect();
}
