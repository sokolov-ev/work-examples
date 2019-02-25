const Account = require('../../models/account/Account');

module.exports = async function(req, res) {
	try {
		const { email, name, age } = req.body;
		const account = new Account({ email, name, age });
		const findUser = await Account.findOne({ email });

		if (findUser) {
			return res.json({ err: 'email already exists' });
		}

		await account.save();
		return res.json({ message: 'success' });
	} catch (err) {
		console.error(err);

		return res.status(500).json({ message: 'Internal Server Error' });
	}
};