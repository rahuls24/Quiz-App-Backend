import { User } from './../../models/user';
import {
	Strategy as JwtStrategy,
	ExtractJwt,
	StrategyOptions,
} from 'passport-jwt';
import { use } from 'passport';
var opts: StrategyOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWTSecretKey ?? 'defaultJwtKey',
};

use(
	'examiner',
	new JwtStrategy(opts, async (jwtPayload, done) => {
		try {
			const user = await User.findOne({ email: jwtPayload.email });
			if (!user) return done(new Error('No user found'), false);
			if (user.role !== 'examiner')
				return done(
					new Error(
						'User do not have permission to access this route',
					),
					false,
				);
            return done(null,user)
		} catch (error) {}
	}),
);

