import { CSSProperties, ComponentProps, FC, useEffect, useState } from 'react'
import { Dealer, DealerEvent } from '../../core/Dealer'
import { Card as CardType } from '../../core/Card'
import { DealerResult } from '../../core/PlayerResult'
import { Card } from '../card'
import styles from './hand.module.css'

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
        setCards((currentCards) => [...currentCards, ...CardType.parseAll(cards)])
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
      <div className={styles.sum}>{dealer.result.total}</div>
      {result?.busted && <div className="busted">BUSTED</div>}
      <div className={styles.hand} style={{ '--count': cards.length } as CSSProperties}>
        {cards.map((card, index) => (
          <Card key={card.toString()} card={card} style={{ '--index': index } as CSSProperties} />
        ))}
      </div>
    </div>
  )
}
