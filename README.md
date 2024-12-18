# Express and React Application

This project is a full-stack application built with Express for the backend and React for the frontend. This README provides instructions on how to set up, build, and run the application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Building the React App](#building-the-react-app)
- [Running the Express Server](#running-the-express-server)

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.17.0)
- [npm](https://www.npmjs.com/) (Node package manager, comes with Node.js)

You will also need to setup the MongoDB for database, you may also install MongoDB Compass.

## Project Basic Structure
```
/project
├── /client         # React frontend
│ ├── /public       # Public static files
│ ├── /src          # Source files for React
│ ├── index.html    # Main HTML file
│ └── package.json  # React dependencies
└── /server         # Express backend
  ├── /config       # Database config or other configurations
  ├── /middlewares  # Middlewares
  ├── /models       # Database models
  ├── /utils        # Utilities
  ├── app.js        # Express server
  └── package.json  # Express dependencies
```

## Installation

1. Clone the repository

2. Navigate to the client directory and install React dependencies:
```
cd client
npm install
```
3. Navigate to the server directory and install Express dependencies:
```
cd ../server
npm install
```
## Building the React App
1. Navigate to the client directory:
```
cd client
```
2. Build the React app:
```
npm run build
```
This command generates the static files in the dist directory.

## Running the Express Server
1. Navigate back to the server directory:
```
cd ../server
```
2. Start the Express server:
```
npm run dev
```
The server will start and listen on the port 3000.

## Starting the app
1. Open another terminal and navigate to the client directory:
```
cd ../client
```
2. Start the application locally
```
npm run dev
```
3. You can now browse the application in http://localhost:5173/

## Remark
1. We should NOT push the .env to GitHub, but it is just for convinence of our project.