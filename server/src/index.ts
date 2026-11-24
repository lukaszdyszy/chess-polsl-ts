import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from './routes/index.js';
import wsManager from './sockets/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan(':remote-addr :date[iso] :method :url :status :response-time ms - :res[content-length]'));
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true,
	allowedHeaders: ['cookie', 'Content-type']
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start server
const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

// Websockets
wsManager.initialize(server);

// Routes
app.use(router);