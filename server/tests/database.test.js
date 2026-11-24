import { connectDatabase, disconnectDatabase } from '../src/config/database.js';

describe('database lifecycle', () => {
  test('connects to the supplied MongoDB URI with a bounded server timeout', async () => {
    const calls = [];
    const client = {
      connect: async (...args) => calls.push(args),
    };

    await connectDatabase('mongodb://localhost:27017/pixel-cinemas-test', client);

    expect(calls).toEqual([
      [
        'mongodb://localhost:27017/pixel-cinemas-test',
        { serverSelectionTimeoutMS: 5000 },
      ],
    ]);
  });

  test('disconnects the active Mongoose client', async () => {
    let disconnectCount = 0;
    const client = {
      disconnect: async () => {
        disconnectCount += 1;
      },
    };

    await disconnectDatabase(client);

    expect(disconnectCount).toBe(1);
  });
});
