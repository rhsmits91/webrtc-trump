import { Card, EncodedCard } from '../engine/types'
import React, { useContext, useMemo, useState } from 'react'
import { Deal } from '../engine/trump'
import { thisHookAlsoDependsOn } from '../utils/thisHookAlsoDependsOn'
import { decodeCard } from '../engine/utils'
import { useLobbyContext } from './LobbyProvider'

interface Props {
  children: React.ReactNode
}

interface Game {
  canPlay: () => boolean
  hand: Card[]
  placeBet: (bet: number) => void
  playCard: (card: EncodedCard) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NO_OP = () => {}

const GameContext = React.createContext<Game>({
  canPlay: () => false,
  hand: [],
  placeBet: NO_OP,
  playCard: NO_OP,
})

const GameProvider: React.FC<Props> = ({ children }: Props) => {
  const { activePlayerId, players: playerIds } = useLobbyContext()

  const [version, setVersion] = useState<number>(0)
  const triggerUpdate = () => setVersion((prev) => prev + 1)

  const deal = useMemo(() => new Deal({ playerIds, seed: 0, startingHandSize: 4 }), [playerIds])
  const mutateDeal = useMemo(() => deal.start(), [deal])

  const context = useMemo(() => {
    thisHookAlsoDependsOn(version)

    return {
      canPlay() {
        return mutateDeal.currentPlayerId === activePlayerId && mutateDeal.rounds.length > 0
      },
      hand: mutateDeal.hands[activePlayerId].map(decodeCard),
      placeBet(bet: number) {
        mutateDeal.placeBet(activePlayerId, bet)
        triggerUpdate()
      },
      playCard(card: EncodedCard) {
        mutateDeal.playCard(activePlayerId, card)
        triggerUpdate()
      },
    }
  }, [activePlayerId, mutateDeal, version])

  return <GameContext.Provider value={context}>{children}</GameContext.Provider>
}

const useGameContext = () => useContext(GameContext)
export { useGameContext, GameProvider }
