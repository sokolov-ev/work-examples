'use strict';

const Account = require('../../models/account/Account');
const Notification = require('../../models/account/Notification');

module.exports = {
    create,
    getNotification,
};

async function create(req, res) {
    try {
        const { accountId, name, color } = req.body;

        if (!accountId) {
            return res.json({ err: 'Missing account id' });
        }

        const account = await Account.findById(accountId);

        if (!account) {
            return res.json({ err: 'Account not found' });
        }

        const notification = new Notification({ name, color });
        await notification.save();

        account.notifications.push(notification);
        await account.save();

        return res.json({ message: 'success' });
    } catch (err) {
        console.error(err);

        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function getNotification(req, res) {
    try {
        const { accountId } = req.params;

        if (!accountId) {
            return res.json({ err: 'Missing account id' });
        }

        const account = await Account.findById(accountId).populate('notifications');

        if (account.notifications) {
            return res.json({ data: account.notifications });
        }

        return res.json({ err: 'Notifications not found' });
    } catch (err) {
        console.error(err);

        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
