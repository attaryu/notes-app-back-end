require('dotenv').config();

const path = require('node:path');
const Hapi = require('@hapi/hapi');
const vision = require('@hapi/vision');
const Handlebars = require('handlebars');

const testPlugin = require('./plugins/test');
const templatePlugin = require('./plugins/template');

const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register(vision);

  server.views({
    engines: {
      hbs: Handlebars,
    },
    path: path.join(__dirname, 'views'),
  })

  // routing
  await server.register([
    {
      plugin: require('./api/notes'),
      options: {
        service: new (require('./services/postgres/NotesService'))(),
        validator: require('./validator/notes'),
      },
    },
    {
      plugin: require('./api/users'),
      options: {
        service: new (require('./services/postgres/UsersService'))(),
        validator: require('./validator/users'),
      },
    },
  ]);

  // plugin
  await server.register([
    {
      plugin: testPlugin,
      options: {
        name: 'Hapi.js',
      },
    },
    {
      plugin: templatePlugin,
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);

      return newResponse;
    }

    return h.continue;
  });

  await server.start();

  console.info(`server start on ${server.info.uri}`);
};

init();
