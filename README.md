# Tinyhouse Server

This is the backend server for Tinyhouse, a full-stack JavaScript web application that allows users to search, book, and review rental properties. This project uses Node.js, Express, MongoDB, and TypeScript. This project was built in conjunction with a masterclass from NewLine: https://www.newline.co/tinyhouse. 

## Getting Started

1. Clone the repository: `git clone https://github.com/acumulus8/tinyhouse-server.git`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

## Development

To start the server in development mode and watch for changes, run `npm run dev`. This project uses `nodemon` to automatically restart the server on changes.

This project uses `ESLint` for code linting and `Prettier` for code formatting. To run both tools, use the following command: `npm run lint`. To only run `ESLint`, use `npm run lint:eslint`. To only run `Prettier`, use `npm run lint:prettier`.

## Deployment

This project can be deployed to a cloud provider like AWS or Heroku. Before deploying, make sure to set the following environment variables:

- `MONGO_URI`: the URI for the MongoDB database
- `PORT`: the port number for the server
- `JWT_SECRET`: the secret key for JSON Web Tokens

## API Documentation

This server exposes the following endpoints:

- `POST /api/auth/signin`: sign in with email and password
- `POST /api/auth/signup`: sign up with email and password
- `GET /api/listings`: get all listings
- `GET /api/listings/:id`: get a single listing by ID
- `POST /api/listings`: create a new listing
- `PATCH /api/listings/:id`: update a listing by ID
- `DELETE /api/listings/:id`: delete a listing by ID
- `GET /api/users/:id/listings`: get all listings for a user by ID

## License

This project is licensed under the MIT License. Please see the `LICENSE` file in the root directory for more information.
