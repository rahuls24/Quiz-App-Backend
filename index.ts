import 'dotenv/config';
import express, { Request, Response } from 'express';
import { connect, connection } from 'mongoose';
import { router as authRouter } from './src/routes/auth';
import passport from 'passport';
import examinerStrategy from './src/strategies/passportJWTStrategies/examiner';
import examineeStrategy from './src/strategies/passportJWTStrategies/examinee';
import { commonErrorMiddleware } from './src/middlewares/errorHandler';
const app = express();
// Initializing  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());

// app.use(initialize);
//  Registering routes
app.use('/api/auth', authRouter);
// Initializing passport strategies
examinerStrategy();
examineeStrategy();
// DB connection
(async () => {
	try {
		// await connect(process.env.mongoDbURL);
		await connect('mongodb://localhost:27017/test');
	} catch (error) {
		if (error instanceof Error)
			console.log(
				`An error occur while trying to establish the connection to Mongodb and error is ${error.message}`,
			);
		else console.log('Something went wrong while establish the connection');
	}
})();

connection.on('connected', () => {
	console.log('Connection with DB is successful');
});

// !It should be alway last middleware
app.use(commonErrorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
