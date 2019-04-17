let express = require('express')
let router = express.Router()
let bcrypt = require('bcrypt')
let pool = require('../db_connection')
let jwt = require('jsonwebtoken')

const expressJwt = require('express-jwt')

const checkIfAuthenticated = expressJwt({
  secret: 'supersecret'
})

async function hashPassword (pass) {

  const password = pass
  const saltRounds = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      if (err) reject(err)
      resolve(hash)
    });
  })

  return hashedPassword
}

function checkRegisterBody(body) {
    if (!body.username || !body.email || !body.password || !body.surname || !body.name || !body.confirmPassword) {
      return false;
    }

    if (body.password !== body.confirmPassword) return false;

    if (body.username.length < 6 || body.surname.length < 2 || body.name.length < 2) {
      return false;
    }

    const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
    const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const isAlphaRegex = new RegExp(/^[a-zA-Z]+$/);
    const isAlphanumericRegex = new RegExp(/^[0-9a-zA-Z]+$/);
    if (!passwordRegex.test(body.password) || !emailRegex.test(body.email)
     || !isAlphaRegex.test(body.surname) || !isAlphaRegex.test(body.name)
     || !isAlphanumericRegex.test(body.username)) return false;
  return true;
}

router.post('/register', async (req, res) => {
  const user = req.body

  if (!checkRegisterBody(user)) {
    res.status(400).send({ error: 'bad_request' });
    return;
  }

  let hash = await hashPassword(user.password)

  try {
    const userExist = await pool.query('select username from users where username=? OR email=?', [user.username, user.email])
    if (userExist && userExist.length) {
      return res.status(400).send({ error: 'credential already exists' });
    }
  } catch(err) {
    return res.status(400).send({ error: 'request failed' });
  }

  try {
    let result = await pool.query('Insert into users(username, password, email, name, surname) values(?,?,?,?,?)', [user.username, hash, user.email, user.name, user.surname])
    if (result){
		let id = result.insertId;
		try {
			let result = await pool.query('Insert into profile(id_user) values(?)', [id])
			if (result) {
				console.log("Profile was created");
				res.status(200).send(result)
			}
		} catch (err) {
			console.log(err);
			res.status(400).send({
				error: 'request failed'
			});
		}
    }
  } catch(err) {
    console.log(err)
    return res.status(400).send({ error: 'request failed' });
  }
})

// router.get('/', checkIfAuthenticated, async (req, res) => {

//   try {
//     let rows = await pool.query('Select * from users')
//     if (rows)
//      res.status(200).send(rows)
//   } catch(err) {
//       console.log(err)
//       res.status(400).send({ error: 'request failed' });
//   }
// })

router.get('/:id', checkIfAuthenticated, async (req, res) => {
  try {
    let rows = await pool.query('select `id`, `username`, `name`, `surname`, `email`, `score`, `isOnline`, `lastCon`, `profile` from users where id=?', [req.params.id])
    if (rows)
      res.status(200).send(rows)
  } catch(err) {
      console.log(err)
  }

})

router.delete('/:id', checkIfAuthenticated, async (req, res) => {

  try {
    let count = await pool.query('delete from users where Id=?', [req.params.id])
    if (count)
     res.status(200).send(count)
  } catch(err) {
      console.log(err)
  }
})

router.patch('/profile/:id', checkIfAuthenticated,  async (req, res) => {

  try {
    let result = await pool.query('update users set profile=? where id=?', [true, req.params.id])
    if (result)
     res.status(200).send({ success: 'User updated' })
  } catch(err) {
      res.status(400).send({ error: 'Profile in user server error' });
  }
})

