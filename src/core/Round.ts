/**
 * Represents a round of the game.
 */

import { CardCode } from './Card'
import { Dealer } from './Dealer'
import { Deck } from './Deck'
import { Hand } from './Hand'
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
  [RoundEvent.START]: any
  [RoundEvent.UPDATE]: RoundState
  [RoundEvent.WINNER]: { names: string[] }
  [RoundEvent.BUSTED]: RoundState
  [RoundEvent.END]: any
}

export class Round extends Observable<RoundEvent, RoundEventData> {
  private deck: Deck
  private dealer: Dealer
  private players: Player[]

  constructor(players: Player[], deck: Deck = new Deck()) {
    super()
    this.players = players
    this.deck = deck
    this.dealer = new Dealer('Dealer', new Hand(), deck)
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
  async play() {
    this.start()
    this.deal()

    const results = await this.playPlayers()

    if (resultsHasBlackjack(results)) {
      this.declareWinner(results)
    }

    const dealerResult = await this.dealer.play(getMaximumTotal(results))

    if (resultsBusted(results)) {
      this.declareBusted()
    } else {
      this.declareWinner([...results, dealerResult])
    }

    this.end()
  }

  // deal cards to all players
  async deal() {
    for await (const player of this.players) {
      player.takeCards(this.deck.draw(2))
    }
    this.dealer.hand.hit(this.deck.draw(2))
  }

  private async listenPlayer(player: Player): Promise<PlayerResult> {
    player.play()
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
    })
  }

  // play all players
  private async playPlayers() {
    const results: PlayerResult[] = []
    for await (const player of this.players) {
      const result = await this.listenPlayer(player)
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
      names: winners.map((result) =>
        isPlayerResult(result) ? result.name : this.dealer.name,
      ),
    })
  }

  private declareBusted() {}

  private end() {
    this.trigger(RoundEvent.END, undefined)
    this.players.forEach((player) => player.hand.reset())
    this.deck.reset()
  }
}
