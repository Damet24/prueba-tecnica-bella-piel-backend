import { Server } from './server';                                      
import { env } from './config/env.config';
import logger from './config/logger';

const server = new Server(String(env.port));

server.listen().catch((err) => logger.error('Server failed to start', err));
