const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const authRouter = require("./routes/auth");
const Info = require("./models/Info");
const Transaction = require("./models/Transactions");
const recordsRouter = require("./routes/recordsRouter");
const { User, userSchema } = require("./models/Users");
const startDB = require("./models/db");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.set("trust proxy", 1);

app.use(
	session({
		secret: "some random string",
		resave: false,
		saveUninitialized: false,
		store: MongoStore.create({
			mongoUrl: process.env.MONGO_URL + "/budgetDB",
		}),
		cookie: {
			sameSite: "none",
			secure: true,
			maxAge: 1000 * 60 * 60 * 24 * 7,
		},
	})
);

startDB();

app.get("/", (req, res) => {
	res.send("Server is running.");
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/api/dashboard", recordsRouter);

require("./passport")(passport);

// if (process.env.NODE_ENV === "production") {
// 	app.use(express.static(path.join(__dirname, "/budget-app-frontend/build")));
// 	app.get("*", (req, res) => {
// 		res.sendFile(__dirname, "budget-app-frontend", "build", "index.html");
// 	});
// }

app.listen(PORT, () => {
	console.log(`Server started listening on port ${PORT}.....`);
});
