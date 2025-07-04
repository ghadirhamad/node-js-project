# Project1 - Article Publishing Platform

A simple Node.js web application for publishing, viewing, and managing articles with Google authentication. Built using Express, MongoDB (Mongoose), EJS, and Passport.js.

## Features

- Google OAuth 2.0 authentication (login with Google)
- Create, view, and delete articles
- Only the author can delete their own articles
- Responsive and RTL-friendly Arabic UI
- Session management and secure routes
- MongoDB for persistent storage

## Live Demo

Production link: [https://node-js-project-gael.onrender.com](https://node-js-project-gael.onrender.com)

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm
- MongoDB Atlas account (or local MongoDB)
- Google Cloud Platform project with OAuth 2.0 credentials

### Installation

1. **Clone the repository:**
   ```sh
   git clone <your-repo-url>
   cd <project-directory>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with the following content:
   ```
   mongo_uri=your_mongodb_connection_string
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NODE_ENV=development
   SECRET=your_session_secret
   ```

4. **Run the application:**
   ```sh
   node index.js
   ```
   The app will be available at `http://localhost:3000`.

## Usage

- Visit `/` to see the login page.
- Log in with your Google account.
- After login, you can:
  - Write a new article (`/article/new`)
  - View all articles (`/show`)
  - View article details and delete your own articles

## Folder Structure

```
.
├── index.js              # Main server file
├── models/
│   └── Article.js        # Mongoose Article schema
├── views/                # EJS templates
│   ├── articles.ejs
│   ├── article-details.ejs
│   ├── login.ejs
│   ├── new-article.ejs
│   └── visitors.ejs
├── .env                  # Environment variables (not committed)
├── package.json
└── README.md
```

## Dependencies

- express
- mongoose
- ejs
- dotenv
- express-session
- passport
- passport-google-oauth20
- method-override

## License

ISC

---

**Production:** [https://node-js-project-gael.onrender.com](https://node-js-project-gael.onrender.com)