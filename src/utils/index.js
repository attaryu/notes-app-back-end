const mapDBToModel = ({ created_at, updated_at, ...fields }) => ({
  ...fields,
  createdAt: created_at,
  updatedAt: updated_at,
})

module.exports = {
  mapDBToModel,
}
