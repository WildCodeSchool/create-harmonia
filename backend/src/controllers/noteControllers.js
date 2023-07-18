const models = require("../models");

const browse = (req, res) => {
  models.note
    .findAllNotes()
    .then(([rows]) => {
      res.send(rows);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const read = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models.note
    .find(id)
    .then(([rows]) => {
      if (rows[0]) {
        res.send(rows[0]);
      } else {
        res.status(404).send("Note not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

const readByCategories = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models.note
    .findNotesByCategories(id)
    .then(([rows]) => {
      if (rows[0]) {
        res.send(rows);
      } else {
        res.status(404).send("Notes not found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
    });
};

const add = (req, res) => {
  const newNote = req.body;

  models.note
    .insert(newNote)
    .then(([result]) => {
      res.location(`/notes/${result.insertId}`).sendStatus(201);
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const edit = (req, res) => {
  const note = req.body;

  note.id = parseInt(req.params.id, 10);

  models.note
    .update(note)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

const destroy = (req, res) => {
  const id = parseInt(req.params.id, 10);

  models.note
    .delete(id)
    .then(([result]) => {
      if (result.affectedRows === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(204);
      }
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500);
    });
};

module.exports = {
  browse,
  read,
  readByCategories,
  add,
  edit,
  destroy,
};
