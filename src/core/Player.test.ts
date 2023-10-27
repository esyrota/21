import { Card } from './Card'
import { Hand } from './Hand'
import { Player, PlayerEvent } from './Player'

describe('Player', () => {
  describe('new Player()', () => {
    const player = new Player('John')
    test('instance', () => expect(player).toBeInstanceOf(Player))
    test('name', () => expect(player.name).toBe('John'))
    test('hand', () => expect(player.hand).toBeInstanceOf(Hand))
  })

  describe('.takeCards()', () => {
    test('add cards to a hand', () => {
      const hand = new Hand()
      new Player('John', hand).takeCards(Card.parseAll('A♠︎,A♦︎'))
      expect(hand.cardString).toBe('A♠︎,A♦︎')
    })
    test('triggers PlayerEvent.GOT_CARDS', () => {
      const player = new Player('John')
      const listener = jest.fn()
      player.once(PlayerEvent.GOT_CARDS, listener)
      player.takeCards(Card.parseAll('A♠︎,A♦︎'))
      expect(listener).toBeCalledWith({
        event: PlayerEvent.GOT_CARDS,
        data: { cards: 'A♠︎,A♦︎' },
      })
    })
  })

  describe('.play()', () => {
    test('blackjack: do not wait for a player move', async () => {
      const player = new Player('John')
      player.takeCards(Card.parseAll('A♠︎,K♦︎'))
      const listener = jest.fn()
      const remove = player.addListener(listener)
      await player.play()
      remove()
      expect(listener.mock.calls[0]).toEqual([{ event: PlayerEvent.MOVE_START, data: undefined }])
      expect(listener.mock.calls[1]).toEqual([
        {
          event: PlayerEvent.MOVE_END,
          data: { busted: false, name: 'John', total: 21, winner: true },
        },
      ])
    })

    test('ASK_CHOICE is called', async () => {
      const listener = jest.fn()
      const player = new Player('John')
      player.takeCards(Card.parseAll('Q♠︎,K♦︎'))
      player.on(PlayerEvent.ASK_CHOICE, listener)
      player.play()
      expect(listener).toBeCalledTimes(1)
      expect(listener).toBeCalledWith({ event: PlayerEvent.ASK_CHOICE })
    })

    test('CHOOSE_STAND is called', async () => {
      const listener = jest.fn()
      const player = new Player('John')
      player.takeCards(Card.parseAll('Q♠︎,K♦︎'))
      player.on(PlayerEvent.ASK_CHOICE, () => player.chooseStand())
      player.on(PlayerEvent.CHOOSE_STAND, listener)
      player.play()
      expect(listener).toBeCalledTimes(1)
    })

    // test('ASK_CHOICE is called twice', async () => {
    //   const listener = jest.fn()
    //   const player = new Player('John')
    //   player.takeCards(Card.parseAll('Q♠︎,7♦︎'))
    //   player.on(PlayerEvent.ASK_CHOICE, listener)
    //   player.once(PlayerEvent.ASK_CHOICE, () =>
    //     player.chooseHit().then(() => {
    //       player.takeCards(Card.parseAll('A♦︎'))
    //     })
    //   )
    //   player.play()
    //   expect(listener).toBeCalledTimes(1)
    // })

    test('MOVE_END is called', async () => {
      const listener = jest.fn()
      const player = new Player('John')
      player.takeCards(Card.parseAll('Q♠︎,K♦︎'))
      player.once(PlayerEvent.ASK_CHOICE, () => player.chooseStand())
      player.once(PlayerEvent.MOVE_END, listener)
      await player.play()
      expect(listener).toBeCalledTimes(1)
    })
  })
})
