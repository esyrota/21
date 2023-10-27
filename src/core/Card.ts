export const TYPES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const
export const SUITS = ['♠︎', '♥︎', '♦︎', '♣︎'] as const

export type Type = (typeof TYPES)[number]
export type Suit = (typeof SUITS)[number]
export type CardCode = `${Type}${Suit}`

export class Card {
  static parseAll(str: string): Card[] {
    return str.split(',').map((code) => new Card(code as CardCode))
  }
  static get all(): Card[] {
    return TYPES.flatMap((type) => SUITS.map((suit) => new Card(`${type}${suit}`)))
  }

  readonly type: Type
  readonly suit: Suit

  constructor(code: CardCode) {
    if (!code || typeof code !== 'string') throw new Error('Card code is not a string')
    const [_, t, s] = /^(A|2|3|4|5|6|7|8|9|10|J|Q|K)(♠︎|♥︎|♦︎|♣︎)$/.exec(code) ?? []
    if (!t || !s) throw new Error(`Invalid card code: ${code}`)
    this.type = t as Type
    this.suit = s as Suit
  }

  get isWild(): boolean {
    return this.type === 'A'
  }

  valueOf(): number {
    if (this.type === 'A') return 1
    if (['J', 'Q', 'K'].includes(this.type)) return 10
    return parseInt(this.type, 10)
  }

  toString(): string {
    return `${this.type}${this.suit}`
  }
}
