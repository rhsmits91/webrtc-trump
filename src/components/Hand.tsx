import React, { useState } from 'react'
import { Card } from './Card'
import { useGameContext } from '../providers/GameProvider'

enum HandSorting {
  SuitFirst,
  RankFirst,
}

export function Hand(): JSX.Element {
  const { canPlay, hand } = useGameContext()

  const [sorting, setSorting] = useState<HandSorting>(HandSorting.SuitFirst)

  const toggleSorting = () => {
    setSorting(sorting === HandSorting.SuitFirst ? HandSorting.RankFirst : HandSorting.SuitFirst)
  }

  switch (sorting) {
    case HandSorting.RankFirst: {
      hand.sort((c1, c2) => (c1.rank === c2.rank ? c1.id - c2.id : c1.rank - c2.rank))
      break
    }
    case HandSorting.SuitFirst: {
      hand.sort((c1, c2) => c1.id - c2.id)
      break
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      {hand.map((card) => (
        <Card card={card} disabled={canPlay()} key={JSON.stringify(card)} />
      ))}
      <div onClick={toggleSorting} style={{ color: '#e7e7e7', marginLeft: 16 }}>
        Change sorting
      </div>
    </div>
  )
}
