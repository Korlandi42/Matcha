cd ~/goinfre/mamp/mysql/bin/

Q0="USE matcha_db;"
Q1="INSERT INTO tags (id, tagname) VALUES ('1', 'travel');"
Q2="INSERT INTO tags (id, tagname) VALUES ('2', 'music');"
Q3="INSERT INTO tags (id, tagname) VALUES ('3', 'books');"
Q4="INSERT INTO tags (id, tagname) VALUES ('4', 'beers');"
Q5="INSERT INTO usertags (id_user, id_tag) VALUES ('1', '1');"
Q6="INSERT INTO usertags (id_user, id_tag) VALUES ('1', '2');"
SQL="${Q0}${Q1}${Q2}${Q3}${Q4}${Q5}${Q6}"

./mysql -uroot -p -e "$SQL"

echo "tagnames created in db\n"
