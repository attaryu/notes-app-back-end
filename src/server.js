const Hapi = require('@hapi/hapi');

const notes = require('./api/notes');

const NotesService = require('./services/inMemory/NotesService');

const testPlugin = require('./plugins/test');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: true,
    },
  });

  await server.register([
    {
      plugin: notes,
      options: {
        service: new NotesService(),
      },
    },
    {
      plugin: testPlugin,
      options: {
        name: 'Hapi.js',
      },
    }
  ]);

  await server.start();

  console.info(`server start on ${server.info.uri}`);
};

init();
