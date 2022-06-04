import { User } from './../../models/user';
import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions,
	VerifiedCallback
} from 'passport-jwt';

import passport from 'passport';

export default function strategy() {
	const opts: StrategyOptions = {
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: process.env.JWTSecretKey ?? 'defaultJwtKey',
	};
	passport.use(
		'examiner',
		new JwtStrategy(opts, async (jwtPayload, done) => {
			try {
				const user = await User.findOne({ email: jwtPayload.data.email });
				if (!user) return done(new Error('No user found'), false);
				if (user.role !== 'examiner')
					return done(
						new Error(
							'User do not have permission to access this route',
						),
						false,
					);
				return done(null, user);
			} catch (error) {}
		}),
	);
}