router.patch('/:id', checkIfAuthenticated,  async (req, res) => {

  let user = req.body

  if (!user.email || !user.surname || !user.name) {
    res.status(400).send({ error: 'bad_request3' });
    return;
  }

  if (user.surname.length < 2 || user.name.length < 2) {
    res.status(400).send({ error: 'bad_request4' });
    return;
  }

  const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const isAlphaRegex = new RegExp(/^[a-zA-Z]+$/);
  if (!emailRegex.test(user.email) || !isAlphaRegex.test(user.surname) || !isAlphaRegex.test(user.name)) {
    res.status(400).send({ error: 'bad_request5' });
    return;
  }

  try {
    const userExist = await pool.query('select email from users where email=? and id!=?', [user.email, user.id])

    if (userExist && userExist.length) {
      res.status(400).send({ error: 'email is already used for another account' });
      return;
    }
  } catch(err) {
      res.status(400).send({ error: 'bad_request6' });
	  return;
  }
  try {
    let result = await pool.query('update users set name=?, surname=?, email=? where id=?', [user.name, user.surname, user.email, user.id])
    if (result)
     res.status(200).send({ success: 'User updated' })
  } catch(err) {
      res.status(400).send({ error: 'bad_request7' });
  }
})

router.patch('/password/:id', checkIfAuthenticated, async (req, res) => {
  let user = req.body
  const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);

  if (!user.password || !user.oldpassword || !user.confpassword || !passwordRegex.test(user.password) || (user.password !== user.confpassword)) {
    res.status(400).send({ error: 'bad_request8' });
    return;
  }

  let row = await pool.query('select password from users where Id=?', [req.param.id])

  let oldpass = row[0].password
	console.log(user, )
  bcrypt.compare(user.oldpassword, oldpass, async (err, response) => {
    if (err || response === false) {
      return res.status(400).send({ error: 'wrong password' })
    } else {
      let newhash = await hashPassword(user.password)

      try {
        let result = await pool.query('update users set password=? where id=?', [newhash, user.id])
        if (result)
         res.status(200).send({ success: 'Password updated' })
      } catch(err) {
        console.log(err)
        return res.status(400).send({ error: 'bad request9' });
      }
    }
  });
})

router.get('/verifytoken/:token', async (req, res) => {
  token = req.params.token
  try {
    let rows = await pool.query('select id from users where token_resetpassword=?', [token])
    if (rows && rows.length) {
      res.status(200).send(rows)
    }
    else {
      return res.status(400).send({ error: 'token not valid failed' });
    }
  } catch(err) {
      console.log(err)
      return res.status(400).send({ error: 'request failed' });
  }
})

router.patch('/resetpassword/:id', async (req, res) => {
  let user = req.body
  const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/);

  if (!user.newpassword || /*!passwordRegex.test(user.newpassword) ||*/ (user.newpassword !== user.confpassword)) {
    res.status(400).send({ error: 'bad_request8' });
    return;
  }

  let newhash = await hashPassword(user.newpassword)

  try {
    await pool.query('update users set password=? where id=?', [newhash, user.id])
  } catch(err) {
    console.log(err)
    return res.status(400).send({ error: 'password reset failed' });
  }

  try {
    let result = await pool.query('update users set token_resetpassword=? where id=?', [null, user.id])
    if (result)
      return res.status(200).send({ success: 'Password reset' })
  } catch(err) {
    console.log(err)
    return res.status(400).send({ error: 'password reset failed' });
  }
})

router.get('/confirmaccount/:token', async (req, res) => {
  let token = req.params.token
  jwt.verify(token, 'supersecret', async (err, decoded) => {
    if (err || !decoded) {
      res.redirect(400, 'http://localhost:4200')
    }
    else {
      let id_user = decoded.id
      try {
        let rows = await pool.query('update users set isVerified=? where id=?', [1, id_user])
        if (rows) {
          res.redirect('http://localhost:4200/?confirmed=true')
        }
      } catch(err) {
          return res.redirect(400, 'http://localhost:4200/')
      }
    }
  });
})

router.get('/logout/:id', checkIfAuthenticated, async (req, res) => {
  const id_user = req.params.id
  try {
    let result = await pool.query('update users set lastCon=now(), isOnline=? where id=?', [false, id_user])
    if (result)
     res.status(200).send({ success: 'last con updated' })
  } catch(err) {
      res.status(400).send({ error: 'last con error' });
  }
})



module.exports = router
