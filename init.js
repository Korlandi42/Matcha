const Rfr = require('rfr');
const MysqlPool = Rfr('server/db_connection');
const CreateUsers = Rfr('initialization/populate_db').createUsers;
const Spawn = require('child_process').spawn;

function createDatabase() {
	return (new Promise(async (res, rej) => {
		let d_res = await MysqlPool.query(`CREATE DATABASE IF NOT EXISTS 'matcha'`)
		.catch(err => { console.log(err); return (rej()); })
		if (d_res) console.log(`The matcha database was successfully created \x1b[32m✓\x1b[0m`)
		return (res());
	}))
}

function createDatabaseTables() {
	return (new Promise(async (res, rej) => {
		let querys = {
			users : 'CREATE TABLE IF NOT EXISTS `users` ( `id` INT NOT NULL AUTO_INCREMENT , `username` VARCHAR(500) NULL , `password` VARCHAR(100) NULL , `name` VARCHAR(100) NULL, `surname` VARCHAR(500) NULL , `email` VARCHAR(100) NULL, `profile` BOOLEAN DEFAULT FALSE, token_resetpassword VARCHAR(100), `isVerified` INT DEFAULT 0, `isFake` INT DEFAULT 0, `lastCon` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, `score` INT DEFAULT 0, `isOnline` INT DEFAULT 0, PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			profile : 'CREATE TABLE  IF NOT EXISTS `profile` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user` INT NOT NULL , `genre` VARCHAR(50) NULL DEFAULT NULL , `sexual_orientation` VARCHAR(100) NULL DEFAULT NULL , `age` INT NULL DEFAULT NULL , `biography` VARCHAR(1000) NULL DEFAULT NULL , `img` VARCHAR(256), PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			geolocation: 'CREATE TABLE  IF NOT EXISTS `geolocation` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user` INT NOT NULL , `latitude` FLOAT NULL DEFAULT NULL , `longitude` FLOAT NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			tags: 'CREATE TABLE  IF NOT EXISTS `tags` ( `id` INT NOT NULL AUTO_INCREMENT , `tagname` VARCHAR(30) NULL DEFAULT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			usertags: 'CREATE TABLE  IF NOT EXISTS `usertags` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user` INT NOT NULL , `id_tag` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			interests: 'CREATE TABLE  IF NOT EXISTS `interests` ( `id` INT NOT NULL AUTO_INCREMENT , `id_visitor` INT NOT NULL , `id_visited` INT NOT NULL , `visit` BOOLEAN DEFAULT FALSE, `like` BOOLEAN DEFAULT FALSE, `block` BOOLEAN DEFAULT FALSE, `fake` BOOLEAN DEFAULT FALSE, PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			match: 'CREATE TABLE  IF NOT EXISTS `match` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user1` INT NOT NULL , `id_user2` INT NOT NULL , `id_chatroom` VARCHAR(1000) NULL DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			messages: 'CREATE TABLE  IF NOT EXISTS `messages` ( `id` INT NOT NULL AUTO_INCREMENT , `id_sender` INT NOT NULL , `id_receiver` INT NOT NULL , `id_chatroom` VARCHAR(1000) NULL DEFAULT NULL, `content` VARCHAR(1000) NULL DEFAULT NULL, PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			photos: 'CREATE TABLE  IF NOT EXISTS `photos` ( `id` INT NOT NULL AUTO_INCREMENT , `id_user` INT NOT NULL, `img` VARCHAR(256), PRIMARY KEY (`id`)) ENGINE = InnoDB;',
			notifications: 'CREATE TABLE  IF NOT EXISTS `notifications` ( `id` INT NOT NULL AUTO_INCREMENT , `id_sender` INT NOT NULL , `id_receiver` INT NOT NULL , `type` VARCHAR(100) NOT NULL , `seen` BOOLEAN DEFAULT FALSE , PRIMARY KEY (`id`)) ENGINE = InnoDB;'
		}
		let tableNames = Object.keys(querys);
		for (let table of tableNames) {
			let f_res = await MysqlPool.query(`SELECT 1 FROM \`${table}\` LIMIT 1;`)
			.catch(async (err) => {
				if (err.code != 'ER_NO_SUCH_TABLE') return (console.error(err))
				let s_res = await MysqlPool.query(querys[table])
				.catch(err => { console.log(err) })
				if (s_res) console.log(`The ${table} table was successfully created \x1b[32m✓\x1b[0m`)
			})
			if (f_res) console.log(`The ${table} table already exists \x1b[32m✓\x1b[0m`);
		}
		res();
	}))
}

async function init() {
	console.log('########################################');
	console.log('##### CREATING THE DATABASE TABLES #####');
	console.log('########################################\n');
	await createDatabaseTables();
	console.log('\n########################################');
	console.log('######## POPULATING THE DATABASE #######');
	console.log('########################################\n');
	await CreateUsers(20);
	// console.log('\n########################################');
	// console.log('##### STARTING THE BACKEND SERVER ######');
	// console.log('########################################\n');
	// let backEnd = Spawn('npm', ['start']);
	// let consoleOutput = (data) => {process.stdout.write(data.toString('utf8'));};
	// backEnd.stdout.on('data', consoleOutput);
	// backEnd.stderr.on('data', consoleOutput);
	// setTimeout(() => {
	// 	console.log('\n########################################');
	// 	console.log('##### STARTING THE FRONTEND SERVER #####');
	// 	console.log('########################################\n');
	// 	let frontEnd = Spawn('./node_modules/.bin/ng', ['serve']);
	// 	frontEnd.stdout.on('data', consoleOutput);
	// 	frontEnd.stderr.on('data', consoleOutput);
	// }, 3000)
}

init();
