import { Card, EncodedCard, Suit } from './types'

export function decodeCard(id: EncodedCard): Card {
  return {
    id,
    rank: id % 13,
    suit: getSuit(id),
  }
}

export function deserializeCard(text: string): EncodedCard {
  const suit = text.slice(0, 1)
  const rank = text.slice(1)
  switch (suit) {
    case Suit.Clubs:
      return deserializeRank(rank)
    case Suit.Diamonds:
      return deserializeRank(rank) + 13
    case Suit.Hearts:
      return deserializeRank(rank) + 26
    case Suit.Spades:
      return deserializeRank(rank) + 39
    default:
      throw Error('Could not deserialize card!')
  }
}

export function deserializeRank(text: string): number {
  switch (text) {
    case 'J':
      return 9
    case 'Q':
      return 10
    case 'K':
      return 11
    case 'A':
      return 12
    default:
      return parseInt(text) - 2
  }
}

export function getRoundWinner(cards: EncodedCard[], trumpSuit: Suit): number {
  const decoded = cards.map(decodeCard)

  let [winningCard, winningIndex] = [decoded[0], 0]
  decoded.slice(1).forEach((card, index) => {
    if (
      (winningCard.suit === card.suit && winningCard.rank < card.rank) ||
      card.suit === trumpSuit
    ) {
      ;[winningCard, winningIndex] = [card, index + 1]
    }
  })

  return winningIndex
}

export function getSuit(id: EncodedCard): Suit {
  switch (Math.floor(id / 13)) {
    case 0:
      return Suit.Clubs
    case 1:
      return Suit.Diamonds
    case 2:
      return Suit.Hearts
    default:
      return Suit.Spades
  }
}

export function range(n: number): number[] {
  return [...Array(n).keys()]
}

export function serializeCard(card: Card): string {
  return `${card.suit}${serializeRank(card.rank)}`
}

export function serializeRank(id: number): string {
  switch (id) {
    case 9:
      return 'J'
    case 10:
      return 'Q'
    case 11:
      return 'K'
    case 12:
      return 'A'
    default:
      return (id + 2).toString()
  }
}
