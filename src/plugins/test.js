const nanoid = require('nanoid');

module.exports = {
  name: 'test',
  version: '1.0.0',
  description: 'A test plugin for demonstration purposes',
  register: async (server, options) => {
    const name = options.name || 'world';

    server.route([
      {
        method: 'GET',
        path: '/test',
        handler: () => {
          return `Hello, ${name}! Your unique ID is ${nanoid.nanoid()}`;
        }
      }
    ]);
  },
};
