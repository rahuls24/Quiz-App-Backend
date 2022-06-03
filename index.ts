import 'dotenv/config';
import express from 'express';
import { connect, connection } from 'mongoose';
import { router as authRouter } from './src/routes/auth';
const app = express();
// Initializing  middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
//  Registering routes
app.use('/api/auth', authRouter);
connection.on('connected', () => {
	console.log('Connection with DB is successful');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
