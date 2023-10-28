import { Card } from './Card'
import { Observable } from './Observable'

export const enum DeckEvent {
  EMPTY = 'empty',
  SHUFFLE = 'shuffle',
  RESET = 'reset',
  AMOUNT = 'amount',
}

type DeckEventData = {
  [DeckEvent.EMPTY]: undefined
  [DeckEvent.SHUFFLE]: { amount: number }
  [DeckEvent.AMOUNT]: { amount: number }
  [DeckEvent.RESET]: { amount: number }
}

export class Deck extends Observable<DeckEvent, DeckEventData> {
  private cards: Card[]
  constructor(cards: Card[] = Card.all) {
    super()
    this.cards = cards
    this.doShuffle()
    this.trigger(DeckEvent.RESET, this.state)
  }

  get amount() {
    return this.cards.length
  }

  get state() {
    return { amount: this.cards.length }
  }

  add(cards: Card[]) {
    this.cards.push(...cards)
    return this
  }

  // shuffle the deck
  shuffle() {
    this.doShuffle()
    this.trigger(DeckEvent.SHUFFLE, this.state)
    return this
  }

  draw(amount: number = 1): Card[] {
    if (!this.hasCards(amount)) {
      this.trigger(DeckEvent.EMPTY, undefined)
      throw new Error('no cards left')
    }
    const cards = this.shiftCards(amount)
    this.trigger(DeckEvent.AMOUNT, this.state)
    if (!this.hasCards()) this.trigger(DeckEvent.EMPTY, undefined)

    return cards
  }

  reset(cards: Card[] = Card.all): Card[] {
    const result = [...this.cards]
    this.cards = cards
    this.doShuffle()
    this.trigger(DeckEvent.RESET, this.state)
    this.trigger(DeckEvent.AMOUNT, this.state)
    return result
  }

  private shiftCards(amount: number): Card[] {
    return Array.from({ length: amount }, () => this.cards.shift()!)
  }

  private doShuffle() {
    this.cards.sort(() => Math.random() - 0.5)
  }

  private hasCards(length = 1): boolean {
    return this.cards.length >= length
  }
}
