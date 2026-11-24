import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { getEnvironment } from './config/env.js';

import { SeatHoldService } from './seats/SeatHoldService.js';
import { registerSeatHandlers } from './sockets/registerSeatHandlers.js';

const { port, mongoUri, jwtSecret, clientOrigin, seatHoldSeconds } = getEnvironment();
const app = createApp({ jwtSecret, clientOrigin });
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: clientOrigin } });
const runtimeHoldService = registerSeatHandlers(io, new SeatHoldService({ ttlMs: seatHoldSeconds * 1000 }));
app.locals.io = io;
app.locals.seatHoldService = runtimeHoldService;

await connectDatabase(mongoUri);
const server = httpServer.listen(port, () => {
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
