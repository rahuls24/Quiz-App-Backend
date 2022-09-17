import {
	ExtractJwt, Strategy as JwtStrategy, StrategyOptions
} from 'passport-jwt';
import { User } from './../../models/user';

import passport from 'passport';
import { ErrorWithStatus } from '../../interfaces/common';

export default function strategy() {
	const opts: StrategyOptions = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: process.env.JWTSecretKey ?? 'defaultJwtKey'
	};
	passport.use(
		'examinee',
		new JwtStrategy(opts, async (jwtPayload, done) => {
			const unauthorizeError: ErrorWithStatus = new Error(
				'User do not have permission to access this route'
			);
			unauthorizeError.status = 401;
			const userNotFoundError: ErrorWithStatus = new Error(
				'No user found'
			);
			userNotFoundError.status = 401;
			try {
				const user = await User.findOne({
					email: jwtPayload.data.email
				});
				if (!user) return done(userNotFoundError, false);
				if (user.role !== 'examinee')
					return done(unauthorizeError, false);
				return done(null, user);
			} catch (error) {
				return done(error, false);
			}
		})
	);
}
