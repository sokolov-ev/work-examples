const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

const app = require('../../app');
const Account = require('../../models/account/Account');
const Notification = require('../../models/account/Notification');

chai.use(chaiHttp);

let user = null;

before(async () => {
    user = await new Account({
        email: 'test@mail.com',
        name: 'test_name',
        age: 54,
    }).save();
});

describe('Notifications API', () => {

    describe('POST /notifications', () => {
        it('Should add notification to database', async() => {
            const data = {
                accountId: user._id,
                name: 'test',
                color: 'red',
            };

            const res = await chai.request(app).post('/notifications').send(data);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('message');

            const account = await Account.findById(user._id).populate('notifications');
            expect(account.notifications).to.be.an('array').to.have.lengthOf(1);
        });

        it('Should return an error informing that accountId is missing', async() => {
            const data = { };

            const res = await chai.request(app).post('/notifications').send(data);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('err');
        });
    });

    describe('GET /notifications/:accountId', () => {

        it('Should return the data about notification', async() => {
            const res = await chai.request(app).get(`/notifications/${ user._id }`);

            expect(res).to.have.status(200);
            expect(res.body).to.have.property('data');
            expect(res.body.data).to.be.an('array');
            expect(res.body.data[0]).to.have.property('name', 'test');
        });

        it('Should return error no such router', async() => {
            const res = await chai.request(app).get('/notifications/');

            expect(res).to.have.status(404);
        });

    });

});

after(async () => {
    await Notification.remove();
    await Account.remove();
});
