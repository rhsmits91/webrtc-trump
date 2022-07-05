import { deserializeCard, getRoundWinner } from '../utils'
import { Suit } from '../types'

describe('utils', () => {
  test('› getRoundWinner › without trump highest rank wins', () => {
    const winner = getRoundWinner(
      [deserializeCard('♦2'), deserializeCard('♦Q'), deserializeCard('♦K'), deserializeCard('♦A')],
      Suit.Hearts,
    )

    expect(winner).toBe(3)
  })

  test('› getRoundWinner › trump wins against a higher rank', () => {
    const winner = getRoundWinner(
      [deserializeCard('♦Q'), deserializeCard('♥2'), deserializeCard('♦K'), deserializeCard('♦A')],
      Suit.Hearts,
    )

    expect(winner).toBe(1)
  })
})
