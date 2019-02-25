const Notifications = require('../../models/account/Notifications');

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

        let notification = await Notifications.findOne({ accountId });

        if (notification) {
            return res.json({ err: 'The notification for this account already exists' });
        }

        notification = new Notifications({ accountId, name, color });
        await notification.save();

        return res.json({ message: 'success' });
    } catch (err) {
        console.error(err);

        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

async function getNotification(req, res) {
    try {
        const { accountId } = req.params;

        if (!accountId) {
            return res.json({ err: 'Missing account id' });
        }

        const notification = await Notifications.findOne({ accountId });

        if (notification) {
            return res.json({ data: notification });
        }

        return res.json({ err: 'Notification not found' });
    } catch (err) {
        console.error(err);

        return res.status(500).json({ message: 'Internal Server Error' });
    }
};


