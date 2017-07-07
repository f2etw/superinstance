import http from 'http';
import https from 'https';
import methods from 'methods';
import superagent from 'superagent';

const Request = superagent.Request;

export default function (app, configs = {}) {
  let url = app;
  let listen;

  if (typeof app === 'function') {
    const server = http.createServer(app);
    const addr = server.address();

    if (!addr) listen = server.listen(0);

    url = `${server instanceof https.Server ? 'https' : 'http'}://127.0.0.1:${server.address().port}`;
  }

  const obj = {};

  obj.configs = [configs];

  obj.base = '';

  Object.keys(Request.prototype).forEach((method) => {
    if (/^[a-zA-Z]+$/.test(method)) {
      obj[method] = function Cache(...args) {
        const config = {};
        config[method] = args;

        return { ...this, configs: this.configs.concat(config) };
      };
    }
  });

  methods.forEach((method) => {
    obj[method] = function Method(path) {
      const req = superagent[method](`${url}${this.base}${path || ''}`);
      if (listen) req._server = listen; // eslint-disable-line

      this.configs.forEach(config => Object.keys(config).forEach((key) => {
        if (Array.isArray(config[key])) {
          req[key](...config[key]);
        } else req[key](config[key]);
      }));

      return req;
    };
  });

  obj.del = obj.delete;

  obj.path = function Path(path) {
    return { ...this, base: `${this.base}${path || ''}` };
  };

  return obj;
}
