import { CSSProperties, ComponentProps, FC, useEffect, useState } from 'react'
import { Dealer, DealerEvent } from '../../core/Dealer'
import { Card as CardType } from '../../core/Card'
import { DealerResult } from '../../core/PlayerResult'
import { Card } from '../card'

interface Props extends ComponentProps<'div'> {
  dealer: Dealer
}

export const DealerHand: FC<Props> = ({ dealer, ...props }) => {
  const [cards, setCards] = useState<CardType[]>([])
  const [result, setResult] = useState<DealerResult>()

  useEffect(() => {
    const removeListeners = [
      dealer.addListener(({ event, data }) => {
        console.log('dealer', event, data)
      }),
      dealer.on(DealerEvent.MOVE_END, ({ data }) => {
        setResult(data)
      }),
      dealer.on(DealerEvent.GOT_CARDS, ({ data: { cards } }) => {
        setCards(CardType.parseAll(cards))
      }),
      dealer.on(DealerEvent.RESET_CARDS, () => {
        setCards([])
        setResult(undefined)
      }),
    ]
    return () => {
      removeListeners.forEach((remove) => remove())
    }
  }, [dealer])

  return (
    <div {...props}>
      <div className="sum">Total: {dealer.result.total}</div>
      {result?.busted && <div className="busted">BUSTED</div>}
      <div className="cards" style={{ '--count': cards.length } as CSSProperties}>
        {cards.map((card, index) => (
          <Card
            key={card.toString()}
            card={card}
            className="card"
            style={{ '--index': index } as CSSProperties}
          />
        ))}
      </div>
    </div>
  )
}
