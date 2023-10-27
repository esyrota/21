import { Card } from './Card'
import { Hand } from './Hand'

describe('Hand', () => {
  describe('.cardAmount', () => {
    test('empty -> 0', () => expect(new Hand().cardAmount).toBe(0))
    test('A♠︎,2♠︎ -> 2', () => expect(new Hand('A♠︎,2♠︎').cardAmount).toBe(2))
    test('A♠︎,5♠︎,5♦︎ -> 3', () => expect(new Hand('A♠︎,5♠︎,5♦︎').cardAmount).toBe(3))
  })

  describe('.cardString', () => {
    test('empty', () => expect(new Hand().cardString).toBe(''))
    test('A♠︎,A♦︎', () => expect(new Hand('A♠︎,A♦︎').cardString).toBe('A♠︎,A♦︎'))
    test('A♠︎,5♠︎,5♦︎', () =>
      expect(new Hand('A♠︎,5♠︎,5♦︎').cardString).toBe('A♠︎,5♠︎,5♦︎'))
  })

  describe('.isBlackjack', () => {
    test('A♠︎,2♠︎    -> false', () => expect(new Hand('A♠︎,2♠︎').isBlackjack).toBe(false))
    test('A♠︎,K♠︎    -> true ', () => expect(new Hand('A♠︎,K♠︎').isBlackjack).toBe(true))
    test('A♠︎,A♦︎    -> false', () => expect(new Hand('A♠︎,A♦︎').isBlackjack).toBe(false))
    test('A♠︎,5♠︎,5♦︎ -> false', () =>
      expect(new Hand('A♠︎,5♠︎,5♦︎').isBlackjack).toBe(false))
  })

  describe('.isBust', () => {
    test('A♠︎,A♦︎       -> false', () => expect(new Hand('A♠︎,A♦︎').isBust).toBe(false))
    test('A♠︎,5♠︎,5♦︎    -> false', () => expect(new Hand('A♠︎,5♠︎,5♦︎').isBust).toBe(false))
    test('K♠︎,J♠︎,5♦︎    -> true ', () => expect(new Hand('K♠︎,J♠︎,5♦︎').isBust).toBe(true))
    test('A♠︎,A♦︎,K♠︎,J♠︎ -> true ', () =>
      expect(new Hand('A♠︎,A♦︎,K♠︎,J♠︎').isBust).toBe(true))
  })

  describe('.total', () => {
    test('A♠︎,A♦︎     -> 12', () => expect(new Hand('A♠︎,A♦︎').total).toBe(12))
    test('A♠︎,K♠︎     -> 21', () => expect(new Hand('A♠︎,K♠︎').total).toBe(21))
    test('A♠︎,2♠︎     -> 13', () => expect(new Hand('A♠︎,2♠︎').total).toBe(13))
    test('A♠︎,5♠︎,5♦︎  -> 21', () => expect(new Hand('A♠︎,5♠︎,5♦︎').total).toBe(21))
    test('K♠︎,J♠︎,5♦︎  -> 0', () => expect(new Hand('K♠︎,J♠︎,5♦︎').total).toBe(0))
  })

  describe('.hit', () => {
    test('A♠︎,A♦︎ + A♣︎,A♥︎ -> A♠︎,A♦︎,A♣︎,A♥︎', () => {
      const hand = new Hand('A♠︎,A♦︎')
      const cards = Card.parseAll('A♣︎,A♥︎')
      expect(hand.hit(cards).cardString).toBe('A♠︎,A♦︎,A♣︎,A♥︎')
    })
  })

  describe('.reset', () => {
    test('returns all cards', () =>
      expect(new Hand('A♠︎,A♦︎').reset().join(',')).toBe('A♠︎,A♦︎'))
    test('becomes empty', () => {
      const hand = new Hand('A♠︎,A♦︎')
      hand.reset()
      expect(hand.cardAmount).toBe(0)
    })
  })
})
