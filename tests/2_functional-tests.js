'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server.js');

chai.use(chaiHttp);

describe('Functional Tests', function () {
  this.timeout(5000);

  it('Viewing one stock: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  it('Viewing one stock and liking it: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        assert.isAtLeast(res.body.stockData.likes, 1);
        done();
      });
  });

  it('Viewing the same stock and liking it again: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isObject(res.body.stockData);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);
        done();
      });
  });

  it('Viewing two stocks: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isNumber(res.body.stockData[0].price);
        assert.isNumber(res.body.stockData[1].price);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });

  it('Viewing two stocks and liking them: GET request to /api/stock-prices/', function (done) {
    chai
      .request(server)
      .get('/api/stock-prices/')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isNumber(res.body.stockData[0].rel_likes);
        assert.isNumber(res.body.stockData[1].rel_likes);
        done();
      });
  });
});