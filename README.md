## **String Analyzer Service API**

This is a robust backend service, built with Node.js, Express, and Mongoose, provides comprehensive insights into any string you throw at it. From calculating length and identifying palindromes to character frequency and SHA-256 hashing, this API is your go-to for understanding string data. Perfect for developers looking to integrate advanced string processing capabilities into their applications.

## Overview
This is a TypeScript Node.js Express API leveraging Mongoose to store and analyze string data, providing various properties like length, palindrome status, and word count, with capabilities for advanced filtering and natural language queries.

## Features
- **String Analysis**: Computes length, palindrome status, unique characters, word count, SHA256 hash, and character frequency map for any given string.
- **Data Persistence**: Stores analyzed strings and their properties securely using MongoDB, managed by Mongoose.
- **Flexible Retrieval**: Retrieve strings by their original value (via SHA256 hash) or apply various query parameters for filtered results.
- **Natural Language Query**: Filter strings using human-readable queries like "palindromic and longer than 5 words".
- **API Security**: Implements `helmet` for HTTP header security and `cors` for managing cross-origin resource sharing.
- **Health Check Endpoint**: Provides a simple health check to monitor API availability.

## Getting Started
### Installation
To get this project up and running on your local machine, follow these steps:

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/skidev101/hng-string-analyzer.git
    cd hng-string-analyzer
    ```

2.  📦 **Install Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Build the TypeScript Project**:
    ```bash
    pnpm run build
    ```

### Environment Variables
The project requires the following environment variables to be set:

-   `PORT`: The port on which the Express server will listen. Defaults to `4000`.
-   `MONGO_URI`: The connection string for your MongoDB database.

**Example `.env` file:**
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/string-analyzer-db
```

## Usage

### Running the Development Server
To start the server in development mode with automatic restarts on code changes:

```bash
pnpm run dev
```
The API will be available at `http://localhost:<PORT>`.

### Running the Production Server
First, ensure you have built the project as described in the installation steps. Then, to start the server in production mode:

```bash
pnpm start
```
The API will be available at `http://localhost:<PORT>`.

### Running Tests
To execute the unit and integration tests for the project:

```bash
pnpm test
```

## API Documentation
### Base URL
When running locally, the base URL for all API endpoints is `http://localhost:<PORT>`. For example, `http://localhost:4000`.

### Endpoints

#### `GET /health`
A simple endpoint to check the health and status of the API.

**Request**:
No request body or parameters.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
-   `500 Internal Server Error`: Generic server error if the application encounters an unexpected issue.

#### `POST /strings`
Analyzes a given string, stores its properties, and returns the analyzed data. The string's SHA256 hash is used as its unique identifier.

**Request**:
```json
{
  "value": "hello world"
}
```
**`value`**: The string to be analyzed (required, must be a non-empty string).

