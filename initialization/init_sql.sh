ok() { echo $1; }

EXPECTED_ARGS=3
E_BADARGS=65

cd ~/goinfre/mamp/mysql/bin/

Q0="CREATE DATABASE IF NOT EXISTS $1;"
Q1="CREATE USER '$2'@'%' IDENTIFIED BY '$3';"
Q2="GRANT ALL PRIVILEGES ON *.* TO '$2'@'%' WITH GRANT OPTION;"
SQL="${Q0}${Q1}${Q2}"
 
if [ $# -ne $EXPECTED_ARGS ]
then
  echo "Usage: $0 dbname dbuser dbpass"
  exit $E_BADARGS
fi

./mysql -uroot -p -e "$SQL"

ok "\n\nDatabase $1 and user $2 created with a password $3"
