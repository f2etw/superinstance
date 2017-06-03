import http from 'http';
import https from 'https';
import methods from 'methods';
import superagent from 'superagent';

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

  methods.forEach((method) => {
    obj[method] = (path) => {
      const req = superagent[method](`${url}${path}`);
      if (listen) req._server = listen; // eslint-disable-line

      Object.keys(configs).forEach((key) => {
        if (Array.isArray(configs[key])) {
          req[key](...configs[key]);
        } else req[key](configs[key]);
      });

      return req;
    };
  });

  obj.del = obj.delete;

  return obj;
}
