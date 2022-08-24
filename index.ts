import 'dotenv/config';
import express from 'express';
import { connect, connection } from 'mongoose';
import passport from 'passport';
import { commonErrorMiddleware } from './src/middlewares/errorHandler';
import { morganMiddleware } from './src/middlewares/morgan.middleware';
import { router as authRouter } from './src/routes/auth';
import { router as questionRouter } from './src/routes/question';
import { router as quizRouter } from './src/routes/quiz';
import examineeStrategy from './src/strategies/passportJWTStrategies/examinee';
import examinerStrategy from './src/strategies/passportJWTStrategies/examiner';
import registerUserStrategy from './src/strategies/passportJWTStrategies/registerUser';
import fs from 'fs';
import { serve, setup } from 'swagger-ui-express';
import swaggerFile from './swagger-output.json';

const app = express();

// Initializing  middlewares
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', '*');
	next();
});
app.use(passport.initialize());
// TODO: Why the below initialize is not working
// app.use(initialize);
//  Registering routes
app.use('/api/auth', authRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/question', questionRouter);
// Swagger docs related
// if (process.env.NODE_ENV !== 'production')
// app.use('/doc', serve, setup(swaggerFile));
if (fs.existsSync('./swagger-output.json')) {
	app.use('/doc', serve, setup(swaggerFile));
}
// Initializing passport strategies
examinerStrategy();
examineeStrategy();
registerUserStrategy();
// DB connection
(async () => {
	try {
		await connect(process.env.mongoDbURL ?? '');
		// await connect('mongodb://localhost:27017/test');
	} catch (error) {
		if (error instanceof Error)
			console.log(
				`An error occur while trying to establish the connection to Mongodb and error is ${error.message}`
			);
		else console.log('Something went wrong while establish the connection');
	}
})();

connection.on('connected', () => {
	console.log('Connection with DB is successful');
});

// !It should be alway last middleware
app.use(commonErrorMiddleware);
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
	console.log(`server is running on PORT ${PORT}`);
});

// For Debugging
app.get('/', (req, res) => {
	res.send('<h1>App is running</h1>');
});
