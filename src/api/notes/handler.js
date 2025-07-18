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
  async getNotesHandler() {
    return {
      status: 'success',
      data: {
        notes: await this._service.getNotes(),
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
  async postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { title = 'Untitled', body, tags } = request.payload;
    const noteId = await this._service.addNote({ title, body, tags });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });
    response.code(201);

    return response;
  }

  /**
   * Handler to get a note by its ID
   * 
   * @param {Object} request - The request object containing params
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and note data
   */
  async getNoteByIdHandler(request, h) {
    const { id } = request.params;

    return {
      status: 'success',
      data: {
        note: await this._service.getNoteById(id),
      },
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
  async putNoteByIdHandler(request, h) {
    this._validator.validateNotePayload(request.payload);

    const { id } = request.params;

    await this._service.editNoteById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  /**
   * Handler to delete a note by its ID
   * 
   * @param {Object} request - The request object containing params
   * @param {Object} h - The response toolkit
   * 
   * @return {Object} Response object containing status and message
   */
  async deleteNoteByIdHandler(request, h) {
    const { id } = request.params;
    await this._service.deleteNoteById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = NoteHandler;
