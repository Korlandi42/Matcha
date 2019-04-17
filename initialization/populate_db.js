const faker = require('faker');
const bcrypt = require('bcrypt')
const Rfr = require('rfr');
const MysqlPool = Rfr('server/db_connection');
const {addTags} = Rfr('server/controllers/tags');
const uuidv4 = require('uuid/v4');
const fs = require('fs')
const request = require('request');

const TEST_PASSWORD = "4242";

async function hashPassword(pass) {
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

function choose(choices) {
	let index = Math.floor(Math.random() * choices.length);
	return choices[index];
}

let tags = [];
let randomOrientation = "";

async function createUsers(nb = 10) {
	for (let i = 0; i < nb; i++) {
		let randomName = faker.name.lastName();
		let randomFirstName = faker.name.firstName();
		let randomEmail = faker.internet.email();
		let randomUsername = faker.internet.userName();
		let randomPassword = await hashPassword(TEST_PASSWORD);
		let randomGenre = choose(["male", "female"]);
		let randomOrientation = (randomGenre == "male") ? choose(["bisexual", "gay", "straight"]) : choose(["bisexual", "straight", "lesbian"]);
		let randomAge = Math.random() * (60 - 18) + 18;
		let randomBiography = faker.lorem.sentence();
		let randomScore = Math.random() * 1000;
		let randomLatitude = randomCoord(48, false, 812055, 903896);
		let randomLongitude = randomCoord(2, false, 258877, 419218);
		let users = {
			"name": randomName,
			"firstname": randomFirstName,
			"email": randomEmail,
			"username": randomUsername,
			"password": randomPassword,
			"genre": randomGenre,
			"orientation": randomOrientation,
			"age": randomAge,
			"biography": randomBiography,
			"score": randomScore,
			"latitude": randomLatitude,
			"longitude": randomLongitude
		};

		for (let j = 0; j < 3; j++)
			await tags.push(choose(["music", "fun", "travel", "books", "beers", "sports", "party", "tvshows", "dance"]));
		const addError = await AddUsers(users, tags);
		if (addError !== null && addError !== undefined)
			console.log(addError)
		tags.length = 0;
	}
	console.log('\nAll the users have successfully been inserted to the database.');
	return;
}

const randomIntBetween = (min, max, except = null) => {
	let randomInt = Math.floor(Math.random() * (max - min + 1)) + min
	randomInt = (except == randomInt) ? (Math.floor(Math.random() * ((except - 1) - min + 1)) + min) : randomInt
	return randomInt
}

const randomCoord = (min, max = null, minFloat, maxFloat) => (max ? parseFloat(randomIntBetween(min, max) + "." + randomIntBetween(minFloat, maxFloat)) : parseFloat(min + "." + randomIntBetween(minFloat, maxFloat)))

let download = (uri, filename, callback) => {
	request.head(uri, (err, res, body) => {
		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
	});
};

const InsertintoProfile = async (id_user, users, tags) => {
	try {
		const result = await MysqlPool.query('Insert into profile(id_user, genre, sexual_orientation, biography, age) values(?,?,?,?,?)', [id_user, users.genre, users.orientation, users.biography, users.age])
		if (result) {
			return await addTags(tags, id_user);
		}
	} catch (err) {
		return err;
	}
}

function AddPhoto(id_user) {
	return (new Promise((resolve, reject) => {
		try {
			let path = './/public/uploads/' + id_user
			fs.mkdir(path, {recursive: true}, (err) => {
				if (err) throw err;
				let name = uuidv4() + '.png'
				download(faker.image.imageUrl(300, 300, "people"), name, () => {
					fs.rename('./' + name, path + '/' + name, async (err) => {
						if (err) throw err;
						let imgPath = `http://localhost:3000/uploads/${id_user}/${name}`;
						await MysqlPool.query('Update profile set img =? where id_user=?', [imgPath, id_user])
						.catch((err) => { console.log(err); })
						resolve();
					})
				})
			})
		} catch (err) { console.log(err); reject(); }
	}))
}

const addGeoloc = async (id_user, users) => {
	try {
		await MysqlPool.query('insert into geolocation(id_user, latitude, longitude) values(?,?,?)', [id_user, users.latitude, users.longitude])
	} catch (err) { console.log(err);}
}

const AddUsers = async (users, tags) => {
	try {
		const result = await MysqlPool.query('Insert into users(username, password, email, name, surname, score, profile, isVerified) values(?,?,?,?,?,?,?,?)', [users.username, users.password, users.email, users.name, users.firstname, users.score, 1, 1])
		if (result) {
			let id_user = result.insertId;
			const res = await InsertintoProfile(id_user, users, tags);
			if (res !== null && res != undefined) return res;
			const photo = await AddPhoto(id_user);
			addGeoloc(id_user, users);
			return console.log(`Successfully inserted user ${users.firstname} ${users.name} - ${users.username} \x1b[32m✓\x1b[0m`);
		}
	} catch (err) {
		return err;
	}
};

exports.createUsers = createUsers;
