# Airbnb Clone - Server NodeJS

This repository contains the server-side code for a full-stack Airbnb clone built with Express, TypeScript, GraphQL, Apollo Server, and MongoDB. The server code provides the backend functionality for the application.

-   [Features](#features)
-   [Code Structure](#code-structure)
-   [License](#license)

## Features

-   Users can browse and search for listings, create an account to book listings for a specified duration or host their listings.
-   User authentication and account creation with Google OAuth, Google People API, and Google Contacts API.
-   User sessions managed with cookies sharing session ID on each request.
    -   This is done by fundamentally separating user authentication and authorization. The user is authenticated with Google OAuth and then authorized by parsing and confirming the session ID.
-   Image asset management using the Cloudinary image storage service.
-   Searching for listings enabled by utilizing the Google Geo-Location Services API.
-   Transactions for booking listings handled through Stripe payments.
-   Alternate data solutions implemented using PostgreSQL and TypeORM. (This is viewable in this repository's `tim-feat/postgresql` branch.)

## Code Structure

The codebase is organized as follows:

```
├── src
│   ├── database      # Database configuration
│   ├── graphql       # Type definitions and resolvers
│   ├── lib           # Server globabl Types, 3rd party APIs, and utilities
│   ├── temp          # Database seeding and clearing for development
└── ...
```

-   `database`: Contains database configuration and connection settings and exports a function that returns an object of Tables from MongoDB.
    -   the `database` is instantiated and then passed to the Appollo Server context, which is passed to be used by GraphQL resolvers.
-   `graphql`: Holds the Type Definitions and Resolvers for the GraphQL API.
    -   `resolvers`: Contains the GraphQL resolvers that define how to fetch and manipulate data, and local Types mainly consist of function arguments typing.
    -   `typeDefs`: Defines the GraphQL type definitions and schema.
-   `lib`: Holds server global Types and 3rd part API for use throughout the app. Currently contains the code for Google APIs, Cloudinary, and Stripe
    -   `api`: Each API service is packaged as an object for consistency and reusability. Any new features with API services will be added here.
    -   `utils`: Includes utility functions used across the application.
-   `temp`: Contains the code to seed and clear the database for development purposes. MongoDB is used on this branch, and PostgreSQL is used on the `tim-feat/postgresql` branch.

<!-- ## Screenshots -->

<!-- TODO: Add relevant screenshots here to visually explain the code -->
<br>

## License

This project is licensed under the [MIT License](LICENSE).
