import { Deal } from '../trump'
import { decodeCard, deserializeCard, serializeCard } from '../utils'

const TEST_PLAYERS = ['Turo', 'Ron', 'Joost']
const TEST_CONFIG = { playerIds: TEST_PLAYERS, seed: 0, startingHandSize: 4 }

describe('trump › game › round', () => {
  test('› is deterministic', () => {
    const trump = new Deal(TEST_CONFIG)

    expect(trump.getHand('Turo').map(decodeCard).map(serializeCard)).toEqual([
      '♦8',
      '♠4',
      '♠K',
      '♦J',
    ])

    expect(trump.getHand('Ron').map(decodeCard).map(serializeCard)).toEqual([
      '♥3',
      '♦9',
      '♦Q',
      '♦K',
    ])

    expect(trump.getHand('Joost').map(decodeCard).map(serializeCard)).toEqual([
      '♥2',
      '♦5',
      '♣9',
      '♦2',
    ])

    expect(trump.getTrumpSuit()).toBe('♣')
  })

  test('› players can start by betting', () => {
    const trump = new Deal(TEST_CONFIG)

    trump.start().placeBet('Ron', 2).placeBet('Joost', 1).placeBet('Turo', 0)

    expect(trump.getBets()).toEqual({ Joost: 1, Ron: 2, Turo: 0 })
  })

  test('› players can start by betting › but the bet total cannot equal the starting hand size', () => {
    const trump = new Deal(TEST_CONFIG)

    try {
      trump.start().placeBet('Ron', 2).placeBet('Joost', 1).placeBet('Turo', 1)
    } catch (e) {
      expect((e as Error).message).toBe('Total of bets cannot equal the starting hand size!')
    }
  })

  test('› players can start by betting and then play cards', () => {
    const trump = new Deal(TEST_CONFIG)

    trump
      .start()

      .placeBet('Ron', 2)
      .placeBet('Joost', 1)
      .placeBet('Turo', 0)

      .playCard('Ron', deserializeCard('♦K'))

    expect(trump.getBets()).toEqual({ Joost: 1, Ron: 2, Turo: 0 })
  })

  test('› players can play a whole deal', () => {
    const trump = new Deal(TEST_CONFIG)

    trump
      .start()

      .placeBet('Ron', 2)
      .placeBet('Joost', 1)
      .placeBet('Turo', 0)

      .playCard('Ron', deserializeCard('♦K'))
      .playCard('Joost', deserializeCard('♦5'))
      .playCard('Turo', deserializeCard('♦J'))

      .playCard('Ron', deserializeCard('♦Q'))
      .playCard('Joost', deserializeCard('♦2'))
      .playCard('Turo', deserializeCard('♦8'))

      .playCard('Ron', deserializeCard('♦9'))
      .playCard('Joost', deserializeCard('♣9'))
      .playCard('Turo', deserializeCard('♠K'))

      .playCard('Joost', deserializeCard('♥2'))
      .playCard('Turo', deserializeCard('♠4'))
      .playCard('Ron', deserializeCard('♥3'))

    expect(trump.getBets()).toEqual({ Joost: 1, Ron: 2, Turo: 0 })
    expect(trump.getRoundsWon()).toEqual({ Joost: 1, Ron: 3, Turo: 0 })
  })
})
