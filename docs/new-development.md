# Setup a Developer Environment

## Installing `nvm` for Frontend Projects
1. Install `nvm` (Node Version Manager).
2. For the **Frontend directory**, use Node.js version **v12.22.12**:
   ```bash
   nvm use 12
   ```
   Then install dependencies:
   ```bash
   npm install
   ```
3. For the **UI directory**, use Node.js version **v20.19.3**:
   ```bash
   nvm use 20
   ```
   Then install dependencies:
   ```bash
   npm install
   ```

## Making and Applying Migrations Using Docker
1. Create database migrations:
   ```bash
   docker compose exec django python manage.py makemigrations
   ```
2. Apply migrations:
   ```bash
   docker compose exec django python manage.py migrate
   ```
3. Build and start services:
   ```bash
   docker compose up --build
   ```

### Rebuilding a Single Service
For instance, to rebuild the UI service:


docker-compose exec django python manage.py rebuild_index
