let express = require('express')
let router = express.Router()
const expressJwt = require('express-jwt')
let pool = require('../db_connection')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})


router.get('/:id_user',checkIfAuthenticated, async (req, res) => {

    try {

        let rows = await pool.query('select * from notifications where `id_receiver`=?', [req.params.id_user])
        if (rows && rows.length > 0) {
            let users = await Promise.all(rows.map( (m) => {
                return getUser(m.id_sender)
            }))
            users = users.map( (m) => m[0])
            rows.map( (m) => {
                users.map( (p) => {
                    m.username = p.username
                })
            })

            res.status(200).send( rows)
        } else {
           res.status(200).send({ empty: true })
     }
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'requesting notifications failed' });
    }
})

router.get('/seen/:id_user',checkIfAuthenticated, async (req, res) => {

    try {

		await pool.query('update `notifications` set `seen`=? where `id_receiver`=?', [1, req.params.id_user])
		res.status(200).send({ success: true})
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'seen notifications failed' });
    }
})

getUser = (id) => {

    let rows = pool.query('select `id`, `username`, `name`, `surname`, `score`, `lastCon` from users where (id=?)', [id]);

    return rows
}

module.exports = router
