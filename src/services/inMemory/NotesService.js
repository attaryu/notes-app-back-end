const { nanoid } = require('nanoid');

/**
 * A service for managing notes in memory. This class provides methods to add, 
 * retrieve, edit, and delete notes.
 */
class NotesService {
  constructor() {
    this._notes = [];
  }

  /**
   * Adds a new note to the in-memory store.
   * 
   * @param {Object} note - The note to add.
   * @param {string} note.title - The title of the note.
   * @param {string} note.body - The body of the note.
   * @param {Array} note.tags - The tags associated with the note.
   * 
   * @throws {Error} If the note fails to add.
   * @returns {string} The ID of the newly added note.
   */
  addNote({ title, body, tags }) {
    const now = new Date().toISOString();
    const id = nanoid(16);

    this._notes.push({
      id,
      title,
      body,
      tags,
      createdAt: now,
      updatedAt: now,
    });

    const isSuccess = this._notes.find((note) => note.id === id);

    if (!isSuccess) {
      throw new Error('Note failed to add');
    }

    return id;
  }

  /**
   * gets all notes from the in-memory store.
   * 
   * @returns {Array} An array of all notes in the in-memory store.
   */
  getNotes() {
    return this._notes;
  }

  /**
   * Retrieves a note by its ID from the in-memory store.
   * 
   * @param {string} id - The ID of the note to retrieve.
   * 
   * @throws {Error} If the note with the specified ID is not found.
   * @return {Object} The note with the specified ID.
   */
  getNoteById(id) {
    const note = this._notes.find((n) => n.id === id);

    if (!note) {
      throw new Error('Catatan tidak ditemukan');
    }

    return note;
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
  editNoteById(id, { title, body, tags }) {
    const existingNoteIndex = this._notes.findIndex((note) => note.id === id);

    if (existingNoteIndex === -1) {
      throw new Error('Note edit failed, id not found');
    }

    this._notes[existingNoteIndex] = {
      ...this._notes[existingNoteIndex],
      title,
      body,
      tags,
      updatedAt: new Date().toISOString(),
    };

    return this._notes[existingNoteIndex].id;
  }

  /**
   * Deletes a note by its ID from the in-memory store.
   * 
   * @param {string} id - The ID of the note to delete.
   * 
   * @throws {Error} If the note with the specified ID is not found.
   * @return {void}
   */
  deleteNoteById(id) {
    const existingNoteIndex = this._notes.findIndex((note) => note.id === id);

    if (existingNoteIndex === -1) {
      throw new Error('Note delete found, id not found');
    }

    this._notes.splice(existingNoteIndex, 1);
  }
}

module.exports = NotesService;
