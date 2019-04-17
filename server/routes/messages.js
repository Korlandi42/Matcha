let express = require('express')
let router = express.Router()
const expressJwt = require('express-jwt')
let pool = require('../db_connection')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})


router.get('/history/:id_chatroom',checkIfAuthenticated, async (req, res) => {

    try {
      let rows = await pool.query('select * from messages where `id_chatroom`=?', [req.params.id_chatroom])
      res.status(200).send(rows)
    } catch (err) {
        console.log(err);  
        res.status(400).send({ error: 'request failed' });
    }
  })


module.exports = router
