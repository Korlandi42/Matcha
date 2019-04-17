let pool = require('../db_connection')

const InsertNotification = async (id_sender, id_receiver, type, seen) => {
	let blocked = await pool.query('Select `id_visited` from `interests` where `id_visitor`=? and `block`=?', [id_receiver, true]);
	block = blocked.map((obj) => (obj.id_visited));
	if (block.includes(id_sender))
	{
		return "blocked";
	}
  try {
    const result = await pool.query('INSERT INTO `notifications`(`id_sender`, `id_receiver`, `type`, `seen`) VALUES (?,?,?,?)', [id_sender, id_receiver, type, 0])
  } catch (err) {
    return err;
  }
};

module.exports = {InsertNotification}
