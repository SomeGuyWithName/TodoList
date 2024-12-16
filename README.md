Challenge 22: Single Page Application (SPA)
This project is a Single Page Application (SPA) designed to demonstrate BREADS (Browse, Read, Edit, Add, Delete, Sort) operations using a RESTful API. It integrates a modern tech stack to create a seamless user experience.

Features
Backend: Express.js with EJS for templating.
Database: MongoDB for efficient data handling.
Frontend: Vanilla JavaScript, jQuery, Bootstrap 5, and FontAwesome.
Supports operations like Create, Read, Update, Delete, and Sort for data.
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/ramdaniprnm/Challenge-22-SPA.git
Navigate to the project directory:

bash
Copy code
cd Challenge-22-SPA
Install dependencies:

bash
Copy code
npm install
Configure environment variables:

Create a .env file in the root directory and add:
env
Copy code
MONGODB_URI=<your-mongodb-uri>
DB_NAME=<database-name>
USERS_COLLECTION=<collection-name-for-users>
TODOS_COLLECTION=<collection-name-for-todos>
Usage
To start the application in development mode:

bash
Copy code
npm run dev
Access the app locally at http://localhost:3000.

Contributing
Fork the repository.
Create a new feature branch:
bash
Copy code
git checkout -b feature-name
Commit your changes and push the branch:
bash
Copy code
git push origin feature-name
Submit a pull request.
License
This project is distributed under the Unlicense license.
