import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { v4 as uuid } from 'uuid'

import { Lobby } from '../pages/Lobby'
import { app } from '../App'

interface Props {
  children?: React.ReactNode
}

type Lobby = {
  activePlayerId: string
  id: string
  players: string[]
}

const LobbyContext = React.createContext<Lobby>({ activePlayerId: '', id: '', players: [] })

const configuration = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

function registerPeerConnectionListeners(peerConnection: RTCPeerConnection) {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(`ICE gathering state changed: ${peerConnection.iceGatheringState}`)
  })

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`)
  })

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`)
  })

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(`ICE connection state change: ${peerConnection.iceConnectionState}`)
  })
}

const peerConnection = new RTCPeerConnection(configuration)
registerPeerConnectionListeners(peerConnection)

export const LobbyProvider: React.FC<Props> = ({ children }: Props) => {
  const { lobbyId } = useParams()
  const activePlayerId = useMemo(() => uuid(), [])
  const db = useMemo(() => getFirestore(app), [])

  const [players, setPlayers] = useState<string[]>([activePlayerId])

  const context = useMemo(
    () => ({
      activePlayerId,
      id: lobbyId,
      players,
    }),
    [activePlayerId, lobbyId, players],
  )

  // on mount we need to add the player to the lobby
  useEffect(() => {
    async function initLobby() {
      const lobbyCollection = await collection(db, 'rooms')
      const lobby = await doc(lobbyCollection, `${lobbyId}`)
      const lobbySnapshot = await getDoc(lobby)

      const dataChannel = peerConnection.createDataChannel(`trump-${lobby.id}`)
      dataChannel.addEventListener('message', (e) => console.log(e, 'message received'))

      const lobbyStatus = lobbySnapshot.data()
      console.log('lobby status:', lobbyStatus)

      // TODO: we need a better way to work out who connects first, and who connect after (probably by using a better
      //  provider structure):
      if (lobbyStatus) {
        peerConnection.addEventListener('datachannel', (event) => {
          const dataChannel = event.channel
          dataChannel.addEventListener('message', (m) => console.log(m, 'received message'))
          dataChannel.addEventListener('open', (o) => {
            console.log(o, 'channel opened')
            dataChannel.send(`hi, I am player ${activePlayerId}`)
          })
          dataChannel.addEventListener('close', (c) => {
            console.log(c, 'channel opened')
            dataChannel.send(`bye, I was player ${activePlayerId}`)
          })
        })

        const calleeCandidatesCollection = await collection(lobby, 'calleeCandidates')
        peerConnection.addEventListener('icecandidate', (event) => {
          if (!event.candidate) {
            console.log('Got final candidate!')
            return
          }
          console.log('Got candidate: ', event.candidate)
          addDoc(calleeCandidatesCollection, event.candidate.toJSON())
        })

        await peerConnection.setRemoteDescription(new RTCSessionDescription(lobbyStatus.offer))
        const answer = await peerConnection.createAnswer()
        console.log('Created answer:', answer)
        await peerConnection.setLocalDescription(answer)

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        }
        await updateDoc(lobby, roomWithAnswer)

        const callerCandidates = await collection(lobby, 'callerCandidates')
        onSnapshot(callerCandidates, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data()
              console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
              await peerConnection.addIceCandidate(new RTCIceCandidate(data))
            }
          })
        })
      } else {
        const candidates = await collection(lobby, 'callerCandidates')

        peerConnection.addEventListener('icecandidate', (event) => {
          if (!event.candidate) {
            console.log('Got final candidate!')
            return
          }
          console.log('Got candidate: ', event.candidate)
          addDoc(candidates, event.candidate.toJSON())
        })

        const offer = await peerConnection.createOffer()
        await peerConnection.setLocalDescription(offer)
        console.log('Created offer:', offer)

        const roomWithOffer = {
          offer: {
            type: offer.type,
            sdp: offer.sdp,
          },
        }
        await setDoc(lobby, roomWithOffer)

        peerConnection.addEventListener('datachannel', (event) => {
          const dataChannel = event.channel
          dataChannel.addEventListener('message', (m) => console.log(m, 'received message'))
          dataChannel.addEventListener('open', (o) => {
            console.log(o, 'channel opened')
            dataChannel.send(`hi, I am player ${activePlayerId}`)
          })
          dataChannel.addEventListener('close', (c) => {
            console.log(c, 'channel opened')
            dataChannel.send(`bye, I was player ${activePlayerId}`)
          })
        })

        onSnapshot(lobby, async (snapshot) => {
          const data = snapshot.data()
          if (!peerConnection.currentRemoteDescription && data && data.answer) {
            console.log('Got remote description: ', data.answer)
            const rtcSessionDescription = new RTCSessionDescription(data.answer)
            await peerConnection.setRemoteDescription(rtcSessionDescription)
          }
        })

        const calleeCandidatesCollection = await collection(lobby, 'calleeCandidates')
        onSnapshot(calleeCandidatesCollection, (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
              const data = change.doc.data()
              console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
              await peerConnection.addIceCandidate(new RTCIceCandidate(data))
            }
          })
        })
      }
    }

    initLobby()
  }, [activePlayerId, db, lobbyId])

  return <LobbyContext.Provider value={context}>{children}</LobbyContext.Provider>
}

export const useLobbyContext = () => React.useContext(LobbyContext)