**Response**:
```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
-   `400 Bad Request`: Invalid request body or missing 'value' field.
-   `422 Unprocessable Entity`: Invalid data type for 'value' (not a string) or 'value' cannot be empty.
-   `409 Conflict`: String already exists in the system.

#### `GET /strings/:value`
Retrieves the analysis details for a specific string. The `value` in the path parameter is the *original string*, which will be hashed internally to find the stored document.

**Request**:
No request body. The string to retrieve is provided as a path parameter.
Example: `GET /strings/hello world`

**Response**:
```json
{
  "id": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
  "value": "hello world",
  "properties": {
    "length": 11,
    "is_palindrome": false,
    "unique_characters": 8,
    "word_count": 2,
    "sha256_hash": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9",
    "character_frequency_map": {
      "h": 1,
      "e": 1,
      "l": 3,
      "o": 2,
      " ": 1,
      "w": 1,
      "r": 1,
      "d": 1
    }
  },
  "created_at": "2023-10-27T10:30:00.000Z"
}
```

**Errors**:
-   `400 Bad Request`: Missing 'value' in path parameter.
-   `404 Not Found`: String does not exist in the system.

#### `GET /strings`
Retrieves a list of all stored strings, with optional filtering capabilities.

**Request**:
Optional query parameters can be used to filter the results:

-   `is_palindrome`: `true` or `false` (boolean)
-   `min_length`: Minimum length of the string (integer)
-   `max_length`: Maximum length of the string (integer)
-   `word_count`: Exact number of words in the string (integer)
-   `contains_character`: A single character that the string must contain (string, length 1)

Example: `GET /strings?is_palindrome=true&min_length=5`

**Response**:
```json
{
  "data": [
    {
      "id": "...",
      "value": "madam",
      "properties": {
        "length": 5,
        "is_palindrome": true,
        "unique_characters": 3,
        "word_count": 1,
        "sha256_hash": "...",
        "character_frequency_map": { "m": 2, "a": 2, "d": 1 }
      },
      "created_at": "2023-10-27T10:30:00.000Z"
    }
  ],
  "count": 1,
  "filters_applied": {
    "is_palindrome": "true",
    "min_length": "5"
  }
}
```

**Errors**:
-   `400 Bad Request`: Invalid value for query parameters (e.g., `is_palindrome=not_boolean`, `min_length=not_a_number`, `contains_character=multiple_chars`).

#### `GET /strings/filter-by-natural-language`
Retrieves a list of strings by interpreting a natural language query.

**Request**:
Requires a `query` parameter in the URL.
Example: `GET /strings/filter-by-natural-language?query=palindromic+and+longer+than+5+words`

**Response**:
```json
{
  "data": [
    {
      "id": "...",
      "value": "racecar",
      "properties": {
        "length": 7,
        "is_palindrome": true,
        "unique_characters": 4,
        "word_count": 1,
        "sha256_hash": "...",
        "character_frequency_map": { "r": 2, "a": 2, "c": 2, "e": 1 }
      },
      "created_at": "2023-10-27T10:30:00.000Z"
    }
  ],
  "count": 1,
  "interpreted_query": {
    "original": "palindromic and longer than 5 words",
    "parsed_filters": {
      "is_palindrome": true,
      "min_length": 6
    }
  }
}
```

**Errors**:
-   `400 Bad Request`: Missing or invalid 'query' parameter.
-   `422 Unprocessable Entity`: Query parsed but resulted in conflicting filters (e.g., `min_length > max_length` due to query interpretation).

#### `DELETE /strings/:value`
Deletes a string and its analysis data from the system. The `value` in the path parameter is the *original string*, which will be hashed internally to find the stored document.

**Request**:
No request body. The string to delete is provided as a path parameter.
Example: `DELETE /strings/hello world`

**Response**:
`204 No Content`

**Errors**:
-   `400 Bad Request`: Missing 'value' in path parameter.
-   `404 Not Found`: String does not exist in the system.

## Technologies Used

| Technology    | Version   | Description                                           | Link                                               |
| :------------ | :-------- | :---------------------------------------------------- | :------------------------------------------------- |
| Node.js       | 20.x      | JavaScript runtime environment                        | [Node.js](https://nodejs.org/en/)                  |
| TypeScript    | 5.x       | Strongly typed superset of JavaScript                 | [TypeScript](https://www.typescriptlang.org/)      |
| Express.js    | 4.18.2    | Web framework for Node.js                             | [Express.js](https://expressjs.com/)               |
| Mongoose      | 7.0.0     | MongoDB object data modeling (ODM) for Node.js        | [Mongoose](https://mongoosejs.com/)                |
| MongoDB       | -         | NoSQL database                                        | [MongoDB](https://www.mongodb.com/)                |
| Jest          | 29.5.0    | JavaScript testing framework                          | [Jest](https://jestjs.io/)                         |
| Helmet        | 8.1.0     | Security middleware for Express apps                  | [Helmet](https://helmetjs.github.io/)              |
| CORS          | 2.8.5     | Middleware for enabling Cross-Origin Resource Sharing | [CORS](https://github.com/expressjs/cors)          |
| Morgan        | 1.10.1    | HTTP request logger middleware                        | [Morgan](https://github.com/expressjs/morgan)      |
| Dotenv        | 17.2.3    | Loads environment variables from a `.env` file        | [Dotenv](https://github.com/motdotla/dotenv)       |
| ts-node-dev   | 2.0.0     | TypeScript runtime for Node.js development            | [ts-node-dev](https://github.com/wclr/ts-node-dev) |

## Contributing
Contributions are highly welcomed! If you're looking to contribute to this project, please follow these guidelines:

*   **Fork the Repository**: Start by forking the project to your GitHub account.
*   **Create a New Branch**: Create a new branch for your feature or bug fix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
*   **Make Your Changes**: Implement your changes and ensure you write appropriate tests for them.
*   **Commit Your Changes**: Commit your changes with a clear, concise message:
    ```bash
    git commit -m 'feat: Add new string analysis function'
    ```
*   **Push to Your Branch**: Push your changes to your forked repository:
    ```bash
    git push origin feature/your-feature-name
    ```
*   ➡️ **Open a Pull Request**: Submit a pull request to the `main` branch of this repository.

## Author Info

Developed with passion by:

-   **Ojomona Ethan Inedu**
    -   Twitter: [https://x.com/monaski_]

---

![Node.js](https://img.shields.io/badge/Node.js-20.x-green?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Express.js](https://img.shields.io/badge/Express.js-4.x-orange?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-4.x-green?logo=mongodb)
![Jest](https://img.shields.io/badge/Tests-Jest-red?logo=jest)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)