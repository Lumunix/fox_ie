.. _new-development:

Setup a Developer Environment
===========
Install Nvm
Use
 Node V12.22.12 for the Frontend directory
 nvm use 12
 the root UI directory do:
 npm install
 Node V20.19.3 for the UI directory
 nvm use 20
 In the root directory do:
 npm install


Making migrations:
docker compose exec django python manage.py makemigrations

Apply migrations
docker compose exec django python manage.py migrate


docker compose up --build
