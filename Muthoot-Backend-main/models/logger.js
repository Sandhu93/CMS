import { LogHandler } from '../utils/utils.js';
import { database } from '../services/mongodb.service.js';

export const logger = new LogHandler(database.logs);