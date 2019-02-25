const chai = require('chai');
chai.use(require('chai-http'));
const expect = require('chai').expect;
const app = require('../../app');

const Notifications = require('../../models/account/Notifications');

describe('API testing for notifications', () => {
    before(async () => {
        await Notifications.remove();
    });

    describe('POST /notifications', () => {

        it('Should add notification to database', async() => {
            const data = {
                accountId: 54,
                name: 'test',
                color: 'red',
            };

            const res = await chai.request(app).post('/notifications').send(data);

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('message');

            const notification = await Notifications.findOne({ accountId: data.accountId });
            expect(notification).to.exist;
        });

        it('Should return an error that the notification for this account already exists', async() => {
            const data = {
                accountId: 54,
                name: 'test',
                color: 'red',
            };

            const res = await chai.request(app).post('/notifications').send(data);

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('err');
        });

        it('Should return an error informing that accountId is missing', async() => {
            const data = { };

            const res = await chai.request(app).post('/notifications').send(data);

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('err');
        });

    });

    describe('GET /notifications/:accountId', () => {

        it('Should return the data about notification', async() => {
            const res = await chai.request(app).get('/notifications/54');

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('data');
        });

        it('Should return error no such router', async() => {
            const res = await chai.request(app).get('/notifications/');

            expect(res).to.have.status(404);
        });

        it('Should return an error informing that the notification wasn\'t found', async() => {
            const res = await chai.request(app).get('/notifications/00002');

            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.have.property('err');
        });

    });

    after(async () => {
        await Notifications.remove();
    });
});
