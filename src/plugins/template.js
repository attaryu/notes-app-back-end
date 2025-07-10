module.exports = {
  name: 'handlebar-template-test',
  version: '1.0.0',
  description: 'A template testing',
  register: async (server) => {
    server.route([
      {
        method: 'GET',
        path: '/template/{name?}',
        handler: (request, h) => {
          return h.view('greeting', {
            name: request.params.name || 'Guest',
          });
        },
      },
    ]);
  },
};
