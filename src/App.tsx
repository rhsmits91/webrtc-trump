import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { GameProvider } from './providers/GameProvider'
import { FullPage } from './components/StyledComponents'
import { Hand } from './components/Hand'
import { Home } from './pages/Home'
import { Lobby } from './pages/Lobby'

export function App() {
  const activePlayerId = 'Turo'
  const playerIds = ['Turo', 'Ron', 'Joost']

  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='/game'>
          <Route
            path=':gameId'
            element={
              <GameProvider activePlayerId={activePlayerId} playerIds={playerIds}>
                <FullPage>
                  <Hand />
                </FullPage>
              </GameProvider>
            }
          />
        </Route>
        <Route path='/lobby/:lobbyId' element={<Lobby />} />
      </Routes>
    </BrowserRouter>
  )
}
