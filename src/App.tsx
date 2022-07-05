import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { GameProvider } from './providers/GameProvider'
import { FullPage } from './components/StyledComponents'
import { Hand } from './components/Hand'
import { Home } from './pages/Home'
import { Lobby } from './pages/Lobby'
import { LobbyProvider } from './providers/LobbyProvider'

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// import { getAnalytics } from 'firebase/analytics'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyBN_pRH8pXQUWjpKotgROgh3tIaUtmLeMU',
  authDomain: 'webrtc-trump.firebaseapp.com',
  databaseURL: 'https://webrtc-trump-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'webrtc-trump',
  storageBucket: 'webrtc-trump.appspot.com',
  messagingSenderId: '277687330717',
  appId: '1:277687330717:web:2889defeb6ab9104edb174',
  measurementId: 'G-3986MNDBYT',
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)

export function App() {
  console.log(app, 'app')

  return (
    <BrowserRouter>
      <Routes>
        <Route path='' element={<Home />} />
        <Route path='/lobby'>
          <Route
            path=':lobbyId'
            element={
              <LobbyProvider>
                <Lobby />
              </LobbyProvider>
            }
          >
            <Route
              path='game'
              element={
                <GameProvider>
                  <FullPage>
                    <Hand />
                  </FullPage>
                </GameProvider>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
