const { User } = require("./models/Users");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = function (passport) {
	passport.serializeUser((user, done) => {
		// console.log(`From passport.js serializeUser: ${user}`);
		return done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		User.findById(id, (err, user) => {
			done(err, user);
		});
	});

	passport.use(
		new GoogleStrategy(
			{
				clientID: process.env.CLIENT_ID,
				clientSecret: process.env.CLIENT_SECRET,
				callbackURL: "/auth/google/callback",
				userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
			},

			async (accessToken, refreshToken, profile, done) => {
				const newUser = new User({
					name: profile.displayName,
					googleId: profile.id,
				});

				try {
					let user = await User.findOne({ googleId: profile.id });
					if (!user) {
						user = await User.create(newUser);
					}
					return done(null, user);
				} catch (err) {
					// console.log(`Error From 'passport.js': ${err}`);
					return done(err);
				}
			}
		)
	);
};
