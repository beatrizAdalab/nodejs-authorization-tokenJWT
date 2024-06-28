# Project Description
## Node.js Token-Based Authentication with Cookies

This project showcases a Node.js application implementing token-based authentication using JSON Web Tokens (JWTs) stored in cookies. It features user registration and login forms, and restricts access to protected routes to authenticated users only.

### Key Features
- **User Registration**: Securely register users with hashed passwords.
- **User Login**: Authenticate users and store JWTs in HTTP-only cookies.
- **Protected Routes**: Middleware to verify JWTs and authorize access.

### Technologies
- Node.js
- Express.js
- jsonwebtoken
- cookie-parser
- bcrypt
