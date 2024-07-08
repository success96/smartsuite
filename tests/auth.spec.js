import chai from 'chai';
import chaiHttp  from 'chai-http';
import server from '../server';  // Adjust the path as necessary
const { expect } = chai;

chai.use(chaiHttp);

describe('User Registration and Authentication', () => {
  it('Should register user successfully with default organisation', (done) => {
    chai.request(server)
      .post('/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '1234567890',
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('status', 'success');
        expect(res.body.data).to.have.property('accessToken');
        expect(res.body.data.user).to.have.property('email', 'john.doe@example.com');
        done();
      });
  });

  it('Should log the user in successfully', (done) => {
    chai.request(server)
      .post('/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123',
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('status', 'success');
        expect(res.body.data).to.have.property('accessToken');
        expect(res.body.data.user).to.have.property('email', 'john.doe@example.com');
        done();
      });
  });

  it('Should fail if required fields are missing', (done) => {
    chai.request(server)
      .post('/auth/register')
      .send({
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'password123',
      })
      .end((err, res) => {
        expect(res).to.have.status(422);
        expect(res.body).to.have.property('errors');
        done();
      });
  });

  it('Should fail if there’s duplicate email or userID', (done) => {
    chai.request(server)
      .post('/auth/register')
      .send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        phone: '0987654321',
      })
      .end((err, res) => {
        expect(res).to.have.status(422);
        expect(res.body).to.have.property('errors');
        done();
      });
  });
});
