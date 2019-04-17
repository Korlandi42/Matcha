let pool = require('../db_connection')

const InsertMessage = async (id_sender, id_receiver, id_chatroom, content) => {

  try {
    const result = await pool.query('INSERT INTO `messages`(`id_sender`, `id_receiver`, `id_chatroom`, `content`) VALUES (?,?,?,?)', [id_sender, id_receiver, id_chatroom, content])
    if (result) {
    }
  } catch (err) {
    return err;
  }
};

module.exports = {InsertMessage}