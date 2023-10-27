import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { Player, PlayerEvent } from './core/Player'
import { Round, RoundEvent } from './core/Round'
import { Dealer } from './core/Dealer'
import { Deck } from './core/Deck'
import { PlayerHand } from './components/player-hand'
import { PlayerChoice } from './components/player-choice'
import { DealerHand } from './components/dealer-hand'

function App() {
  const [deck, setDeck] = useState(() => new Deck())
  const [dealer, setDealer] = useState(() => new Dealer('dealer', deck))
  const [player, setPlayer] = useState(() => new Player('player1'))
  const [round, setRound] = useState(() => new Round([player], deck, dealer))
  const [result, setResult] = useState<string>()
  const [isRoundRunning, setRoundRunning] = useState(false)

  const reset = useCallback(() => {
    setResult(undefined)
    setRoundRunning(false)
    const deck = new Deck()
    const dealer = new Dealer('dealer', deck)
    const player = new Player('player1')
    setDeck(deck)
    setDealer(dealer)
    setPlayer(player)
    setRound(new Round([player], deck, dealer))
  }, [])

  useEffect(() => {
    const removeListeners = [
      round.addListener(({ event, data }) => console.log('round', event, data)),
      round.on(RoundEvent.START, () => setRoundRunning(true)),
      round.on(RoundEvent.END, () => setRoundRunning(false)),
      player.on(PlayerEvent.MOVE_END, ({ data }) => {
        if (data.busted) setResult('You lose')
        if (data.winner) setResult('You win!')
      }),
    ]
    return () => {
      removeListeners.forEach((remove) => remove())
    }
  }, [dealer, deck, player, round])

  if (!isRoundRunning) {
    return (
      <div className="table">
        <div className="desk">
          <h1>21</h1>
          <div className="options">
            <button onClick={() => round.play(1000)}>play</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="table">
      <div className="dealer"></div>
      <DealerHand className="dealer" dealer={dealer} />
      <div className="desk">
        {result ? (
          <>
            <h1>{result}</h1>
            <div className="options">
              <button onClick={reset}>OK</button>
            </div>
          </>
        ) : (
          <PlayerChoice player={player} />
        )}
      </div>
      <PlayerHand className="player" player={player} />
    </div>
  )
}

export default App
