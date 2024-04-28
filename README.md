# Project Setup Instructions

Follow these steps to set up and run the project on your local machine.

## Prerequisites

- Python 3.x
- Node.js and npm

## Backend Setup

1. **Create and activate a virtual environment:**

   ```
   # Create virtual environment
   py -m venv envName
   # Activate virtual environment (Windows)
   envName\Scripts\activate.bat
   ```

2. **Navigate to the backend directory:**

   ```
   cd path/to/backend
   ```

3. **Install Python requirements:**
   ```
   pip install -r requirements.txt
   ```

## Database Setup

4. **Prepare and apply migrations:**

   ```
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Run the backend server:**
   ```
   python manage.py runserver
   ```

## Frontend Setup

6. **Navigate to the frontend directory and install dependencies:**

   ```
   cd path/to/frontend
   npm install
   ```

7. **Create and configure the .env file:**

   ```
   # Navigate to the frontend directory
   cd path/to/frontend
   # Create a .env file
   echo VITE_API_URL="put the django server's address here" > .env
   ```

8. **Run the frontend development server:**
   ```
   npm run dev
   ```

## GL HF <3
