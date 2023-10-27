/**
 * Represents someone who plays the game.
 */
import { delay } from './util'
import { Deck } from './Deck'
import { Hand } from './Hand'
// import { Card } from './Card'
import { DealerResult } from './PlayerResult'
import { Observable } from './Observable'

export const enum DealerEvent {
  /** triggered when a player receice cards (at the start of a round) */
  GOT_CARDS = 'got-cards',
  /** triggered when a player cards are taken away (at the end of a round) */
  RESET_CARDS = 'reset-cards',
  MOVE_START = 'move-start',
  MOVE_END = 'move-end',
}

type DealerEventData = {
  [DealerEvent.GOT_CARDS]: { cards: string }
  [DealerEvent.RESET_CARDS]: undefined
  [DealerEvent.MOVE_START]: void | null | undefined
  [DealerEvent.MOVE_END]: DealerResult
}

export class Dealer extends Observable<DealerEvent, DealerEventData> {
  name: string
  private hand: Hand
  deck: Deck

  constructor(name: string, deck: Deck, hand: Hand = new Hand()) {
    super()
    this.name = name
    this.hand = hand
    this.deck = deck
  }

  async play(timeout = 0): Promise<DealerResult> {
    this.trigger(DealerEvent.MOVE_START, undefined)
    await delay(timeout)
    while (!this.hand.isBlackjack && !this.hand.isBust && this.hand.total < 17) {
      this.hit()
      await delay(timeout)
    }
    this.trigger(DealerEvent.MOVE_END, this.result)
    return this.result
  }

  takeCards() {
    this.hit(2)
  }

  resetCards() {
    this.trigger(DealerEvent.RESET_CARDS, undefined)
    this.deck.add(this.hand.reset())
  }

  private hit(amount = 1) {
    const cards = this.deck.draw(amount)
    this.hand.hit(cards)
    this.trigger(DealerEvent.GOT_CARDS, { cards: cards.map((card) => card.toString()).join(',') })
  }

  get result(): DealerResult {
    return {
      dealer: true,
      winner: this.hand.isBlackjack,
      busted: this.hand.isBust,
      total: this.hand.total,
    }
  }
}
