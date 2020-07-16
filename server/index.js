const config = {
  port: 3000, // port to listen. default is 3000 for node servers
  listen: "0.0.0.0", // restrict access to this ip range
  // Generate a custom token. Recommended uuidv4();
  token: "8D271224-9A7C-4AC2-8C11-E7E7443C9DAB", // Only allow access if the token is provided
};

const server = require("fastify")({
  logger: true,
  ignoreTrailingSlash: true,
});

const okResponse = ({ request, reply, info = {} }) =>
  reply
    .type("application/json")
    .code(200)
    .send({
      version: "1.0.0",
      headers: request.headers,
      body: request.body,
      query: request.query,
      success: true,
      ...info,
    });

const errorResponse = ({ request, reply, message }) =>
  reply
    .code(400)
    .send({ success: false, error: message, headers: request.headers });

// Endpoints

server.get("/", (request, reply) => {
  server.log.info("Got Request");
  server.log.debug(request);

  const token = request.query.token;

  if (token !== config.token) {
    server.log.error("Token Mismatch");
    return errorResponse({ request, reply, message: "Token Mismatch" });
  }

  const json = JSON.parse(decodeURIComponent(request.query.json));
  const info = { token, json };

  // You can use json info to
  // save the data to your database
  // or similar

  server.log.info("Saved Data");
  server.log.debug(info);

  return okResponse({ request, reply, info });
});

// Run the server, specify the listener address too!
server.listen(config.port, config.listen, (err, address) => {
  if (err) {
    server.log.error(err);
  }
  server.log.info(`Server listening on ${address}`);
});
