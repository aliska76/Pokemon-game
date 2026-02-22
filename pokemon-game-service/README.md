# Pokemon Missing Letters

A RESTful API service for a message board application built with Nodejs and SQLite.

SQLite local file:
```pgsql
database.sqlite
```

Entities:

- User
- Message
- Vote

Each entity includes:

- uuid primary key
- createdAt
- updatedAt

Vote uniqueness constraint:

```
UNIQUE(user_id, message_id)
```

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/aliska76/Pokemon-game.git
cd pokemon-game-service
```

2. Install dependencies:
```bash
npm install
```
Create .env file:

```env
GOOGLE_CLIENT_ID=718159560152-vs5qpoh5gsmneaul96beut435ke99b15.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```
## 🚀 Running the app
```bash
# development
npm run start


## 👥 Author
Alisa Rakhlina

