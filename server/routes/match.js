let express = require('express')
let router = express.Router()
let pool = require('../db_connection')
let jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})

router.get('/:id_user', checkIfAuthenticated, async (req, res) => {

  try {

    let result = []
    let id_user = req.params.id_user
    let rows = await pool.query('SELECT * FROM `match` WHERE (`id_user1` =?) OR (`id_user2` =?)', [id_user, id_user])
    if (rows.length > 0) {
      result = rows.map((m) => {
        if (id_user == m.id_user1) {
          m.id_lover = m.id_user2
        } else {
          m.id_lover = m.id_user1
        }
        return m
      })
      res.status(200).send(result)
    }
    else {
      res.status(200).send(rows)
    }
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'Error server on getting match' });  
  }
})

module.exports = router
