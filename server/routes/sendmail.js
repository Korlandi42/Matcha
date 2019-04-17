var express = require('express')
var nodeMailer = require('nodemailer')
var router = express.Router()
let bcrypt = require('bcrypt')
let pool = require('../db_connection')
let jwt = require('jsonwebtoken')

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


router.post('/resetpassword', async (req, res, next) => {
  let email = req.body.email

  const unEncodedToken = await hashPassword(email)
  const hashtoken = encodeURIComponent(unEncodedToken)

  try {
    let result = await pool.query('select id from users where email=?', [email])
    if (!result || !result.length)
      return res.status(400).send({ error: 'mail doesn\'t exist' });
  } catch(err) {
    console.log(err)
    return res.status(400).send({ error: 'token reset failed' });
  }

  try {
    await pool.query('update users set token_resetpassword=? where email=?', [unEncodedToken, email])
  } catch(err) {
    console.log(err)
    return res.status(400).send({ error: 'token reset failed' });
  }

  let transporter = nodeMailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    auth: {
        user: 'apikey',
        pass: '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'
    }
  })

  let mailOptions = {
    from: '"Matcha" <noreply@matcha.com>', // sender address
    to: email, // list of receivers
    secureConnection: false,
    subject: 'reset your password', // Subject line
    html:'Hello ,<br />You recently requested to reset your password. Just click the button below to set a new password:<br />' +
    '<a href=http://localhost:4200/reset-password?token='+ hashtoken +'>Reset your password</a><br />If you didn\'t request a password reset, you can ignore this email.<br />' 
  }

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
      return res.status(400).send({ error: 'send mail failed' });
    }
    // console.log('Message %s sent: %s', info.messageId, info.response)
    return res.status(200).send({ success: 'mail bien envoyé' })
  })
})

router.post('/confirmaccount/:id', async (req, res, next) => {
  let email = req.body.email
  let id_user = req.params.id

  const secret = 'supersecret'
  const token = jwt.sign({ id: id_user }, secret, {
    expiresIn: 86400
  })


  let transporter = nodeMailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    auth: {
        user: 'apikey',
        pass: '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'
    }
  })

  let mailOptions = {
    from: '"Matcha" <noreply@matcha.com>', // sender address
    to: email, // list of receivers
    secureConnection: false,
    subject: 'confirm your account', // Subject line
    html:'Hello ,<br />To confirm your account on Matcha please click the button below: <br />' +
    '<a href=http://localhost:3000/users/confirmaccount/'+ token +'>Confirm your account</a><br />' 
  }

  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error)
      return res.status(400).send({ error: 'send mail failed' });
    }
    // console.log('Message %s sent: %s', info.messageId, info.response)
    return res.status(200).send({ success: 'mail bien envoyé' })
  })
})


module.exports = router
