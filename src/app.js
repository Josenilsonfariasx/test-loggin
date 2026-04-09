require("dotenv").config();
const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const productsRouter = require("./routes/products");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/products", productsRouter);

app.get("/health", (req, res) => {
  req.log.info("Health check");
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server started");
});
