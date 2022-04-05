const router = require("express").Router();
const passport = require("passport");

router.get("/login/failed", (req, res) => {
	// console.log(res);
	res.status(401).json({
		message: "login failed",
	});
});

router.get("/login/success", (req, res) => {
	if (req.user) {
		return res.status(200).json({
			message: "login success",
		});
	}

	return res.redirect("/login/failed");
});

router.get("/logout", (req, res) => {
	req.logout();
	res.redirect(process.env.CLIENT_URL);
});

router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
	"/google/callback",
	passport.authenticate("google", {
		failureRedirect: "/auth/login/failed",
		successRedirect: process.env.CLIENT_URL + "/dashboard",
	})
);

module.exports = router;
