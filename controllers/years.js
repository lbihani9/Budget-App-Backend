const express = require("express");
const Info = require("../models/Info");
const Transaction = require("../models/Transactions");

async function getAllYears(req, res) {
	try {
		/* 
		.find() method always returns the document in an array (in case no data exist, it returns an empty array.)
		*/
		const data = await Info.find({ user: req.user.id }).lean();

		if (!data || data.length === 0 || !data[0].years) {
			return res.send({
				years: [],
			});
		}

		return res.send({ years: data[0].years });
	} catch (err) {
		return res.status(500).send({
			message: "Unexpected Error occured while generating the response.",
		});
	}
}

async function addYear(req, res) {
	try {
		const hasUser = await Info.find({
			user: req.user.id,
		}).lean();

		if (!hasUser || hasUser.length === 0) {
			await Info.create({
				user: req.user.id,
				years: [req.body.newYear],
				envelopes: [],
			});
		} else {
			const data = await Info.find({
				user: req.user.id,
				years: req.body.newYear,
			}).lean();

			if (data && data.length > 0) {
				return res.status(200).send({
					message: "Content already exists",
				});
			}

			await Info.updateOne(
				{
					user: req.user.id,
				},
				{
					$push: { years: req.body.newYear },
				}
			);
		}

		return res.status(201).send({
			message: "Successfully added",
		});
	} catch (err) {
		// console.log(err);
		return res.status(500).send({
			message: "Unexpected Error occured while creating the year card.",
		});
	}
}

async function deleteYear(req, res) {
	try {
		const data = await Info.find({
			user: req.user.id,
			years: {
				$elemMatch: {
					$eq: req.query.title,
				},
			},
		});
		if (data) {
			await Info.updateOne(
				{
					user: req.user.id,
				},
				{
					$pull: {
						years: {
							$eq: req.query.title,
						},
						envelopes: {
							year: req.query.title,
						},
					},
				}
			);
			await Transaction.deleteMany({
				user: req.user.id,
				year: req.query.title,
			});
		}
		return res.status(200).send({
			message: "successfully deleted",
		});
	} catch (err) {
		return res.status(500).send({
			message: "Unexpected Error occured while deleting the year card.",
		});
	}
}

module.exports = { getAllYears, addYear, deleteYear };
