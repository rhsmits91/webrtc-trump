import React from 'react'
import { collection, doc, getFirestore } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

import { Button, FullPage, Header } from '../components/StyledComponents'
import { app } from '../App'

export function Home(): JSX.Element {
  const navigate = useNavigate()
  const db = getFirestore(app)

  console.log(db, 'db')

  return (
    <FullPage>
      <Header>Welcome to trump the game</Header>
      <div>
        <Button
          onClick={async () => {
            // TODO: for the creator of a lobby we should not drop and requiry the lobby when we're navigating to the
            //  lobby URL (probably by adding a FirebaseProvider or so):
            const lobbyCollection = await collection(db, 'rooms')
            const lobby = doc(lobbyCollection)
            navigate(`/lobby/${lobby.id}`)
          }}
        >
          Create game
        </Button>
        <Button>Join game</Button>
      </div>
    </FullPage>
  )
}
