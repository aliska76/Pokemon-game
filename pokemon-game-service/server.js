const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');
const cors = require('cors');
require('dotenv').config();
const { populatePokemons, maskPokemonName } = require('./fetch-pokemon.js');

const app = express();
const port = 3000;

async function startServer() {
    // Call it once when server starts
    const pokemonList = await populatePokemons();
    console.log('pokemon List', pokemonList);

    // Configure session and Passport middleware
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }));

    app.use(session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        db.get(
            "SELECT user_id FROM federated_credentials WHERE provider = ? AND subject = ?",
            ['google', profile.id],
            function(err, row) {
                if (err) return done(err);

                if (!row) {
                    db.run(
                    "INSERT INTO users (username, name) VALUES (?, ?)",
                    [profile.emails[0].value, profile.displayName],
                    function(err) {
                        if (err) return done(err);

                        const userId = this.lastID;

                        db.run(
                        "INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)",
                        [userId, 'google', profile.id],
                        function(err) {
                            if (err) return done(err);

                            return done(null, { id: userId, name: profile.displayName });
                        }
                        );
                    }
                    );
                } else {
                    return done(null, { id: row.user_id });
                }
            }
        );
    }));

    passport.serializeUser((user, done) => {
        console.log("Serializing user:", user);
        if (!user || !user.id) {
            return done(new Error('User id missing'));
        }
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
            if (err) return done(err);
            if (!row) return done(new Error('User not found'));
            done(null, row);
        });
    });

    app.use(express.json());

    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    app.get('/auth/google',
        passport.authenticate('google', { scope: ['profile', 'email'] })
    );

    app.get('/debug/session', (req, res) => {
        res.json(req.session);
    });

    app.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('http://localhost:5173');
        }
    );

    app.get('/me', (req, res) => {
        if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
        res.json(req.user);
    });

    app.get('/game/start', (req, res) => {
        db.get(`
            SELECT * FROM pokemon
            ORDER BY RANDOM()
            LIMIT 1
        `, [], (err, row) => {

            if (err) {
                console.error('DB error:', err);
                return res.status(500).json({ error: 'DB error' });
            }

            if (!row) {
                return res.status(404).json({ error: 'No Pokémon found' });
            }
            
            console.log("row.name", row.name)

            const { masked, index } = maskPokemonName(row.name);
            console.log("masked", masked)

            res.json({
                pokemonId: row.id,
                maskedName: masked,
                missingIndex: index
            });
        });
    });

    app.post('/game/guess', (req, res) => {
        const { pokemonId, letter, missingIndex } = req.body || {};
        const userId = req.user?.id || 1;

        if (!pokemonId || !letter || missingIndex === undefined) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        db.get("SELECT name FROM pokemon WHERE id = ?", [pokemonId], (err, row) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (!row) return res.status(404).json({ error: 'Pokemon not found' });

            const correctLetter = row.name[missingIndex];
            const isCorrect =
            letter.toLowerCase() === correctLetter.toLowerCase();

            const addScoreAndContinue = (newScore) => {
                db.get(`
                    SELECT * FROM pokemon
                    ORDER BY RANDOM()
                    LIMIT 1
                `, [], (err, newPokemon) => {

                    if (err || !newPokemon) {
                        return res.status(500).json({ error: 'Failed to get new pokemon' });
                    }

                    const { masked, index } = maskPokemonName(newPokemon.name);
                    console.log('Pokemon name', newPokemon.name)
                    res.json({
                        correct: isCorrect,
                        newScore,
                        nextPokemon: {
                            pokemonId: newPokemon.id,
                            maskedName: masked,
                            missingIndex: index
                        }
                    });
                });
            };

            if (isCorrect) {
                db.get(
                    "SELECT score FROM scores WHERE user_id = ?",
                    [userId],
                    (err, scoreRow) => {
                        const newScore = (scoreRow?.score || 0) + 10;

                        db.run(
                            `INSERT INTO scores (user_id, score)
                            VALUES (?, ?)
                            ON CONFLICT(user_id)
                            DO UPDATE SET score = excluded.score`,
                            [userId, newScore],
                            function(err) {
                                if (err) return res.status(500).json({ error: 'DB error' });
                                addScoreAndContinue(newScore);
                            }
                        );
                    }
                );
            } else {
                db.get(
                    "SELECT score FROM scores WHERE user_id = ?",
                    [userId],
                    (err, scoreRow) => {
                        const currentScore = scoreRow?.score || 0;
                        addScoreAndContinue(currentScore);
                    }
                );
            }
        });
    });

    app.post('/logout', (req, res) => {
        req.logout(() => {
            res.json({ message: 'Logged out' });
        });
    });

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
    res.status(401).json({ error: 'Unauthorized' });
    }

    app.post('/game/result', ensureAuthenticated, (req, res) => {
        const { score } = req.body;

        if (typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid score' });
        }

        db.run(
            `INSERT INTO scores (user_id, score) VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET score = excluded.score, updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, score],
            function(err) {
                if (err) return res.status(500).json({ error: 'DB error' });
                res.json({ success: true });
            }
        );
    });

    app.get('/game/pokemon/random', ensureAuthenticated, (req, res) => {
        db.get(`
            SELECT * FROM pokemon
            WHERE id NOT IN (
                SELECT pokemon_id FROM pokemon_usage WHERE user_id = ?
            )
            ORDER BY RANDOM()
            LIMIT 1
        `, [req.user.id], (err, row) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (!row) return res.status(404).json({ error: 'No unused pokemon left' });
            res.json(row);
        });
    });

    app.get('/game/leaderboard', (req, res) => {
        db.all(`
           SELECT users.name, scores.score
            FROM scores
            JOIN users ON users.id = scores.user_id
            ORDER BY scores.score DESC
            LIMIT 10
        `, [], (err, rows) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            res.json(rows);
        });
    });


    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    });
}

startServer();