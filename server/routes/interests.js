let express = require('express')
let router = express.Router()
let pool = require('../db_connection')
let {Block} = require('../controllers/actionProfile')
let jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})

router.get('/like/:user_id', checkIfAuthenticated, async (req, res) => {

  let params = req.params

  
  try {
    let rows = await pool.query('Select `id_visited` from `interests` where `id_visitor`=? and `like`=?', [params.user_id, true])
    res.status(200).send(rows)
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Error server getting all likes for a user' });
  }
})

router.get('/likedyou/:user_id', checkIfAuthenticated, async (req, res) => {

  let params = req.params

  
  try {
    let rows = await pool.query('Select `id_visitor` from `interests` where `id_visited`=? and `like`=?', [params.user_id, true])
    res.status(200).send(rows)
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Error server getting all people who likes me for a user' });
  }
})

router.get('/visitedyou/:user_id',checkIfAuthenticated,  async (req, res) => {

  let params = req.params

  
  try {
    let rows = await pool.query('Select `id_visitor` from `interests` where `id_visited`=? and `visit`=?', [params.user_id, true])
    res.status(200).send(rows)
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Error server getting all people who visited me for a user' });
  }
})

router.get('/youblocked/:user_id', checkIfAuthenticated, async (req, res) => {

  let params = req.params

  
  try {
    let rows = await pool.query('Select `id_visited` from `interests` where `id_visitor`=? and `block`=?', [params.user_id, true])
    res.status(200).send(rows)
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Error server getting all people who visited me for a user' });
  }
})


const IncrementFake = async (user_id) => {
  try {
    await pool.query('UPDATE `users` set `isFake`=`isFake`+ ? where `id`=?', [1, user_id])
  } catch(err) {
    return err;
  }
};

router.post('/fake', async (req, res) => {

  let body = req.body
  let increment;

  try {
    const result = await pool.query('UPDATE `interests` set `fake`=? where `id_visitor`=? and `id_visited`=?', [true, body.user_id, body.fake_user_id])
    if (result) {
      if(result.changedRows == 1) {
        increment = await IncrementFake(body.fake_user_id);
      }
      if (increment !== null && increment !== undefined) return res.status(400).send({ error: 'Increment Fake failed' });
      res.status(200).send({ success: 'report fake done' })
    }
    else
      res.status(400).send({ error: 'update fake failed' });

  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'report fake failed' });
  }
})

router.post('/block', async (req, res) => {

  const result = await Block(req.body);
  if(result.err)
    return res.status(400).send({ error: 'block failed' });
  return res.status(200).send({ success: 'block done' })
})

// router.get('/like/user_id/:liked_user_id', checkIfAuthenticated, async (req, res) => {
//   try {
//     let rows = await pool.query('select * from profile where id_user = ?', [req.params.id])
//     if (rows.length > 0)
//      res.status(200).send(rows)
//      else {
//       res.status(400).send({ error: 'no profile' }); 
//       return; 
//      }
//   } catch (err) {
//     console.log(err);
//     res.status(400).send({ error: 'request failed' });  
//   }
// })

// router.patch('/unlike', async (req, res) => {

//   let data = req.body

//     await pool.query('Update profile set picture1 =?, nb_pic =? where id_user=?', [data.filename, 1, data.id_user])
  
// })


module.exports = router
