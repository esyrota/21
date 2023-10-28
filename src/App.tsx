import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { Player, PlayerEvent } from './core/Player'
import { Round, RoundEvent } from './core/Round'
import { Dealer } from './core/Dealer'
import { Deck } from './core/Deck'
import { PlayerHand } from './components/player-hand'
import { PlayerChoice } from './components/player-choice'
import { DealerHand } from './components/dealer-hand'
import { Announcement } from './components/announcement'

const PLAYER_NAME = 'You'
const DEALER_NAME = 'Dealer'
const BUSTED = 'Busted!'
const YOU_WIN = 'You win!'

function App() {
  const [deck, setDeck] = useState(() => new Deck())
  const [dealer, setDealer] = useState(() => new Dealer(DEALER_NAME, deck))
  const [player, setPlayer] = useState(() => new Player(PLAYER_NAME))
  const [round, setRound] = useState(() => new Round([player], deck, dealer))
  const [result, setResult] = useState<string>()
  const [isRoundRunning, setRoundRunning] = useState(false)

  const reset = useCallback(() => {
    setResult(undefined)
    setRoundRunning(false)
    const deck = new Deck()
    const dealer = new Dealer(DEALER_NAME, deck)
    const player = new Player(PLAYER_NAME)
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
      round.on(RoundEvent.WINNER, ({ data }) =>
        setResult(
          data.names.length > 1
            ? 'DRAW'
            : data.names[0] === DEALER_NAME
            ? `${DEALER_NAME} wins!`
            : YOU_WIN,
        ),
      ),
      round.on(RoundEvent.BUSTED, () => setResult(BUSTED)),
      player.on(PlayerEvent.MOVE_END, ({ data }) => {
        if (data.busted) setResult(BUSTED)
        if (data.winner) setResult(YOU_WIN)
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
          <Announcement>
            <h1>21</h1>
            <div className="options">
              <button onClick={() => round.play(1000)}>play</button>
            </div>
          </Announcement>
        </div>
      </div>
    )
  }

  return (
    <div className="table">
      <DealerHand className="dealer" dealer={dealer} />
      <div className="desk">
        {result ? (
          <Announcement>
            <h1>{result}</h1>
            <div className="options">
              <button onClick={reset}>OK</button>
            </div>
          </Announcement>
        ) : (
          <PlayerChoice player={player} />
        )}
      </div>
      <PlayerHand className="player" player={player} />
    </div>
  )
}

export default App
