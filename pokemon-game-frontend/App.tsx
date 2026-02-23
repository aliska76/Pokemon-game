import { useEffect, useState } from 'react'
import pokemonLogo from './assets/pokemon.svg'
import './App.css'

interface StartGameResponse {
  pokemonId: number
  maskedName: string
  missingIndex: number
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [letter, setLetter] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [pokemon, setPokemon] = useState<StartGameResponse | null>(null)

  useEffect(() => {
    fetch('http://localhost:3000/me', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log('Current user:', data);
      });
  }, []);

  async function startGame() {
    const res = await fetch('http://localhost:3000/game/start', {
      credentials: 'include'
    })

    if (!res.ok) {
      console.error(await res.json())
      return
    }

    const data: StartGameResponse = await res.json()
    console.log('maskedName',data)
    setPokemon(data)
    setIsPlaying(true)
    setResult(null)
    setLetter('')
  }

  async function submitGuess() {
    if (!pokemon) return

    const res = await fetch('http://localhost:3000/game/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        pokemonId: pokemon.pokemonId,
        letter,
        missingIndex: pokemon.missingIndex
      })
    })

    const data = await res.json()

    if (data.correct) {
      setResult('Correct!')
    } else {
      setResult('Wrong letter')
    }

    setScore(data.newScore)

    setTimeout(() => {
      setPokemon(data.nextPokemon)
      setLetter('')
      setResult(null)
    }, 1000)
  }

  return (
    <div className="App">
      <button className='login' onClick={() => {
        window.location.href = 'http://localhost:3000/auth/google';
      }}>
        Login with Google
      </button>

      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={pokemonLogo} className="logo" alt="Pokemon logo" />
        </a>
      </div>

      <h1>Pokemon Missing Letters</h1>

      {!isPlaying && <button onClick={startGame}>
        Start Game
        </button>}
      {isPlaying && pokemon && (
        <div>
          <h2>{pokemon.maskedName}</h2>
          
          <input
            maxLength={1}
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Enter letter"
          />

          <button onClick={submitGuess}>Submit</button>

          {result && <p>{result}</p>}
        </div>
      )}

      <p>Score: {score}</p>
    </div>
  )
}

export default App