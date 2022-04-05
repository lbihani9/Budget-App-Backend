const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
	user: mongoose.Schema.Types.ObjectId,
	years: [Number],
	envelopes: [
		{
			year: Number,
			month: String,
			envelopeName: String,
			budget: [Number],
		},
	],
});

const Info = mongoose.model("Info", infoSchema);

module.exports = Info;
