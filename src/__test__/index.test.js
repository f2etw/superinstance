import faker from 'faker';
import express from 'express';
import bodyParser from 'body-parser';
import superinstance from '../index';

const monitor = jest.fn();

const app = express();

app.use(bodyParser.json());
app.use((req, res) => {
  monitor(req);
  res.send({ status: 'ok' });
});

describe('channel', () => {
  it('get express', async () => {
    const path = `/${faker.lorem.word()}`;
    const apiKey = faker.random.uuid();
    const req = superinstance(app, { set: { 'API-Key': apiKey } });
    const reply = await req.get(path);
    expect(reply.body).toEqual({ status: 'ok' });
    expect(monitor).toHaveBeenCalledWith(
      expect.objectContaining({ url: path, method: 'GET', headers: expect.objectContaining({ 'api-key': apiKey }) }),
    );
  });

  it('post express', async () => {
    const path = `/${faker.lorem.word()}`;
    const req = superinstance(app, { type: 'json' });
    const reply = await req.post(path).send({ name: 'tj' }).send({ pet: 'tobi' });
    expect(reply.body).toEqual({ status: 'ok' });
    expect(monitor).toHaveBeenCalledWith(
      expect.objectContaining({
        url: path,
        method: 'POST',
        headers: expect.objectContaining({ 'content-type': 'application/json' }),
        body: { name: 'tj', pet: 'tobi' },
      }),
    );
  });

  it('get url', async () => {
    const path = '/hello';
    const req = superinstance('http://www.google.com', { set: ['X-API-Key', 'foobar'] });
    expect(req.get(path).url).toBe(`http://www.google.com${path}`);
    expect(req.get(path)).toMatchSnapshot();
  });
});
