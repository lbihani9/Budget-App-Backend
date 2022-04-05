const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");

const startDB = async () => {
	try {
		// const mongoBaseURL = "mongodb://0.0.0.0:37017";
		const mongoBaseURL = process.env.MONGO_URL;
		const dbName = "budgetDB";
		const mongoURL = mongoBaseURL + "/" + dbName;

		const conn = await mongoose.connect(mongoURL, { useNewUrlParser: true });
		console.log(`MongoDB started at: ${conn.connection.host}....`);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
};

module.exports = startDB;
