const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
	user: mongoose.Schema.Types.ObjectId,
	year: Number,
	month: String,
	envelopeName: String,
	spent: Number,
	message: {},
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
