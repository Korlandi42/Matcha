let express = require('express')
let router = express.Router()
let pool = require('../db_connection')
let {addTags, delTags} = require('../controllers/tags')
const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})





router.post('/add/:id',checkIfAuthenticated, async (req, res) => {
    const tags = req.body;
    const id_user = req.params.id;
    try {
        const idexist = await pool.query('select * from usertags where id_user =?', [id_user])
        if (idexist && idexist.length) {
            const delError = await delTags(id_user);
            if (delError !== null && delError !== undefined  ) {
                console.log(delError)
              return res.status(400).send({ error: "delete tags failed" });
            }
        }
    } catch(err) {
        return res.status(400).send({ error: "Insert into usertags 2 failed" }); 
    }
    const tagError = await addTags(tags, id_user);
    if (tagError !== null && tagError !== undefined  ) {
        console.log(tagError)
      return res.status(400).send({ error: "Insert into usertags failed" });
    }
    else
        return res.status(200).send({ success: 'tags added successfully' })
})

router.get('/', checkIfAuthenticated,async (req, res) => {

    try {
        let rows = await pool.query('Select tagname from tags')
        if (rows && rows.length > 0)
            res.status(200).send(rows)
        else
            res.status(400).send({ error: 'no tags in db' });
    } catch(err) {
          res.status(400).send({ error: 'select tagname failed' });
    }
})

router.get('/:id',checkIfAuthenticated, async (req, res) => {

    const id_user = req.params.id;
    try {
        let rows = await pool.query('Select tagname from tags INNER JOIN usertags ON tags.id = usertags.id_tag where usertags.id_user =?', [id_user])
        if (rows && rows.length > 0)
            res.status(200).send(rows)
        else
            res.status(400).send({ error: 'no tags for this user' });
    } catch(err) {
          res.status(400).send({ error: 'innerjoin select failed' });
    }
})

module.exports = router