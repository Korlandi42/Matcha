let express = require('express')
let router = express.Router()
let bcrypt = require('bcrypt')
let pool = require('../db_connection')
let jwt = require('jsonwebtoken')
var geoip = require('geoip-lite');

router.post('/login', async (req, res) => {
	const user = req.body.user
	let isgeoloc;
	if (!user.username || !user.password) return res.status(400).send({ error: 'bad_request' });
	try {
		let rows = await pool.query('select * from users where username=?', [user.username])
		if (rows.length > 0) {
			if (rows[0].isVerified == 0)
				return res.status(401).send({ auth: false, token: null, error: 'Your account has not been confirmed yet.' })
			bcrypt.compare(req.body.user.password, rows[0].password, async (err, response) => {
				if (err) {
					res.status(401).send({ auth: false, token: null, error: "An error occured while trying to log you in, please try again." })
					console.log(err);
				}
				if (response === false) {
					res.status(401).send({ auth: false, token: null, error: 'Please check your password.' })
				} else {
					const secret = 'supersecret' // TODO A METTRE DANS LES VARIABLES D'ENVIRONNEMENT
					const token = jwt.sign({id: rows[0].id }, secret, { expiresIn: 8640000000 });
					const latitude = req.body.latitude
					const longitude = req.body.longitude
					isgeoloc = (longitude != 0 && latitude != 0) ? await addGeolocation(rows[0].id, latitude, longitude) : await manualGeolocation(rows[0].id);
					if (isgeoloc !== null && isgeoloc !== undefined)
						return res.status(401).send({auth: false, token: null, error: 'geoloc failed' });
					res.status(200).send({auth: true, token: token, profile: rows[0].profile, id: rows[0].id, expiresIn: 8640000000 });
				}
			})
		} else
			res.status(401).send({ auth: false, token: null, error: 'Please check your password.' })
	} catch (err) {
		console.log(err)
	}
})


const addGeolocation = async (id_user, latitude, longitude) => {
	try {
		let rows = await pool.query('select * from geolocation where id_user = ?', [id_user])
		if (rows.length > 0) {
			await pool.query('update geolocation set latitude =?, longitude =? where id_user=?', [latitude, longitude, id_user])
		} else {
			await pool.query('insert into geolocation(id_user, latitude, longitude) values(?,?,?)', [id_user, latitude, longitude])
		}
	} catch (err) {
		console.log(err);
		return err;
	}
}

const manualGeolocation = async (id_user) => {
	var geo = geoip.lookup('62.210.33.119');
	try {
		let rows = await pool.query('select * from geolocation where id_user = ?', [id_user])
		if (rows.length > 0) {
			await pool.query('update geolocation set latitude =?, longitude =? where id_user=?', [geo.ll[0], geo.ll[1], id_user])
		} else {
			await pool.query('insert into geolocation(id_user, latitude, longitude) values(?,?,?)', [id_user, geo.ll[0], geo.ll[1], ])
		}
	} catch (err) {
		console.log(err);
		return err;
	}
}


module.exports = router
