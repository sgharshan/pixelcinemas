export function getEnvironment(source = process.env) {
  return {
    port: Number(source.PORT ?? 3000),
    clientOrigin: source.CLIENT_ORIGIN ?? 'http://localhost:5173',
  };
}
