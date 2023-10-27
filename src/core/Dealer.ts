/**
 * Represents someone who plays the game.
 */

import { Deck } from './Deck'
import { Hand } from './Hand'
import { DealerResult } from './PlayerResult'

export class Dealer {
 
  name: string
  hand: Hand
  deck: Deck

  constructor(name: string, hand: Hand, deck: Deck) {
    this.name = name
    this.hand = hand
    this.deck = deck
  }

  play(target: number): DealerResult {
    const total = this.hand.total

    if (!target) return {
      dealer: true,
      total,
    }

    while (true) {
      if (this.hand.isBlackjack) return {
        dealer: true,
        winner: true,
        total,
      }
      if (this.hand.isBust) return {
        dealer: true,
        busted: true,
        total: 0,
      }
      if (total > target || total === target && total >= 17) return {
        dealer: true,
        winner: false,
        busted: false,
        total,
      }
      this.hand.hit(this.deck.draw())
    }
   
  }
}
