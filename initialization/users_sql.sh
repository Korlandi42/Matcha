
cd ~/goinfre/mamp/mysql/bin/

Q0="USE matcha_db;"
Q1="INSERT INTO users (id, username, password, name, surname, email, profile, isVerified) VALUES ('1', 'lox', '\$2b\$10\$Efn1VLYmQ.IQXgUvZimXyug2DKApNOLUlSBjpXRZMq8huiP8y6wXO', 'lox', 'lox', 'lox@mail.com', '1', '1');"
cd ~/42/Matcha/src/assets
mkdir uploads
Q2="INSERT INTO profile (id, id_user, genre, sexual_orientation, age, biography) VALUES ('1', '1', 'male', 'bisexual', '28', 'lol');"
SQL="${Q0}${Q1}${Q2}"

cd ~/goinfre/mamp/mysql/bin/
./mysql -uroot -p -e "$SQL"

echo "lox et kenza created in db\n"
