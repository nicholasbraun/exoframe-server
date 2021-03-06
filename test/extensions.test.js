/* eslint-env jest */
// mock config for testing
jest.mock('../src/config', () => require('./__mocks__/config'));

// npm packages
const fs = require('fs');
const path = require('path');
const getPort = require('get-port');

// our packages
const authToken = require('./fixtures/authToken');
const {startServer} = require('../src');
const {extensionsFolder} = require('../src/config');

// container vars
let fastify;

// test template name
const testTemplate = 'exoframe-template-java';

// set timeout to 60s
jest.setTimeout(60000);

beforeAll(async () => {
  // start server
  const port = await getPort();
  fastify = await startServer(port);
  return fastify;
});

afterAll(() => fastify.close());

test('Should install new template', async done => {
  // options base
  const options = {
    method: 'POST',
    url: '/templates',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    payload: {
      templateName: testTemplate,
    },
  };

  const response = await fastify.inject(options);
  const result = JSON.parse(response.payload);

  // check answer
  expect(response.statusCode).toEqual(200);
  expect(result.success).toBeTruthy();
  expect(result.log.length).toBeGreaterThan(0);

  // check folder
  const files = fs.readdirSync(path.join(extensionsFolder, 'node_modules'));
  expect(files).toContain(testTemplate);

  done();
});

test('Should get list of installed templates', async done => {
  // options base
  const options = {
    method: 'GET',
    url: '/templates',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  const response = await fastify.inject(options);
  const result = JSON.parse(response.payload);

  // check response
  expect(response.statusCode).toEqual(200);
  expect(Object.keys(result)).toEqual([testTemplate]);

  done();
});

test('Should remove existing template', async done => {
  // options base
  const options = {
    method: 'DELETE',
    url: '/templates',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    payload: {
      templateName: testTemplate,
    },
  };

  const response = await fastify.inject(options);
  const result = JSON.parse(response.payload);

  // check response
  expect(response.statusCode).toEqual(200);
  expect(result.removed).toBeTruthy();
  expect(result.log.length).toBeGreaterThan(0);

  // check folder
  const files = fs.readdirSync(path.join(extensionsFolder, 'node_modules'));
  expect(files).not.toContain(testTemplate);

  done();
});
