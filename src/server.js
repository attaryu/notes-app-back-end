const path = require('node:path');
const Hapi = require('@hapi/hapi');
const vision = require('@hapi/vision');
const Handlebars = require('handlebars');

const notes = require('./api/notes');

const NotesService = require('./services/inMemory/NotesService');

const testPlugin = require('./plugins/test');
const templatePlugin = require('./plugins/template');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: true,
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
      plugin: notes,
      options: {
        service: new NotesService(),
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

  await server.start();

  console.info(`server start on ${server.info.uri}`);
};

init();
