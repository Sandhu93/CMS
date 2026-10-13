import express from 'express';
import { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';

export const app = express();
export const http = new HttpServer(app);
export const io = new IOServer(http, {
  cors: {
    origin: "*",
  },
});