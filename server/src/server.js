import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getEnvironment } from './config/env.js';

const { port, mongoUri, jwtSecret, clientOrigin } = getEnvironment();
const app = createApp({ jwtSecret, clientOrigin });

await connectDatabase(mongoUri);
const server = app.listen(port, () => {
  console.log(`Pixel Cinemas API listening on port ${port}`);
});

async function shutDown(signal) {
  console.log(`${signal} received; closing Pixel Cinemas API`);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutDown('SIGINT'));
process.on('SIGTERM', () => shutDown('SIGTERM'));
