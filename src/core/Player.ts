/**
 * Represents someone who plays the game.
 */

import { PlayerResult } from 'core/PlayerResult'
import { Card } from './Card'
import { Hand } from './Hand'
import { Observable } from './Observable'
import { delay } from './util'
// import { delay } from 'core/util'

export const enum PlayerEvent {
  /** triggered when a player receice cards (at the start of a round) */
  GOT_CARDS = 'got-cards',
  /** triggered when a player cards are taken away (at the end of a round) */
  RESET_CARDS = 'reset-cards',

  MOVE_START = 'move-start',
  MOVE_END = 'move-end',

  ASK_CHOICE = 'ask_choice',
  CHOOSE_STAND = 'choose_stand',
  CHOOSE_HIT = 'choose_hit',

  DISCONNECT = 'disconnect',
}
export const enum PlayerChoise {
  HIT = 'hit',
  STAND = 'stand',
}
type PlayerEventData = {
  [PlayerEvent.GOT_CARDS]: { cards: string }
  [PlayerEvent.RESET_CARDS]: undefined
  [PlayerEvent.MOVE_START]: void | null | undefined
  [PlayerEvent.MOVE_END]: PlayerResult
  [PlayerEvent.ASK_CHOICE]: void | null | undefined
  [PlayerEvent.CHOOSE_STAND]: void | null | undefined
  [PlayerEvent.CHOOSE_HIT]: void | null | undefined
  [PlayerEvent.DISCONNECT]: void | null | undefined
}

export class Player extends Observable<PlayerEvent, PlayerEventData> {
  name: string
  hand: Hand

  constructor(name: string, hand: Hand = new Hand()) {
    super()
    this.name = name
    this.hand = hand
  }

  resetCards() {
    this.trigger(PlayerEvent.RESET_CARDS, undefined)
    return this.hand.reset()
  }

  takeCards(cards: Card[]) {
    this.hand.hit(cards)
    this.trigger(PlayerEvent.GOT_CARDS, { cards: this.hand.cardString })
  }

  private terminate(): never {
    this.trigger(PlayerEvent.DISCONNECT, null)
    throw new Error('DISCONNECTED')
  }

  private get isResultDefined() {
    return this.hand.isBlackjack || this.hand.isBust
  }

  private async doChoice(timeout = 0): Promise<void> {
    if (this.isResultDefined) return
    const choice = await this.askChoise()
    if (choice === PlayerChoise.HIT) {
      await delay(timeout)
      return this.doChoice(timeout)
    }
  }

  get result(): PlayerResult {
    return {
      name: this.name,
      winner: this.hand.isBlackjack,
      busted: this.hand.isBust,
      total: this.hand.total,
    }
  }

  async play(timeout = 0): Promise<PlayerResult> {
    this.trigger(PlayerEvent.MOVE_START, undefined)
    if (!this.hand.cardAmount) return this.terminate()
    await this.doChoice(timeout)
    this.trigger(PlayerEvent.MOVE_END, this.result)
    return this.result
  }

  chooseStand() {
    this.trigger(PlayerEvent.CHOOSE_STAND, null)
  }

  async chooseHit(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      Promise.race([this.wait(PlayerEvent.GOT_CARDS), this.wait(PlayerEvent.DISCONNECT)]).then(
        ({ event, data }) =>
          event === PlayerEvent.DISCONNECT ? reject('DISCONNECT') : resolve(data.cards),
      )
      this.trigger(PlayerEvent.CHOOSE_HIT, null)
    })
  }

  private askChoise(): Promise<PlayerChoise> {
    return new Promise((resolve, reject) => {
      // first, subscribe to events
      this.race([PlayerEvent.CHOOSE_STAND, PlayerEvent.CHOOSE_HIT, PlayerEvent.DISCONNECT]).then(
        ({ event }) => {
          if (event === PlayerEvent.CHOOSE_STAND) return resolve(PlayerChoise.STAND)
          if (event === PlayerEvent.CHOOSE_HIT) return resolve(PlayerChoise.HIT)
          reject(new Error(event === PlayerEvent.DISCONNECT ? 'DISCONNECT' : 'UNEXPECTED'))
        },
      )
      // then, trigger the event
      this.trigger(PlayerEvent.ASK_CHOICE, undefined)
    })
  }
}
