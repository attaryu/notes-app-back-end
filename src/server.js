require('dotenv').config();

const path = require('node:path');
const Hapi = require('@hapi/hapi');
const vision = require('@hapi/vision');
const Jwt = require('@hapi/jwt');
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

  const usersService = new (require('./services/postgres/UsersService'))()

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
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy('notesapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

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
        service: usersService,
        validator: require('./validator/users'),
      },
    },
    {
      plugin: require('./api/authentications'),
      options: {
        authenticationsService: new (require('./services/postgres/AuthenticationsService'))(),
        usersService,
        tokenManager: require('./tokenize/TokenManager'),
        validator: require('./validator/authentications'),
      },
    },
  ]);

  await server.start();

  console.info(`server start on ${server.info.uri}`);
};

init();
