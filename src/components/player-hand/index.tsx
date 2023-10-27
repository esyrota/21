import { CSSProperties, ComponentProps, FC, useEffect, useState } from 'react'
import { Player, PlayerEvent } from '../../core/Player'
import { Card as CardType } from '../../core/Card'
import { Card } from '../card'
import styles from './hand.module.css'

interface Props extends ComponentProps<'div'> {
  player: Player
}

export const PlayerHand: FC<Props> = ({ player, ...props }) => {
  const [cards, setCards] = useState<CardType[]>([])

  useEffect(() => {
    const removeListeners = [
      player.addListener(({ event, data }) => {
        console.log('player', event, data)
      }),
      player.on(PlayerEvent.GOT_CARDS, ({ data: { cards } }) => {
        setCards(CardType.parseAll(cards))
      }),
      player.on(PlayerEvent.RESET_CARDS, () => {
        setCards([])
      }),
    ]
    return () => {
      removeListeners.forEach((remove) => remove())
    }
  }, [player])

  return (
    <div {...props}>
      <div className={styles.hand} style={{ '--count': cards.length } as CSSProperties}>
        {cards.map((card, index) => (
          <Card
            key={card.toString()}
            card={card}
            className="card"
            style={{ '--index': index } as CSSProperties}
          />
        ))}
      </div>
      {cards.length > 0 && <div className="sum">Total: {player.result.total}</div>}
    </div>
  )
}
