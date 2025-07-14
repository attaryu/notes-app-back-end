const ClientError = require('../../exceptions/ClientError');

/**
 * NoteHandler class to manage note-related operations
 */
class NoteHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteByIdHandler = this.putNoteByIdHandler.bind(this);
    this.deleteNoteByIdHandler = this.deleteNoteByIdHandler.bind(this);
  }

  /**
   * Handler to get all notes
   * 
   * @returns {Object} Response object containing status and notes data
   */
  getNotesHandler() {
    return {
      status: 'success',
      data: {
        notes: this._service.getNotes(),
      },
    }
  }

  /**
   * Handler to add a new note
   * 
   * @param {Object} request - The request object containing payload
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and noteId
   */
  postNoteHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);

      const { title = 'Untitled', body, tags } = request.payload;
      const noteId = this._service.addNote({ title, body, tags });

      const response = h.response({
        status: 'success',
        message: 'Catatan berhasil ditambahkan',
        data: {
          noteId,
        },
      });
      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const reponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      reponse.code(500);
      console.error(error);

      return reponse;
    }
  }

  /**
   * Handler to get a note by its ID
   * 
   * @param {Object} request - The request object containing params
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and note data
   */
  getNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;

      return {
        status: 'success',
        data: {
          note: this._service.getNoteById(id),
        },
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const reponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      reponse.code(500);
      console.error(error);

      return reponse;
    }
  }

  /**
   * Handler to update a note by its ID
   * 
   * @param {Object} request - The request object containing params and payload
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and message
   */
  putNoteByIdHandler(request, h) {
    try {
      this._validator.validateNotePayload(request.payload);

      const { id } = request.params;

      this._service.editNoteById(id, request.payload);

      return {
        status: 'success',
        message: 'Catatan berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const reponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      reponse.code(500);
      console.error(error);

      return reponse;
    }
  }

  /**
   * Handler to delete a note by its ID
   * 
   * @param {Object} request - The request object containing params
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and message
   */
  deleteNoteByIdHandler(request, h) {
    try {
      const { id } = request.params;
      this._service.deleteNoteById(id);

      return {
        status: 'success',
        message: 'Catatan berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const reponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      reponse.code(500);
      console.error(error);

      return reponse;
    }
  }
}

module.exports = NoteHandler;
