// Importing Modules

import { config } from "dotenv";
config();
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import bodyParser from "body-parser";
import { readdirSync, watch } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import os from "os";

import { socketMiddleware } from "./middlewares/socket.io.js";
import { app, http, io } from "./models/backend.js";
import { offlineCronJob as cron } from "./utils/cron.js";

// Declaring Variables, Constants & Functions
const limiter = rateLimit({
  windowMs: 30 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
});
const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// Importing Basic Middlewares

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  morgan(
    '[:date[clf]] || :status || ":method :url HTTP/:http-version" || ":referrer" ":user-agent"'
  )
);
app.use(helmet());
app.use(cors(corsOptions));
app.use(limiter);
app.set("etag", false);
app.set("trust proxy", true);

io.on("connection", socketMiddleware);

// Importing Dynamic Routes
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const routeDir = join(__dirname, "./routes");
const routes = readdirSync(routeDir);
const isWindows = os.platform() === "win32";

for await (const route of routes) {
  const { default: router } = await import(
    `${isWindows ? "file://" : ""}${routeDir}/${route}`
  );
  app.use(`/api/${route.split(".")[0]}`, router);
}

// Use fs.watch and Watch the Route Directory for Changes and Update Changed Routes
watch(routeDir, async (eventType, filename) => {
  if (filename) {
    console.log(`${filename} file Changed`);
    const { default: router } = await import(
      `${isWindows ? "file://" : ""}${routeDir}/${filename}`
    );
    app.use(`/api/${filename.split(".")[0]}`, router);
  }
});

// Connect mqttClient
const cronJob = setInterval(() => cron(), 1000 * 60 * 5);
const server = http.listen(process.env.SOCKET_PORT, () => {
  console.log(`Socket.io server is running on port ${process.env.SOCKET_PORT}`);
});
