enum Suit {
  Clubs = '♣',
  Diamonds = '♦',
  Hearts = '♥',
  Spades = '♠',
}

type EncodedCard = number

type Card = {
  id: EncodedCard
  rank: number
  suit: Suit
}

export { Suit }
export type { Card, EncodedCard }
