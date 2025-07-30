const { nanoid } = require('nanoid');
const { Pool } = require('pg');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

const { mapDBToModel } = require('../../utils');

class NoteService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  /**
   * Adds a new note to the postgres db.
   * 
   * @param {Object} note - The note to add.
   * @param {string} note.title - The title of the note.
   * @param {string} note.body - The body of the note.
   * @param {Array} note.tags - The tags associated with the note.
   * 
   * @throws {Error} If the note fails to add.
   * @returns {string} The ID of the newly added note.
   */
  async addNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    }

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    await this._cacheService.delete(`notes:${owner}`);
    return result.rows[0].id;
  }

  /**
   * gets all notes from the postgres db.
   * 
   * @returns {Array} An array of all notes in the postgres db.
   */
  async getNotes(owner) {
    const key = `notes:${owner}`;

    try {
      const result = await this._cacheService.get(key);
      return JSON.parse(result);
    } catch {
      const query = {
        text: 'SELECT notes.* FROM notes LEFT JOIN collaborations ON collaborations.note_id = notes.id WHERE notes.owner = $1 OR collaborations.user_id = $1 GROUP BY notes.id',
        values: [owner],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDBToModel);

      this._cacheService.set(key, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  /**
   * Retrieves a note by its ID from the postgres db.
   * 
   * @param {string} id - The ID of the note to retrieve.
   * 
   * @throws {Error} If the note with the specified ID is not found.
   * @return {Object} The note with the specified ID.
   */
  async getNoteById(id) {
    const query = {
      text: 'SELECT notes.*, users.username FROM notes LEFT JOIN users ON notes.owner = users.id WHERE notes.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  /**
   * Edits a note by its ID in the in-memory store.
   * 
   * @param {string} id - The ID of the note to edit.
   * @param {Object} note - The updated note data.
   * @param {string} note.title - The new title of the note.
   * @param {string} note.body - The new body of the note.
   * @param {Array} note.tags - The new tags associated with the note.
   * 
   * @throws {Error} If the note with the specified ID is not found.
   * @return {string} The ID of the edited note.
   */
  async editNoteById(id, { title, body, tags,  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id, owner',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const { owner, ...updatedNote } = result.rows.map(mapDBToModel)[0];
    await this._cacheService.delete(`notes:${owner}`);

    return updatedNote.id;
  }

  /**
   * Deletes a note by its ID from the in-memory store.
   * 
   * @param {string} id - The ID of the note to delete.
   * 
   * @throws {Error} If the note with the specified ID is not found.
   * @return {void}
   */
  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id, owner',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`notes:${owner}`);
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = NoteService;
