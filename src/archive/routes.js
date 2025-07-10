const api = require('./handler');

const routes = [
  {
    method: 'POST',
    path: '/notes',
    handler: api.addNoteHandler,
  },
  {
    method: 'PUT',
    path: '/notes/{id}',
    handler: api.editNoteByIdHandler,
  },
  {
    method: 'GET',
    path: '/notes',
    handler: api.getAllNotesHandler,
  },
  {
    method: 'GET',
    path: '/notes/{id}',
    handler: api.getNoteByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/notes/{id}',
    handler: api.deleteNoteByIdHandler,
  },
];

module.exports = routes;
