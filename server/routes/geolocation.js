let express = require('express')
let router = express.Router()
let pool = require('../db_connection')
var geoip = require('geoip-lite');
let jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})


router.get('/:id',checkIfAuthenticated, async (req, res) => {

  let id_user = req.params.id
  try {

    let rows = await pool.query('select * from geolocation where id_user = ?', [id_user])
    res.status(200).send(rows[0]);
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'get lat and long failed' });
  }
})

router.post('/manual', checkIfAuthenticated, async (req, res) => {

  let data = req.body

  var geo = geoip.lookup('62.210.33.119');
 
  try {
    let rows = await pool.query('select * from geolocation where id_user = ?', [data.id])
    if (rows.length > 0) {
      await pool.query('update geolocation set latitude =?, longitude =? where id_user=?', [geo.ll[0], geo.ll[1], data.id])
    } else {
      await pool.query('insert into geolocation(id_user, latitude, longitude) values(?,?,?)', [data.id, geo.ll[0], geo.ll[1],])
    }
    res.status(200).send({ success: 'geolocation'});
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'posting manual lat and long failed' });
  }
 
})

router.post('/', checkIfAuthenticated, async (req, res) => {

  let data = req.body

  try {

    let rows = await pool.query('select * from geolocation where id_user = ?', [data.id])
    if (rows.length > 0) {
      await pool.query('update geolocation set latitude =?, longitude =? where id_user=?', [data.latitude, data.longitude, data.id])
    } else {
      await pool.query('insert into geolocation(id_user, latitude, longitude) values(?,?,?)', [data.id, data.latitude, data.longitude])
    }
    res.status(200).send({ success: 'geolocation'});
  } catch (err) {
    console.log(err);
    res.status(400).send({ error: 'posting lat and long failed' });
  }
})

module.exports = router
