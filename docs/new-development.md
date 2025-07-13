# Setup a Developer Environment


## Installing nvm for each front end project
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

## Making and applying migrations using docker
Making migrations:
docker compose exec django python manage.py makemigrations

Apply migrations
docker compose exec django python manage.py migrate


docker compose up --build


Rebuilding a single service
docker-compose up -d --no-deps --build ui

## Running the skeleton ui

Install the Ui depedencies using npm.
npm install


lumun@ScreeBook:/mnt/c/Users/lumun/Documents/Github/fox_ie/socialhome/ui$ npm run dev
