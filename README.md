1- create a virtualenvironment in the project root folder (py -m venv "envName")
2- activate the virtualenvironment (envName\Scripts\activate.bat)
3- navigate to the backend directory
4- install requirements.txt (pip install -r requirements.txt in windows)
5- navigate to the frontend directory
6- npm install
7- navigate to backend root and run:
7.a- python manage.py makemigrations
7.b- python manage.py migrate
7.c- python manage.py runserver
8- create a .env folder in the frontend directory
9- in that.env file write: VITE_API_URL = "put the django server's address here"
10- open a 2nd terminal and navigate to frontend root
11- in the 2nd terminal write: npm run dev
12- gl hf <3
