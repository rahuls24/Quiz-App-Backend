import 'dotenv/config';
import express, { Request, Response } from 'express';
import session from 'express-session';
import { connect, connection } from 'mongoose';
import { router as authRouter } from './src/routes/auth';
import { router as quizRouter } from './src/routes/quiz';
import { router as questionRouter } from './src/routes/question';
import passport from 'passport';
import examinerStrategy from './src/strategies/passportJWTStrategies/examiner';
import examineeStrategy from './src/strategies/passportJWTStrategies/examinee';
import registerUserStrategy from './src/strategies/passportJWTStrategies/registerUser';
import { commonErrorMiddleware } from './src/middlewares/errorHandler';
import MongoStore from 'connect-mongo';
const app = express();
// Initializing  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Methods", "*");
	res.header("Access-Control-Allow-Headers", 
			   "*");
    next();
  });
// TODO: When should I use session 
//  
// app.use(
// 	session({
// 		secret: 'mystrongjwtsecretkeyforquizapp',
// 		resave: false,
// 		saveUninitialized: false,
// 		store: MongoStore.create({
// 			mongoUrl: 'mongodb://localhost:27017/test',
// 			crypto: {
// 				secret: 'squirrel',
// 			},
// 			dbName: 'test',
// 		}),
// 		cookie: {
// 			sameSite: true,
// 			httpOnly: true,
// 			secure: true,
// 			maxAge: 1000 * 60 * 60 * 24 * 30,
// 		},
// 	}),
// );
app.use(passport.initialize());
// app.use(passport.session());
// TODO: Why the below initialize is not working 
// app.use(initialize);
//  Registering routes
app.use('/api/auth', authRouter);
app.use('/api/quiz', quizRouter);
app.use('/api/question', questionRouter);
// Initializing passport strategies
examinerStrategy();
examineeStrategy();
registerUserStrategy();
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
app.get('/',(req,res)=>{
	res.status(200).json({
		working:"OK"
	})
})
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
