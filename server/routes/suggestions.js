let express = require('express')
let router = express.Router()
let pool = require('../db_connection')
let haversine = require('haversine-distance')
let jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
	secret: 'supersecret'
})


router.get('/:id', checkIfAuthenticated, async (req, res) => {
	let data = req.params
	try {
		let profile = await getProfile(data.id)
		let geoloc = await getGeolocation(data.id)
		let tags = await getTags(data.id)
		if (profile && profile.length > 0) {
			let rows = await getOrientationSuggestions(profile[0].genre, profile[0].sexual_orientation, data.id)
			if (rows && rows.length > 0) {
				let suggestions = await Promise.all(rows.map((m) => { return getProfile(m.id) }))
				suggestions.filter((m) => { if (m) return (m)});
				suggestions = suggestions.map((m) => m[0])
				suggestions = suggestions.map((m) => {
					if (m) {
						m.img = m.img ? m.img : "/assets/images/profile-picture-placeholder.png";
						return (m);
					}
				})
				if (suggestions && suggestions.length > 0) {
					var geolocations = await Promise.all(rows.map((m) => { return getGeolocation(m.id) }))
					geolocations = geolocations.map((m) => m[0])
					geolocations = geolocations.filter((m) => { if (m) return (m); })
					if (geolocations && geolocations.length > 0) {
						geolocations.map((m) => {
							if (m) {
								let it = { lat: m.latitude, lon: m.longitude };
								let me = { lat: geoloc[0].latitude, lon: geoloc[0].longitude };
								m.distance = haversine(it, me);
								return (m);
							}
						})
					}
					suggestions.map((m) => {
						geolocations.map((p) => {
							if (p && m) {
								if (m.id_user == p.id_user) {
									m.distance = p.distance;
									m.suggScore = p.distance / 10
								}
							}
						})
					})

					let itTags = await Promise.all(rows.map((m) => { return getIdTags(m.id) }));
					let tagsName = await Promise.all(rows.map((m) => { return getTagsName(m.id) }));
					suggestions.map((m, i) => { suggestions[i].tags = []; suggestions[i].tags = tagsName[i] });
					matchTags = getMatchTags(tags, itTags);
					let tab = [];

					matchTags.map((tag, index) => {
						const keytab = Object.keys(tag)
						const valuestab = Object.values(tag)
						keytab.map((m, i) => { tab.push({ id_user: parseInt(keytab[i]), nb_match: valuestab[i] })})
					})

					suggestions.map((m) => {
						tab.map((p) => {
							if (m.id_user == p.id_user) {
								m.commun_tags = p.nb_match;
								m.suggScore -= p.nb_match * 10
							}
						})
					})

					let users = await Promise.all(rows.map((m) => { return getUserInfo(m.id) }));
					users = users.map((m) => m[0]);
					suggestions.map((m) => {
						users.map((p) => {
							if (m.id_user == p.id) {
								delete m.id
								m.name = p.name
								m.surname = p.surname
								m.username = p.username
								m.score = p.score
								m.lastCon = p.lastCon
								m.isOnline = p.isOnline
								m.suggScore -= p.score / 10
							}
						})
					})

					suggestions.map((m, i) => { if (m.id_user == data.id) { suggestions.splice(i, 1) } })
					suggestions.sort((a, b) => { return a.suggScore - b.suggScore; });
					res.status(200).send(suggestions)
				}
			}
		}
	} catch (err) {
		console.log(err);
		res.status(400).send({ error: 'request failed' });
	}
})


getMatchTags = (tags, itTags) => {
	reducedArr = itTags.reduce((prev, curr) => { return prev.concat(curr) });
	tmp = [];
	tags.map((m) => { reducedArr.map((p) => { if (m.id_tag === p.id_tag) tmp.push(p.id_user) }) });
	matchTags = tmp.reduce((acc, curr) => {
		acc[curr] ? acc[curr]++ : acc[curr] = 1;
		return acc;
	}, {});
	return [matchTags]
}

getTags = (id) => (pool.query('Select id_tag from tags INNER JOIN usertags ON tags.id = usertags.id_tag where usertags.id_user =?', [id]));
getBlocked = (id) => (pool.query('Select `id_visited` from `interests` where `id_visitor`=? and `block`=?', [id, true]));
getTagsName = (id) => (pool.query('Select tagname from tags INNER JOIN usertags ON tags.id = usertags.id_tag where usertags.id_user =?', [id]));
getIdTags = (id) => (pool.query('Select `id_user`, `id_tag` from tags INNER JOIN usertags ON tags.id = usertags.id_tag where usertags.id_user =?', [id]));
getUserInfo = (id) => (pool.query('select `id`, `username`, `name`, `surname`, `score`, `isOnline`, `lastCon` from users where (id=?)', [id]));
getProfile = (id) => (pool.query('select * from profile where (id_user=?)', [id]));
getGeolocation = (id) => (pool.query('select * from geolocation where (id_user=?)', [id]));
getOrientationSuggestions = async (genre, sexual_orientation, id) => {

	let rows, result = [], blocked, block;
	blocked = await getBlocked(id);
	switch (genre) {
		case "female":
		switch (sexual_orientation) {
			case "bisexual":
			rows = await pool.query('select * from profile where (sexual_orientation=? AND genre=?) OR (sexual_orientation=?) OR (sexual_orientation=?) AND NOT id_user=?', ['straight', 'male', 'lesbian', 'bisexual', id])
			break;
			case "straight":
			rows = await pool.query('select * from profile where (sexual_orientation=? OR sexual_orientation=?) AND genre=?', ['straight', 'bisexual', 'male'])
			break;
			case "lesbian":
			rows = await pool.query('select * from profile where (sexual_orientation=? OR sexual_orientation=?) AND genre=? AND NOT id_user=?', ['lesbian', 'bisexual', 'female', id])
			break;
		}
		break;
		case "male":
		switch (sexual_orientation) {
			case "bisexual":
			rows = await pool.query('select * from profile where (sexual_orientation=? AND genre=?) OR (sexual_orientation=?)  OR (sexual_orientation=?) AND NOT id_user=?', ['straight', 'female', 'gay', 'bisexual', id])
			break;
			case "straight":
			rows = await pool.query('select * from profile where (sexual_orientation=? OR sexual_orientation=?) AND genre=?', ['straight', 'bisexual', 'female'])
			break;
			case "gay":
			rows = await pool.query('select * from profile where (sexual_orientation=? OR sexual_orientation=?) AND genre=? AND NOT id_user=?', ['gay', 'bisexual', 'male', id])
			break;
		}
		break;
	}
	block = blocked.map((obj) => (obj.id_visited));
	for (i = 0; i < rows.length; i++) if (!block.includes(rows[i].id_user)) result.push(rows[i])
	return (result)
}



module.exports = router
