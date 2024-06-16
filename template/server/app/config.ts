// Load the express module to create a web application

import express from "express";

const app = express();

// Configure it

/* ************************************************************************* */

// CORS Handling: Why is the current code commented out and do I need to define specific allowed origins for my project?

// CORS (Cross-Origin Resource Sharing) is a security mechanism in web browsers that blocks requests from a different domain than the server.
// You may find the following magic line in forums:

// app.use(cors());

// You should NOT do that: such code uses the `cors` module to allow all origins, which can pose security issues.
// For this pedagogical template, the CORS code is commented out to show the need for defining specific allowed origins.

// To enable CORS and define allowed origins:
// 1. Install the `cors` module in the server directory
// 2. Uncomment the line `import cors from "cors";`
// 3. Uncomment the section `app.use(cors({ origin: [...] }))`
// 4. Be sure to only have URLs in the array with domains from which you want to allow requests.
// For example: ["http://mysite.com", "http://another-domain.com"]

/*
import cors from "cors";

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL, // keep this one, after checking the value in `server/.env`
      "http://mysite.com",
      "http://another-domain.com",
    ]
  })
);
*/

/* ************************************************************************* */

// Request Parsing: Understanding the purpose of this part

// Request parsing is necessary to extract data sent by the client in an HTTP request.
// For example to access the body of a POST request.
// The current code contains different parsing options as comments to demonstrate different ways of extracting data.

// 1. `express.json()`: Parses requests with JSON data.
// 2. `express.urlencoded()`: Parses requests with URL-encoded data.
// 3. `express.text()`: Parses requests with raw text data.
// 4. `express.raw()`: Parses requests with raw binary data.

// Uncomment one or more of these options depending on the format of the data sent by your client:

// app.use(express.json());
// app.use(express.urlencoded());
// app.use(express.text());
// app.use(express.raw());

/* ************************************************************************* */

// Import the API router
import router from "./router";

// Mount the API router under the "/api" endpoint
app.use(router);

/* ************************************************************************* */

// Production-ready setup: What is it for?

// The code includes sections to set up a production environment where the client and server are executed from the same processus.

// What it's for:
// - Serving client static files from the server, which is useful when building a single-page application with React.
// - Redirecting unhandled requests (e.g., all requests not matching a defined API route) to the client's index.html. This allows the client to handle client-side routing.

import path from "node:path";

// Serve server resources

const publicFolderPath = path.join(__dirname, "../../server/public");

app.use(express.static(publicFolderPath));

// Serve react resources

const reactBuildPath = path.join(__dirname, "../../client/dist");

app.use(express.static(reactBuildPath));

// Redirect unhandled requests to the react index file

app.get("*", (_, res) => {
  res.sendFile("index.html", { root: reactBuildPath });
});

/* ************************************************************************* */

// Middleware for Error Logging
// Important: Error-handling middleware should be defined last, after other app.use() and routes calls.

import type { ErrorRequestHandler } from "express";

// Define a middleware function to log errors
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err);
  console.error("on req:", req.method, req.path);

  // Pass the error to the next middleware in the stack
  next(err);
};

// Mount the logErrors middleware globally
app.use(logErrors);

/* ************************************************************************* */

export default app;
