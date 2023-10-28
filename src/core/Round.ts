/**
 * Represents a round of the game.
 */
import { delay } from './util'
import { CardCode } from './Card'
import { Dealer } from './Dealer'
import { Deck } from './Deck'
import { Observable } from './Observable'
import { Player, PlayerEvent } from './Player'
import {
  PlayerResult,
  Result,
  findBlackjackResult,
  getMaximumTotal,
  isPlayerResult,
  resultsBusted,
  resultsHasBlackjack,
} from './PlayerResult'

export const enum RoundEvent {
  START = 'start',
  UPDATE = 'update',
  WINNER = 'winner',
  BUSTED = 'busted',
  END = 'end',
}
interface RoundState {
  players: { name: string; cardsAmount: number; active: boolean; cards?: CardCode[] }[]
  dealer: { name: string; cardsAmount: number; active: boolean; cards?: CardCode[] }
  deck: { cardsAmount: number }
}

type RoundEventData = {
  [RoundEvent.START]: {
    players: { name: string; cardsAmount: number; active: boolean }[]
    dealer: { name: string; cardsAmount: number; active: boolean }
    deck: { cardsAmount: number }
  }
  [RoundEvent.UPDATE]: RoundState
  [RoundEvent.WINNER]: { names: string[] }
  [RoundEvent.BUSTED]: undefined
  [RoundEvent.END]: undefined
}

export class Round extends Observable<RoundEvent, RoundEventData> {
  private deck: Deck
  private dealer: Dealer
  private players: Player[]

  constructor(players: Player[], deck: Deck = new Deck(), dealer = new Dealer('Dealer', deck)) {
    super()
    this.players = players
    this.deck = deck
    this.dealer = dealer
  }

  private start() {
    this.trigger(RoundEvent.START, {
      players: this.players.map((player) => ({
        name: player.name,
        cardsAmount: 0,
        active: false,
      })),
      dealer: {
        name: this.dealer.name,
        cardsAmount: 0,
        active: false,
      },
      deck: {
        cardsAmount: this.deck.amount,
      },
    })
  }

  // play a round of the game
  async play(timeout: number = 0) {
    this.reset()
    this.start()
    await delay(timeout)
    await this.deal(timeout)
    await delay(timeout)
    const results = await this.playPlayers(timeout)

    if (resultsHasBlackjack(results)) {
      this.declareWinner(results)
      return
    }

    await delay(timeout)
    const dealerResult = await this.dealer.play(timeout)
    await delay(timeout)

    if (resultsBusted(results)) {
      this.declareBusted()
    } else {
      this.declareWinner([...results, dealerResult])
    }
  }

  private reset() {
    this.deck.reset()
    this.players.forEach((player) => player.resetCards())
    this.dealer.resetCards()
  }

  // deal cards to all players
  private async deal(timeout: number = 0) {
    for await (const player of this.players) {
      player.takeCards(this.deck.draw(2))
      await delay(timeout)
    }
    this.dealer.takeCards()
  }

  private async listenPlayer(player: Player, timeout = 0): Promise<PlayerResult> {
    return await new Promise((resolve) => {
      const destructors = [
        player.on(PlayerEvent.CHOOSE_HIT, () => {
          player.takeCards(this.deck.draw())
        }),
        player.on(PlayerEvent.CHOOSE_STAND, () => {
          destructors.forEach((destructor) => destructor())
          resolve(player.result)
        }),
        player.on(PlayerEvent.DISCONNECT, () => {
          destructors.forEach((destructor) => destructor())
          resolve(player.result)
        }),
      ]
      return player.play(timeout)
    })
  }

  // play all players
  private async playPlayers(timeout = 0) {
    const results: PlayerResult[] = []
    for await (const player of this.players) {
      const result = await this.listenPlayer(player, timeout)
      results.push(result)
      if (result.winner) return results
    }
    return results
  }

  private declareWinner(results: Result[]) {
    const blackjack = findBlackjackResult(results)
    if (blackjack) {
      this.trigger(RoundEvent.WINNER, {
        names: [isPlayerResult(blackjack) ? blackjack.name : this.dealer.name],
      })
      return
    }
    const bestResult = getMaximumTotal(results)
    const winners = results.filter((result) => !result.busted && result.total === bestResult)

    this.trigger(RoundEvent.WINNER, {
      names: winners.map((result) => (isPlayerResult(result) ? result.name : this.dealer.name)),
    })
  }

  private declareBusted() {
    this.trigger(RoundEvent.BUSTED, undefined)
  }

  end() {
    this.reset()
    this.trigger(RoundEvent.END, undefined)
  }
}
