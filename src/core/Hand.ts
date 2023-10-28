import { Card } from './Card'
/**
 *  Represents a hand of cards. It is able to:
 *  - take a card
 *  - get the sum of cards
 */
export class Hand {
  private cards: Card[] = []

  constructor(str?: string) {
    if (str) this.hit(Card.parseAll(str))
  }

  get total() {
    return this.isBust ? 0 : this.isBlackjack ? 21 : this.sum
  }

  get isBust(): boolean {
    return this.sum > 21
  }
  get isBlackjack(): boolean {
    return this.cards.length === 2 && this.sum === 21
  }

  hit(cards: Card[]) {
    this.cards.push(...cards)
    return this
  }

  reset(): Card[] {
    const cards = [...this.cards]
    this.cards = []
    return cards
  }

  private get sum() {
    // get the minimum possible score
    const sum = this.getMinTotal()
    // we can only use one ace as 11 (22 would bust)
    // so we only check extra 10 once
    if (this.hasWilds() && sum + 10 <= 21) {
      return sum + 10
    }
    return sum
  }

  // check if there are any wild cards
  private hasWilds() {
    return this.cards.some((card) => card.isWild)
  }

  // get the minimum possible score
  private getMinTotal() {
    return this.cards.reduce((sum, card) => sum + card.valueOf(), 0)
  }

  get cardAmount() {
    return this.cards.length
  }
  get cardString() {
    return this.cards.join(',')
  }
}
