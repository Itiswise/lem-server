import express from "express";
import http from "http";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import ioserver, { Socket, Server, ServerOptions } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import router from "./router";
import { sockets } from "./sockets";
import { keys } from "./config/keys";
import {initAgenda} from "./jobs";
import { createLogger } from "./logger";

const app = express();
dotenv.config();

const options: ServerOptions = {
  origins: "*:*",
  transports: ["websocket"],
};

// DB setup
mongoose.connect(keys.dbAtlas, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

// App setup
app.use(morgan("combined")); // logging framework for debugging
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// forwarding to https on Heroku
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https")
      res.redirect(`https://${req.header("host")}${req.url}`);
    else next();
  });
}

router(app);

// Server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);

// WebSockets setup

const io: Server = ioserver(server, options);
sockets(io);

server.listen(port);
console.log("server is listening on: ", port);

const logger = createLogger();

(async function() {
  await initAgenda(logger);
})();
