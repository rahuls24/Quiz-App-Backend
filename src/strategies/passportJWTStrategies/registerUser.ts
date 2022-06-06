import { User } from '../../models/user';
import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions,
} from 'passport-jwt';

import passport from 'passport';

export default function strategy() {
	const opts: StrategyOptions = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: process.env.JWTSecretKey ?? 'defaultJwtKey',
	};
	passport.use(
		'user',
		new JwtStrategy(opts, async (jwtPayload, done) => {
			try {
				const userNotFoundError: any = new Error('No user found');
				userNotFoundError.status = 401;
				const user = await User.findOne({
					email: jwtPayload.data.email,
				});
				if (!user) return done(userNotFoundError, false);
				return done(null, user);
			} catch (error) {
				return done(error, false);
			}
		}),
	);
}
