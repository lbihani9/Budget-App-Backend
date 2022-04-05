const express = require("express");
const Info = require("../models/Info");
const Transaction = require("../models/Transactions");

async function getAllTransactions(req, res) {
	// console.log("get transaction request received");
	try {
		const transactions = await Transaction.find(
			{
				user: req.user.id,
				year: Number(req.params.year),
				month: req.params.month,
				envelopeName: req.params.envelope,
			},
			{
				spent: 1,
				message: 1,
			}
		).lean();

		if (!transactions || transactions.length === 0) {
			return res.send({
				transactions: [],
			});
		}

		return res.send({
			transactions: transactions,
		});
	} catch (err) {
		return res.status(500).send({
			message:
				"Unexpected Error occured while fetching transaction. Try reloading the page. If problem persists then try after sometime.",
		});
	}
}

async function addTransaction(req, res) {
	// console.log("post transaction request received");
	req.body.newSpent = Number(req.body.newSpent);

	/*
		$elemMatch operator in conjunction with $ (i.e. positional operator) operator is used to
		select specific nested document.
	*/

	try {
		const envelopeData = await Info.find(
			{
				user: req.user.id,
				envelopes: {
					$elemMatch: {
						year: Number(req.params.year),
						month: req.params.month,
						envelopeName: req.params.envelope,
					},
				},
			},
			{ "envelopes.budget": 1, "envelopes.envelopeName": 1 }
		);

		let allocated = 0;
		let envelopeRemainingBalance = 0;
		for (let itr = 0; itr < envelopeData[0].envelopes.length; itr++) {
			const elem = envelopeData[0].envelopes[itr];
			if (elem.envelopeName === req.params.envelope) {
				envelopeRemainingBalance = elem.budget[1];
				allocated = elem.budget[0];
				break;
			}
		}

		if (envelopeRemainingBalance < req.body.newSpent) {
			return res.status(200).send({
				status: 422,
				message: `This Transaction cannot be made because you are trying to spend more than you had allocated. Your current balance is ${envelopeRemainingBalance}.`,
			});
		}

		const newTransaction = new Transaction({
			user: req.user.id,
			year: Number(req.params.year),
			month: req.params.month,
			envelopeName: req.params.envelope,
			spent: req.body.newSpent,
			message: req.body.newMessage,
		});

		// It must be a transaction i.e., must have ACID properties, but to be able to use transactions MongoDB requires
		// replica set, or shared clusters.
		// [Remember to replace this with Transaction whenever database is deployed to MongoDB Atlas.]

		// Transaction start
		const newRemaingingBalance = envelopeRemainingBalance - req.body.newSpent;
		await Info.updateOne(
			{
				user: req.user.id,
				envelopes: {
					$elemMatch: {
						year: Number(req.params.year),
						month: req.params.month,
						envelopeName: req.params.envelope,
					},
				},
			},
			{
				$set: {
					"envelopes.$.budget": [allocated, newRemaingingBalance],
				},
			},
			{}
		);

		await Transaction.create(newTransaction);
		// Transaction End

		return res.status(201).send({
			message: "Transaction successfully added",
		});
	} catch (err) {
		return res.status(500).send({
			message: "Unexpected Error occured while adding the transaction.",
		});
	}
}

// Incomplete
async function deleteTransaction(req, res) {}

module.exports = { getAllTransactions, addTransaction, deleteTransaction };
