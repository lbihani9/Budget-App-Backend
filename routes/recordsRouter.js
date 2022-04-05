const express = require("express");
const {
	getAllEnvelopes,
	addEnvelope,
	deleteEnvelope,
} = require("../controllers/envelopes");
const {
	getAllTransactions,
	addTransaction,
	deleteTransaction,
} = require("../controllers/transactions");
const { getAllYears, addYear, deleteYear } = require("../controllers/years");
const { isLoggedIn } = require("../middlewares/auth");

const recordsRouter = express.Router();

// send all years
recordsRouter.get("/", isLoggedIn, getAllYears);

// add new year
recordsRouter.post("/", isLoggedIn, addYear);

// delete year and all the transactions of this year.
recordsRouter.delete("/", isLoggedIn, deleteYear);

// send all the envelopes created in a month of particular year.
recordsRouter.get("/:year/:month", isLoggedIn, getAllEnvelopes);

// create new envelope
recordsRouter.post("/:year/:month", isLoggedIn, addEnvelope);

// delete envelope
recordsRouter.delete("/:year/:month", isLoggedIn, deleteEnvelope);

// send all the transactions from a particular envelope.
recordsRouter.get("/:year/:month/:envelope", isLoggedIn, getAllTransactions);

// add transaction in a particular envelope.
recordsRouter.post("/:year/:month/:envelope", isLoggedIn, addTransaction);

// for now, not required
// recordsRouter.delete("/:year/:month/:envelope", isLoggedIn, deleteTransaction);

module.exports = recordsRouter;
