module.exports = {
	isLoggedIn: function (req, res, next) {
		if (!req.isAuthenticated()) {
			return res.redirect(process.env.CLIENT_URL);
		} else {
			return next();
		}
	},
};
