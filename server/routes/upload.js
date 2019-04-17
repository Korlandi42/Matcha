const express		= require('express');
const Sharp			= require('sharp');
const router		= express.Router()
const multer		= require('multer');
const DIR			= 'public/uploads/';
const pool			= require('../db_connection')
const upload		= multer({dest: DIR}).single('file');
const expressJwt	= require('express-jwt')
const fs			= require("fs");
const Path			= require('path');

const checkIfAuthenticated = expressJwt({secret: 'supersecret'})
const PromiseResult = (suc, res, err) => ({success: suc, result: res, error: err});

/*******************************************************************************
*************************** Checking functions *********************************
*******************************************************************************/

/** Valid image extensions */
function imageIsValid(imageData) {
	let acceptedExtensions = ['jpg','jpeg','png', 'gif'];
	let imageExtension = imageData.originalname.split('.').pop();
	return (acceptedExtensions.indexOf(imageExtension) < 0) ? false : true;
}

/*******************************************************************************
************************ General upload functions ******************************
*******************************************************************************/


/** Creates a directory */
function createDirectory(dirPath) {
	return (new Promise((resolve, reject) => {
		fs.mkdir(dirPath, { recursive: true }, (err) => {
			if (err) return (reject(PromiseResult(false, {}, { message : 'Could not create the directory', error : err })));
			return (resolve(PromiseResult(true, {})));
		})
	}))
}

/** Checks if the file or directory exists */
function fileExists(dirPath) {
	return (new Promise((resolve, reject) => {
		fs.access(dirPath, fs.constants.F_OK, (err) => {
			if (err) return (reject(PromiseResult(false, {}, err)));
			return (resolve(PromiseResult(true, 'File exists')));
		})
	}))
}

/** Builds the upload path */
function buildPath(dirPath) {
	return (new Promise(async (resolve, reject) => {
		let folders = dirPath.split('/');
		let path = "";
		for (let i = 0; i < folders.length; i++) {
			if (!(folders[i].length)) continue;
			path += '/' + folders[i];
			let dir = await fileExists(path)
			.catch((err) => { console.log(err); });
			if (!dir) {
				await createDirectory(path)
				.catch((err) => { console.log('ERROR:('); return (reject(PromiseResult(false, {}, err.error))); });
			}
		}
		return (resolve(PromiseResult(true, 'Directory exists')));
	}));
}

/** Deletes a file */
function unlinkFile(filePath) {
	return (new Promise((resolve, reject) => {
		fs.unlink(filePath, (err) => {
			if (err) return (reject(PromiseResult(false, {}, err)));
			else return (resolve(PromiseResult(true, 'File was successfully unlinked.')));
		})
	}))
}

/** Writes the given data in the path */
function writeFile(data, filePath) {
	return (new Promise((resolve, reject) => {
		fs.writeFile(filePath, data, (err) => {
			if (err) return (reject(PromiseResult(false, {}, err)));
			else return (resolve(PromiseResult(true, 'File was successfully written.')));
		})
	}));
}

/** Builds the path and writes the data */
function sendFile(data, fileName, uploadPath) {
	return (new Promise((resolve, reject) => {
		if (!data) return (reject(PromiseResult(false, {}, "No data was provided")));
		if (!uploadPath) return (reject(PromiseResult(false, {}, "No upload path was provided")));
		buildPath(uploadPath)
		.then(() => {
			writeFile(data, uploadPath + '/' + fileName)
			.then(() => { return (resolve(PromiseResult(true, 'File was successfully uploaded.'))); })
			.catch((err) => { return (reject(PromiseResult(false, {}, err.error))); })
		}).catch((err) => { return (reject(PromiseResult(false, {}, err.error))); })
	}))
}

/*******************************************************************************
**************************** Backend functions *********************************
*******************************************************************************/

function uploadImage(imageData, formData) {
	return (new Promise((resolve, reject) => {
		if (!imageData || !imageIsValid(imageData)) return (reject(PromiseResult(false, {}, 'Please provide an image')));
		if (!formData || (formData && !(formData.dirPath))) return (reject(PromiseResult(false, {}, 'Please provide a directory path for the image.')));
		Sharp(imageData.path)
		.png().toBuffer().then((data) => {
			let newImageName = Math.random().toString(36).substr(2, 9) + '.png';
			let returnPath = formData.dirPath;
			let uploadPath = Path.dirname(require.main.filename) + '/' + returnPath;
			sendFile(data, newImageName, uploadPath)
			.then(() => {
				unlinkFile(imageData.path)
				.then(() => { return (resolve(PromiseResult(true, {path: '/' + returnPath + '/' + newImageName, filename: newImageName})))})
				.catch((err) => { return (reject(PromiseResult(false, {}, err.error))); })
			}).catch((err) => { return (reject(PromiseResult(false, {}, err.error))); })
		}).catch((err) => { return (reject(PromiseResult(false, {}, err))); })
	}))
}

router.post('/profilepicture/:id_user', checkIfAuthenticated, async (req, res) => {
	let data = req.params
	var id_user = data.id_user
	upload(req, res, (err) => {
		if (err) return res.status(422).send(`An error occured: ${err}`)
		if (!req.file) return res.status(400).send('No file was uploaded.');
		var file = req.file;
		uploadImage(file, {dirPath: `/public/uploads/${id_user}`})
		.then(async (uploaded) => {
			let url = `http://localhost:3000/uploads/${id_user}/${uploaded.result.filename}`;
			try {
				console.log(data);
				const result = await pool.query('Update profile set img =? where id_user=?', [url, data.id_user])
				if (result) return res.status(200).send({ success: 'Profile updated', uploaded: true, path: url })
			} catch (err) {
				console.log(err);
				res.status(400).send({ error: 'bad_request1' });
			}
		}).catch((err) => { console.log(err); return res.status(422).send(`An error occured.`); })
	})
})

router.post('/:id_user', checkIfAuthenticated, async (req, res) => {
	let data = req.params
	var id_user = data.id_user
	upload(req, res, (err) => {
		if (err) return res.status(422).send(`An error occured: ${err}`)
		if (!req.file) return res.status(400).send('No file was uploaded.');
		var file = req.file;
		uploadImage(file, {dirPath: `public/uploads/${id_user}`})
		.then(async (uploaded) => {
			try {
				let count = await pool.query('Select * from photos where id_user = ?', [id_user])
				if (count.length >= 4)
					return res.status(200).send({ error: 'User uploaded too many pictures.'})
				let url = `http://localhost:3000/uploads/${id_user}/${uploaded.result.filename}`;
				await pool.query('insert into photos (id_user, img) values (?,?)', [id_user, url])
				return res.status(200).send({success: true, path: url})
			} catch (err) {
				console.log(err);
				return res.status(400).send({error: 'upload pictures failed'});
			}
		}).catch((err) => { console.log(err); return res.status(422).send(`An error occured.`); })
	})
})

module.exports = router;
