const chai = require('chai');
chai.use(require('chai-http'));
const expect = require('chai').expect;
const app = require('../../app');

const Account = require('../../models/account/Account');

describe('API testing for account', () => {
	before(async () => {
		await Account.remove();
		const accountId = null;
	});

	describe('POST /account/create', () => {

		it('Should add account to database', async() => {
			const data = {
				email: 'test@gmail.com',
				name: 'Testo',
				age: 56
			};
			const res = await chai.request(app).post('/account/create').send(data);
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.have.property('message');

			const account = await Account.findOne({ email: data.email });
			expect(account).to.exist;

			accountId = account._id;
		});

		it('Should return an error an email already exists', async() => {
			const data = {
				email: 'test@gmail.com',
				name: 'Testo',
				age: 56
			};
			const res = await chai.request(app).post('/account/create').send(data);
			expect(res).to.have.status(200);
			expect(res).to.be.json;
			expect(res.body).to.have.property('err');
		});

	});

	describe('GET /account/create', () => {

		it('Should return an error get API wasn\'t found', async() => {
			const res = await chai.request(app).get('/account/create');
			expect(res).to.have.status(404);
		});

	});

	describe('PUT /account/create', () => {

		it('Should return an error put API wasn\'t found', async() => {
			const data = {
				id: accountId,
				email: 'test2@gmail.com',
			};
			const res = await chai.request(app).put('/account/create').send(data);
			expect(res).to.have.status(404);
		});

	});

	describe('DELETE /account/create', () => {

		it('Should return an error delete API wasn\'t found', async() => {
			const data = {
				id: accountId,
			};
			const res = await chai.request(app).delete('/account/create').send(data);
			expect(res).to.have.status(404);
		});

	});

	after(async () => {
		await Account.remove();
	});
});
