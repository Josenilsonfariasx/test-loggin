require("./instrument.js");
require("dotenv").config();

const Sentry = require("@sentry/node");
const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(pinoHttp({ logger }));

Sentry.setupExpressErrorHandler(app);

app.use("/products", productsRouter);

app.use(function onError(err, req, res, next) {
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.get("/health", (req, res) => {
  req.log.info("Health check");
  res.json({ status: "ok" });
});

app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});
