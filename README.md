# Pokémon Missing Letters Game

A fun word-guessing game where players need to guess the missing letter in Pokémon names!

## 🎮 About The Game

Test your Pokémon knowledge by guessing the missing letters in various Pokémon names. Each correct guess earns you points, and you can compete with other players on the leaderboard!

### How to Play
1. Log in with your Google account
2. Click "Start Game" to get a random Pokémon with a hidden letter
3. Type your guess for the missing letter
4. Get 10 points for each correct answer
5. Try to beat the high score!

## 🛠 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- CSS for styling

### Backend
- **Node.js** with Express
- **SQLite** for database
- **Passport.js** with Google OAuth 2.0 authentication
- **Express Session** for session management

### APIs & Data
PokéAPI - The RESTful Pokémon API (https://pokeapi.co/)
REST API - Custom backend API
## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/aliska76/Pokemon-game.git
cd Pokemon-game
```

2. **Install backend dependencies***
```bash
cd pokemon-game-service
npm install
```

3. **Install frontend dependencies**

```bash
cd pokemon-game-frontend
npm install
```

4. **Set up environment variables**
Create a .env file in the root directory:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

5. **Set up Google OAuth**

- Go to Google Cloud Console
- Create a new project or select existing
- Enable Google+ API
- Configure OAuth consent screen
- Create credentials (OAuth client ID)
- Add authorized redirect URI: http://localhost:3000/auth/google/callback

6. **Run the application**
Open server and frontend in separate terminals.

Start the backend server:

```bash
cd pokemon-game-service
npm run start
```
In a separate terminal, start the frontend:

```bash
cd pokemon-game-frontend
npm run dev
```

7. **Open your browser**
Navigate to http://localhost:5173

### 🎯 Features
- ✅ Google OAuth authentication
- ✅ Random Pokémon selection
- ✅ Score tracking
- ✅ Persistent leaderboard
- ✅ User progress saving
- ✅ Responsive design

### 🗄️ Database Schema
- users: User accounts and profiles
- federated_credentials: OAuth connections
- pokemon: Pokémon names and data
- scores: User scores and leaderboard
- pokemon_usage: Track which Pokémon users have seen

### 🔄 How Pokémon Data Works
The app fetches Pokémon data from The RESTful Pokémon API (PokéAPI):
- On server start, it fetches the first 151 Pokémon (original generation)
- Pokémon names are stored in the local SQLite database
- Each game session randomly selects a Pokémon from the database
- The name is masked for the guessing game

### 🐛 Debugging
The backend includes console.log statements for easier debugging and development
These logs help track:
- Pokémon data loading
- User authentication flow
- Game state and masking
- Database errors and operations
Feel free to use them for your own debugging needs!

### 🤝 Contributing
Contributions, issues, and feature requests are welcome!

### 📝 License
This project is for educational purposes.

### 👨‍💻 Author
GitHub: @aliska76

### 🙏 Acknowledgments
- Pokémon data sourced from PokéAPI
- Built with Vite + React + TypeScript
- Authentication powered by Passport.js

⭐ Star this repo if you like it!

Have fun guessing Pokémon! 🎉

