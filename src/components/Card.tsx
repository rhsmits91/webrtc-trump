import React from 'react'
import styled, { css } from 'styled-components'

import { serializeCard } from '../engine/utils'
import { Card as CardType, Suit } from '../engine/types'

interface Props {
  card: CardType
  color?: string
  disabled?: boolean
  narrow?: boolean
}

const Layout = styled.div<Props>`
  position: relative;
  box-sizing: border-box;
  color: ${({ color }) => color};
  height: 88px;
  width: 68px;

  cursor: pointer;

  margin-left: 8px;
  padding: 4px;

  border-radius: 8px;
  background: #e7e7e7;

  &:hover {
    box-shadow: 0px 0px 10px 0px rgb(215 215 215);

    ${({ narrow }) =>
      !narrow &&
      css`
        svg {
          filter: drop-shadow(0px 0px 8px #e5de6c);
        }
      `}
  }

  ${({ narrow }) => narrow && 'padding-right: 48px;'}
  ${({ disabled }) => disabled && 'cursor: not-allowed;'}
`

const PlayerIndicator = styled.div<Props>`
  position: absolute;
  bottom: 0px;
  left: 0px;

  height: 30px;
  width: 8px;

  border-bottom-left-radius: 8px;
  background: ${({ color }) => `linear-gradient(45deg, ${color}, transparent);`};
`

export function Card(props: Props): JSX.Element {
  const { card, color } = props

  return (
    <Layout {...props}>
      {serializeCard(card)}
      {color && <PlayerIndicator {...props} />}
    </Layout>
  )
}
