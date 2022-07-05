import React from 'react'
import { Button, FullPage, Header } from '../components/StyledComponents'
import { useNavigate } from 'react-router-dom'

import { v4 as uuid } from 'uuid'

export function Home(): JSX.Element {
  const navigate = useNavigate()

  return (
    <FullPage>
      <Header>Welcome to trump the game</Header>
      <div>
        <Button onClick={() => navigate(`/lobby/${uuid()}`)}>Create game</Button>
        <Button>Join game</Button>
      </div>
    </FullPage>
  )
}
