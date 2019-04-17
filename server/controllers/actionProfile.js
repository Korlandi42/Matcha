let pool = require('../db_connection')
const uuidv4 = require('uuid/v4');


const InsertLike = async (id_visitor, id_visited) => {
  try {
    const result = await pool.query('INSERT INTO `interests`(`id_visitor`, `id_visited`, `like`) VALUES (?,?,?)', [id_visitor, id_visited, true])
    if (result)
      return await GetScore(id_visited, 1);
  } catch (err) {
    return err;
  }
};

const UpdateLike = async (id_visitor, id_visited) => {
  try {
    const result = await pool.query('UPDATE `interests` set `like`=? where `id_visitor`=? and `id_visited`=?', [true, id_visitor, id_visited])
    if (result)
      return await GetScore(id_visited, 1)
  } catch (err) {
    return err;
  }
};

const CheckMatch = async (id_visitor, id_visited) => {
  try {
    return await pool.query('SELECT * FROM `interests` where (`id_visitor` =? and `id_visited` =? and `like` =?)', [id_visited, id_visitor, true])
  } catch (err) {
    return err;
  }
};

const AddMatch = async (data) => {
  try {
    const rand = uuidv4()
    const result = await pool.query('INSERT INTO `match`(`id_user1`, `id_user2`, `id_chatroom`) VALUES (?,?,?)', [data.id_visitor, data.id_visited, rand])
    if (result) {
      data.match = 1;
      return data;
    }
  } catch (err) {
    data.error = err;
    return data;
  }
};

const GetScore = async (id_visited, value) => {
  try {
    const result = await pool.query('select `score` from `users` where `id`=?', [id_visited])
    if (result && result.length) {
      let score = result[0].score;
      switch(value) {
        case 1: {
            if (score < 997) {
                score = score + 3;
                return await UpdateScore(id_visited, score);
              }
        }
        case 2: {
            if (score < 1000) {
                score = score + 1;
                return await UpdateScore(id_visited, score);
              }
        }
        case 3: {
            if (score > 2) {
                score = score - 3;
                return await UpdateScore(id_visited, score);
              }
        }
      }
    }
  } catch (err) {
    return err;
  }
};

const UpdateScore = async (id_visited, newscore) => {
  try {
    await pool.query('UPDATE `users` set `score`=? where `id`=?', [newscore, id_visited])
} catch (err) {
    return err;
  }
};

const addLike = async (data) => {
  try {
    const exist = await pool.query('select * from interests where id_visitor =? and id_visited=?', [data.id_visitor, data.id_visited])
    if (!exist || !exist.length) {
      const res = await InsertLike(data.id_visitor, data.id_visited);
      if (res !== null && res !== undefined) {
        data.error = res;
        return data;
      }
    } else {
      const res = await UpdateLike(data.id_visitor, data.id_visited);
      if (res !== null && res !== undefined) {
        data.error = res;
        return data;
      }
    }
    const match = await CheckMatch(data.id_visitor, data.id_visited);
    if (match && match.length) {
      data = AddMatch(data);
      return data;
    }
  } catch (err) {
    console.log(err)
    data.error = err;
    return data;
  }
};

const addVisit = async (id_visitor, id_visited) => {
  try {
    const exist = await pool.query('select * from interests where id_visitor =? and id_visited=?', [id_visitor, id_visited])
    if (!exist || !exist.length) {
      const res = await InsertVisit(id_visitor, id_visited);
      if (res !== null && res !== undefined) return res;
    } else {
      if(exist[0].visit == 0) {
      const res = await UpdateVisit(id_visitor, id_visited);
      if (res !== null && res !== undefined) return res;
      }
    }
  } catch (err) {
    console.log(err)
    return err;
  }
};

const InsertVisit = async (id_visitor, id_visited) => {
  try {
    const result = await pool.query('INSERT INTO `interests`(`id_visitor`, `id_visited`, `visit`) VALUES (?,?,?)', [id_visitor, id_visited, true])
    if (result)
      return await GetScore(id_visited, 2);
  } catch(err) {
    return err;
  }
};

const UpdateVisit = async (id_visitor, id_visited) => {
  try {
    const result = await pool.query('UPDATE `interests` set `visit`=? where `id_visitor`=? and `id_visited`=?', [true, id_visitor, id_visited])
    if (result)
      return await GetScore(id_visited, 2)
  } catch (err) {
    return err;
  }
};

const GetMatch = async (id_visitor, id_visited) => {
  try {
    return await pool.query('SELECT * FROM `match` WHERE (`id_user1` =? AND `id_user2` =?) OR (`id_user2` =? AND `id_user1` =?)', [id_visitor, id_visited, id_visitor, id_visited])
  } catch (err) {
    return err;
  }
};

const DeleteMatch = async (data) => {
  try {
    const del = await pool.query('DELETE FROM `match` WHERE (`id_user1`=? AND `id_user2`=?) OR (`id_user2`=? AND `id_user1`=?) ', [data.id_visitor, data.id_visited, data.id_visitor, data.id_visited])
    if (del) {
      data.unmatch = 1;
      return data;
    }
  } catch(err) {
    data.error = err;
    return data;
  }
};

const unLike = async (data) => {
  try {
    const result = await pool.query('UPDATE `interests` set `like`=? where `id_visitor`=? and `id_visited`=?', [false, data.id_visitor, data.id_visited])
    if (result) {
      const exist = await GetMatch(data.id_visitor, data.id_visited);
      if (exist && exist.length) {
          data = await DeleteMatch(data);
          if (data.error) return data;
      }
      const update = await GetScore(data.id_visited, 3);
      if (update != null && update !== undefined) data.error = update;
      return data;
    }
  } catch (err) {
    data.error = err;
    return data;
  }
};

const Block = async (data) => {
  try {
    const result = await pool.query('UPDATE `interests` set `block`=? where `id_visitor`=? and `id_visited`=?', [true, data.id_visitor, data.id_visited])
    if (result) {
      data = await unLike(data);
      data.block = 1;
      return data;
    }
  } catch (err) {
    data.error = err;
    return data;
  }
};

const IsOnline = async (id) => {
  try {
    await pool.query('UPDATE `users` set `isOnline`=? where `id`=? ', [true, id])
  } catch(err) {
    return err;
  }
}

const IsOffline = async (id) => {
  try {
    await pool.query('UPDATE `users` set `isOnline`=? where `id`=? ', [false, id])
  } catch(err) {
    return err;
  }
}


module.exports = {addLike, addVisit, unLike, Block, IsOnline, IsOffline}
