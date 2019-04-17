let express = require('express')
let router = express.Router()
const expressJwt = require('express-jwt')
let pool = require('../db_connection')
const fs = require('fs')

const checkIfAuthenticated = expressJwt({
	secret: 'supersecret'
})

function checkProfile(body) {
	if (!body.age || !body.genre || !body.sexualOrientation || !body.biography) return false;
	if (body.age <= 0 || body.age > 150) return false;
	if (body.genre != "male" && body.genre != "female") return false;
	if (body.sexualOrientation != "bisexual" && body.sexualOrientation != "straight" && body.sexualOrientation != "gay" && body.sexualOrientation != "lesbian") return false;
	return true;
}

router.post('/', checkIfAuthenticated, async (req, res) => {

	let user = req.body
	console.log(user);
	if (!checkProfile(user)) {
		res.status(400).send({
			error: 'Invalid user'
		});
		return;
	}

	try {
		let result = await pool.query('Insert into profile(id_user, genre, sexual_orientation, biography, age) values(?,?,?,?,?)', [user.id, user.genre, user.sexualOrientation, user.biography, user.age])
		if (result) {
			console.log("Profile was created");
			res.status(200).send({
				success: 'Profile created'
			})
		}
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'request failed'
		});
	}
})

router.get('/', checkIfAuthenticated, async (req, res) => {

	try {
		let rows = await pool.query('select * from profile')
		res.status(200).send(rows)
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'request failed'
		});
	}
})

router.get('/orientation/:id', checkIfAuthenticated, async (req, res) => {

	try {
		let rows = await pool.query('SELECT `genre`, `sexual_orientation` FROM `profile` WHERE (id_user=?)', [req.params.id])
		res.status(200).send(rows)
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'getting orientation failed'
		});
	}
})

router.get('/id_user/:id', checkIfAuthenticated, async (req, res) => {
	try {
		let rows = await pool.query('select * from profile where id_user = ?', [req.params.id])
		res.status(200).send(rows)
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'request failed'
		});
	}
})

router.get('/id_user/:id/picture', checkIfAuthenticated, async (req, res) => {
	try {
		let rows = await pool.query('select * from photos where id_user = ?', [req.params.id])
		res.status(200).send(rows)
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'request get photo failed'
		});
	}
})

router.delete('/id_user/:id/picture/:id_photo', checkIfAuthenticated, async (req, res) => {
	try {
		let rows = await pool.query('delete from photos where id_user = ? and id=?', [req.params.id, req.params.id_photo])
		res.status(200).send(rows)
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'delete photo failed'
		});
	}
})

router.patch('/picture', checkIfAuthenticated, async (req, res) => {

	let data = req.body

	await fs.mkdir('assets/uploads/' + data.id_user, {
		recursive: true
	}, (err) => {
		if (err) throw err;
	});

	await fs.rename(data.path, 'assets/uploads/' + data.id_user + '/' + data.filename, (err) => {
		if (err) throw err;
	});
	try {
		let count = await pool.query('Select * from photos where id_user = ?', [data.id_user])

		if (count.length >= 5) {
			return res.status(400).send({
				error: 'Too many pictures '
			})
		}
		await pool.query('insert into photos (filename, id_user) values (?,?)', [data.filename, data.id_user])
		res.status(200).send({
			success: 'Profile updated'
		})

	} catch (err) {
		console.log(err);
		return res.status(400).send({
			error: 'upload pictures failed'
		});
	}
})

router.post('/profilepicture', checkIfAuthenticated, async (req, res) => {

	let data = req.body

	await fs.mkdir('assets/uploads/' + data.id_user, {
		recursive: true
	}, (err) => {
		if (err) throw err;
	});

	await fs.rename(data.path, 'assets/uploads/' + data.id_user + '/' + data.filename, (err) => {
		if (err) throw err;
	});
	try {
		const result = await pool.query('Update profile set picture1 =? where id_user=?', [data.filename, data.id_user])
		if (result)
			res.status(200).send({
				success: 'Profile updated'
			})
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'bad_request1'
		});
	}
})




router.patch('/id_user/:id', checkIfAuthenticated, async (req, res) => {

	let profile = req.body
	console.log(profile);
	if (!checkProfile(profile)) {
		return res.status(400).send({
			error: 'bad_request1'
		});
	}

	try {
		let result = await pool.query('Update profile set genre =?, sexual_orientation =?, biography =?, age =? where id_user=?', [profile.genre, profile.sexualOrientation, profile.biography, profile.age, profile.id])
		if (result) {
			console.log("Profile was updated : ");
			res.status(200).send({
				success: 'Profile updated'
			})

		}
	} catch (err) {
		console.log(err);
		res.status(400).send({
			error: 'bad_request2'
		});
		return;
	}
})

module.exports = router
