let pool = require('../db_connection')

const InsertTag = async (tag, id_user) => {
  try {
    const result = await pool.query("Insert into tags(tagname) values(?)", [tag])
    if (result) {
      let id = result.insertId;
      return await InsertTagToUser(id, id_user);
    }
  } catch(err) {
    return err;
  }
};
  
const InsertTagToUser = async (id_tag, id_user) => {
  try {
    await pool.query("Insert into usertags(id_tag, id_user) values(?,?)", [id_tag, id_user])
  } catch(err) {
    return err;
  }
};
  
const CheckTag = async (id_tag, id_user) => {
  try {
    return pool.query("select * from usertags where id_tag = ? and id_user = ?", [id_tag, id_user])
  } catch(err) {
    return err;
  }
};

const addTags = async (tags, id_user) => {
  for (tag of tags) {
    try {
      const exist = await pool.query("select * from tags where tagname=? ", [tag]);
      if (!exist || !exist.length) {
        const res = await InsertTag(tag, id_user);
        if (res !== null && res !== undefined) return res;
      } else {
        const id_tag = exist[0].id;
        const check = await CheckTag(id_tag, id_user);
        if (!check || !check.length) {
          const res = await InsertTagToUser(id_tag, id_user);
          if (res !== null && res !== undefined) return res;
        }
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  }
};

const delTags = async (id_user) => {
  try {
    await pool.query('delete from usertags where id_user=?', [id_user]) 
  } catch(err) {
    return err;
  }
}

  module.exports = {addTags, delTags}