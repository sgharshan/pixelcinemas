import { createApp } from './app.js';
import { getEnvironment } from './config/env.js';

const { port } = getEnvironment();
const app = createApp();

app.listen(port, () => {
  console.log(`Pixel Cinemas API listening on port ${port}`);
});
