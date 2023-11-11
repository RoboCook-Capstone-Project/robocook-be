# RoboCook Backend Server

RoboCook is a project that comes from the challenge students face as they live away from home to pursue their education. They sometimes have no idea what to make with the limited groceries at hand. We dream of developing an app that will help give these students inspiration for what to make with the groceries they have and even let AI provide them with a personalized dish recipe based on fusions of some dishes they would like to have.

## Table of Contents

-   [Installation](#installation)
-   [Features](#features)
-   [Environment Variables](#environment-variables)
-   [Project Structure](#project-structure)
-   [Api Endpoints](#api-endpoints)
-   [Error Handling](#error-handling)
-   [Validation](#validation)
-   [Authentication](#authentication)
-   [Inspirations](#inspirations)

## Installation

### Setup

-   Clone this repository

    ```bash
    git clone https://github.com/serimanrnsa/robocook-be.git

    cd robocook-be
    ```

-   Set up the [environment variables](#environment-variables)
-   Create a service-key.json for Google Cloud Storage

### Run

Using node/npm

```bash
# Install dependencies
npm install

# Initiate prisma client (for first time setup)
npx prisma generate

# Migrate the prisma schema (optional)
npx prisma migrate dev --name init

# Run in development env
npm run dev
```

Using Docker

```bash
# Build the image
docker build . -t="IMAGE_NAME"

# Build the container from the image
docker run -d -p 3000:3000 --name CONTAINER_NAME IMAGE_NAME
```

## Features

-   **Google Cloud SQL Database**: application database
-   **Google Cloud Storage**: object data storage
-   **Prisma & Prisma Token**: object relational mapping for accessing and manipulating database
-   **Bcrypt**: password hashing
-   **Dotenv**: environment variables access
-   **Http Status**: http status formatter
-   **Joi**: request format validation
-   **Json Web Token**: authentication token
-   **Multer**: file request handler
-   **Node Mailer**: email transporter
-   **Stream**: stream object to data storage
-   **Nodemon**: live code update=

## Environment Variables

The environment variables can be modified in the `.env` file. The example of the environment variables:

```bash
# Port number
PORT=3000

#GCP Project ID
PROJECT_ID="evident-gecko-404510"

# Service key file path
KEY_FILE_NAME="./service-key.json"

# Database URL
DATABASE_URL="mysql://root:bangkit-mysql-db-password@34.101.124.227:3306/public"

# Google Cloud Storage URL
GCLOUD_STORAGE_URL="https://storage.googleapis.com"

# Google Cloud Storage bucket name
GCLOUD_STORAGE_BUCKET_NAME="bangkit-bucket-capstone"

# JWT
# JWT secret key
JWT_SECRET="samplesecret"
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=30
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30
# Number of minutes after which a reset password token expires
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
# Number of minutes after which a verify email token expires
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# Server URL
SERVER_URL="http://localhost:3000"

# Email service
# Email address
EMAIL_FROM=""
# Email password is generated from app specific password that you can add at gmail account setting
EMAIL_PASSWORD=""
```

## Project Structure

```
src\
 |--config\         # Cloud storage configuration
 |--controllers\    # Route controllers (controller layer)
 |--middlewares\    # Custom express middlewares (for authentication, error, validation)
 |--routes\         # Routes
 |--services\       # Business logic (service layer)
 |--utils\          # Utility classes and functions
 |--validations\    # Request data validation schemas
 |--server.js       # Express app entry point
```

<!-- ## API Documentation

To view the list of available APIs and their specifications, run the server and go to `http://localhost:3000/v1/docs` in your browser. This documentation page is automatically generated using the [swagger](https://swagger.io/) definitions written as comments in the route files. -->

## API Endpoints

List of available routes:

**Auth routes**:\
`POST /api/auth/register` - register\
`POST /api/auth/login` - login\
`POST /api/auth/logout` - logout\
`POST /api/auth/refresh-tokens` - refresh auth tokens\
`POST /api/auth/verify-email` - verify email

**User routes**:\
`GET /api/users` - get all users\
`POST /api/users` - create a user\
`GET /api/users/:id` - get user by id\
`PUT /api/users/:id` - update user\
`DELETE /api/users/:id` - delete user

`GET /api/:id/posts` - get all user's posts\
`GET /api/:id/drafts` - get all user's drafts\

**Post routes**:\
`GET /api/posts` - get all posts\
`POST /api/posts` - create a post (single image)\
`DELETE /api/posts/:id` - delete post (single image)\

**Post routes**:\
`GET /api/galleries` - get all galleries\
`POST /api/galleries` - create a gallery (multiple image)\
`DELETE /api/galleries/:id` - delete a gallery (single image)\
`DELETE /api/galleries/user/:authorId` - delete all gallery from specific user (multiple image)\

## Error Handling

The app has a centralized error handling mechanism.

Controllers should try to catch the errors and forward them to the error handling middleware (by calling `next(error)`). For convenience, you can also wrap the controller inside the catchAsync utility wrapper, which forwards the error.

When running in development mode, the error response also contains the error stack.

The app has a utility ApiError class to which you can attach a response code and a message, and then throw it from anywhere (catchAsync will catch it).

## Validation

Request data is validated using [Joi](https://joi.dev/). The validation schemas are defined in the `src/validations` directory and are used in the routes by providing them as parameters to the `validate` middleware.

## Authentication

To require authentication for certain routes, you can use the `auth` middleware.

These routes require a valid JWT access token in the Authorization request header using the Bearer schema. If the request does not contain a valid access token, an Unauthorized (401) error is thrown.

**Generating Access Tokens**:

An access token can be generated by making a successful call to the register (`POST /v1/auth/register`) or login (`POST /v1/auth/login`) endpoints. The response of these endpoints also contains refresh tokens (explained below).

**Refreshing Access Tokens**:

After the access token expires, a new access token can be generated, by making a call to the refresh token endpoint (`POST /v1/auth/refresh-tokens`) and sending along a valid refresh token in the request body. This call returns a new access token and a new refresh token.

## Inspirations

-   [hagopj13/node-express-boilerplate](https://github.com/hagopj13/node-express-boilerplate)
