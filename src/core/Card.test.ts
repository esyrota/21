import { Card, CardCode } from './Card'

const pairs: [CardCode, number][] = [
  ['A♠︎', 1],
  ['2♦︎', 2],
  ['3♣︎', 3],
  ['4♥︎', 4],
  ['5♠︎', 5],
  ['6♦︎', 6],
  ['7♣︎', 7],
  ['8♥︎', 8],
  ['9♠︎', 9],
  ['10♦︎', 10],
  ['J♣︎', 10],
  ['Q♠︎', 10],
  ['K♥︎', 10],
]

describe('Card', () => {
  describe('parsing', () => {
    test('A♠︎  type is A ', () => expect(new Card('A♠︎').type).toBe('A'))
    test('A♠︎  suit is ♠︎ ', () => expect(new Card('A♠︎').suit).toBe('♠︎'))
    test('10♥︎ type is 10', () => expect(new Card('10♥︎').type).toBe('10'))
    test('10♥︎ suit is ♥︎ ', () => expect(new Card('10♥︎').suit).toBe('♥︎'))
  })

  describe('throws on invalid', () => {
    test('A', () => expect(() => { 
      // @ts-expect-error testing invalid input
      new Card('A') 
    }).toThrow())
  })

  describe(`values`, () => {
    for (const [card, value] of pairs) {
        test(`${card} value is ${value}`, () => expect(new Card(card).valueOf()).toBe(value))
    }
  })

  test('An ace is wild', () => {
    expect(new Card('A♠︎').isWild).toBe(true)
    expect(new Card('2♠︎').isWild).toBe(false)
  })

  test('.toString() results matches a card code', () => {
    expect(new Card('2♠︎').toString()).toBe('2♠︎')
    expect(new Card('10♦︎').toString()).toBe('10♦︎')
  })
})
