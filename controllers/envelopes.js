const Info = require("../models/Info");

async function getAllEnvelopes(req, res) {
	// console.log("get envelopes request received");
	try {
		const data = await Info.find(
			{
				user: req.user.id,
				envelopes: {
					$elemMatch: {
						year: Number(req.params.year),
						month: req.params.month,
					},
				},
			},
			{
				"envelopes.envelopeName": 1,
			}
		).lean();

		if (!data || data.length === 0) {
			return res.send({
				envelopes: [],
			});
		}

		return res.send({ envelopes: data[0].envelopes });
	} catch (err) {
		// console.log(err);
		return res.status(500).send({
			message: "Unexpected Error occured while generating the response.",
		});
	}
}

async function addEnvelope(req, res) {
	// console.log("post envelopes request received");
	// console.log(req.body);

	try {
		const envelopeData = await Info.find({
			user: req.user.id,
			"envelopes.year": Number(req.params.year),
			"envelopes.month": req.params.month,
			"envelopes.envelopeName": req.body.newEnvelopeName,
		}).lean();

		/*
            Note: we connot explicitly set status code to 422, and expect react to display
            custom error message. That's why it's better to send the status code in object
            only when the req is valid, but req cannot be processed due to business logic. 
        */

		if (envelopeData.length > 0) {
			return res.send({
				status: 422,
				message: "This Envelope already exists.",
			});
		}

		const newEnvelopeData = {
			year: Number(req.params.year),
			month: req.params.month,
			envelopeName: req.body.newEnvelopeName,
			budget: [req.body.newBudget, req.body.newBudget],
		};

		await Info.updateOne(
			{
				user: req.user.id,
			},
			{
				$push: { envelopes: newEnvelopeData },
			}
		);

		return res.status(201).send({
			message: "Successfully added",
		});
	} catch (err) {
		// console.log(err);
		return res.status(500).send({
			message: "Unexpected Error occured while generating the response.",
		});
	}
}

async function deleteEnvelope(req, res) {
	/*
	
	If a DELETE method is successfully applied, there are several response status codes possible:

		1. A 202 (Accepted) status code if the action will likely succeed but has not yet been enacted.
		2. A 204 (No Content) status code if the action has been enacted and no further information is to be supplied.
		3. A 200 (OK) status code if the action has been enacted and the response message includes a representation describing the status.
	
	*/

	try {
		const data = await Info.find({
			user: req.user.id,
			envelopes: {
				$elemMatch: {
					year: Number(req.params.year),
					month: req.params.month,
					envelopeName: req.query.title,
				},
			},
		});

		if (data && data.length > 0) {
			await Info.updateOne(
				{
					user: req.user.id,
				},
				{
					$pull: {
						envelopes: {
							year: Number(req.params.year),
							month: req.params.month,
							envelopeName: req.query.title,
						},
					},
				}
			);
		}

		return res.status(200).send({
			message: "Envelope delete request executed",
		});
	} catch (err) {
		// console.log(err);
		return res.status(500).send({
			message: "Unexpected Error occured while generating the response.",
		});
	}
}

module.exports = { getAllEnvelopes, addEnvelope, deleteEnvelope };
