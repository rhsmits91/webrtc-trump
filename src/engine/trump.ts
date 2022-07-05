import shuffle from 'knuth-shuffle-seeded'
import { getRoundWinner, getSuit, range } from './utils'
import { EncodedCard, Suit } from './types'

class Round {
  cards: Record<string, EncodedCard>
  openingPlayerId: string

  constructor(openingPlayerId: string) {
    this.cards = {}
    this.openingPlayerId = openingPlayerId
  }

  getRoundWinnerPlayerId(state: State): string {
    const playerIdsOrderedFromRoundStart = state.getPlayerIdsOrderedFromRoundStart()
    const roundWinningPlayerIndex = getRoundWinner(
      playerIdsOrderedFromRoundStart.map((playerId) => this.cards[playerId]),
      getSuit(state.trumpCard),
    )
    return playerIdsOrderedFromRoundStart[roundWinningPlayerIndex]
  }

  openedSuit(): Suit | null {
    const openedCard = this.cards[this.openingPlayerId]
    if (openedCard == null) return null
    return getSuit(openedCard)
  }
}

class State {
  bets: Record<string, number>
  config: Config
  currentPlayerId: string
  hands: Record<string, EncodedCard[]>
  rounds: Round[]
  startingPlayerId: string
  trumpCard: EncodedCard

  constructor(config: Config) {
    this.bets = {}
    this.config = config

    const deck = shuffle(range(51), config.seed)

    this.hands = {}
    config.playerIds.forEach((playerId) => {
      this.hands[playerId] = deck.splice(0, this.config.startingHandSize)
    })

    const trumpCard = deck.pop()
    if (trumpCard == null) {
      throw Error('Not enough cards!')
    }
    this.trumpCard = trumpCard

    this.startingPlayerId = shuffle([...config.playerIds], config.seed + 1)[0]
    this.currentPlayerId = this.startingPlayerId

    this.rounds = []
  }

  getActiveRound(): Round {
    if (this.rounds.length === 0) {
      throw Error('Game has not started yet - not all bets have been made!')
    }

    return this.rounds[this.rounds.length - 1]
  }

  getNextPlayerId(): string {
    const playerIds = this.config.playerIds
    const currentPlayerIndex = playerIds.indexOf(this.currentPlayerId)
    const nextPlayerIndex = (currentPlayerIndex + 1) % playerIds.length
    return playerIds[nextPlayerIndex]
  }

  getPlayerIdsOrderedFromRoundStart(): string[] {
    const { playerIds } = this.config
    const startingPlayerIndex = playerIds.indexOf(this.getActiveRound().openingPlayerId)
    return [...playerIds.slice(startingPlayerIndex), ...playerIds.slice(0, startingPlayerIndex)]
  }

  placeBet(playerId: string, bet: number): State {
    if (this.rounds.length) {
      throw Error('Game has started - all bets are already made!')
    }

    if (playerId !== this.currentPlayerId) {
      throw Error('It is someone else their turn!')
    }

    const nextPlayerId = this.getNextPlayerId()
    const isLastBet = nextPlayerId == this.startingPlayerId
    if (isLastBet) {
      const total = Object.values(this.bets).reduce((acc, b) => acc + b, 0)
      if (total + bet === this.config.startingHandSize) {
        throw Error('Total of bets cannot equal the starting hand size!')
      }
      this.rounds.push(new Round(this.startingPlayerId))
    }

    this.bets[playerId] = bet
    this.currentPlayerId = nextPlayerId
    return this
  }

  playCard(playerId: string, card: EncodedCard): State {
    const round = this.getActiveRound()

    if (playerId !== this.currentPlayerId) {
      throw Error('It is someone else their turn!')
    }

    const hand = this.hands[this.currentPlayerId]
    if (!hand.includes(card)) {
      throw Error('Illegal card played!')
    }

    const suits = hand.map(getSuit)
    const openedSuit = round.openedSuit()
    const playedSuit = getSuit(card)
    if (openedSuit != null && openedSuit !== playedSuit && suits.includes(openedSuit)) {
      throw Error('Player should follow round opening suit!')
    }

    const nextPlayerId = this.getNextPlayerId()
    hand.splice(hand.indexOf(card), 1)
    round.cards[playerId] = card
    if (nextPlayerId == round.openingPlayerId) {
      const roundWinningPlayerId = round.getRoundWinnerPlayerId(this)
      this.currentPlayerId = roundWinningPlayerId

      if (hand.length) {
        this.rounds.push(new Round(roundWinningPlayerId))
      }
    } else {
      this.currentPlayerId = nextPlayerId
    }

    return this
  }
}

type Config = {
  startingHandSize: number
  playerIds: string[]
  seed: number
}

class Deal {
  private readonly state

  constructor(config: Config) {
    this.state = new State(config)
  }

  getBets() {
    return this.state.bets
  }

  getHand(playerId: string) {
    return this.state.hands[playerId]
  }

  getRoundsWon(): Record<string, number> {
    const score = Object.fromEntries(this.state.config.playerIds.map((id) => [id, 0]))
    this.state.rounds.forEach((round) => {
      score[round.getRoundWinnerPlayerId(this.state)] += 1
    })
    return score
  }

  getTrumpSuit() {
    return getSuit(this.state.trumpCard)
  }

  start() {
    return this.state
  }
}

export { Deal }
