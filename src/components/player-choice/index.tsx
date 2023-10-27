import { Player, PlayerEvent } from '../../core/Player'
import { ComponentProps, FC, useEffect, useState } from 'react'
import styles from './player-choice.module.css'
import { Announcement } from '../announcement'

interface Props extends ComponentProps<'div'> {
  player: Player
}

export const PlayerChoice: FC<Props> = ({ player }) => {
  const [isChoosing, setChoosing] = useState(false)
  useEffect(() => {
    const removeListeners = [
      player.on(PlayerEvent.ASK_CHOICE, () => setChoosing(true)),
      player.on(PlayerEvent.CHOOSE_HIT, () => setChoosing(false)),
      player.on(PlayerEvent.CHOOSE_STAND, () => setChoosing(false)),
      player.on(PlayerEvent.MOVE_END, () => setChoosing(false)),
    ]
    return () => {
      removeListeners.forEach((remove) => remove())
    }
  }, [player])

  if (!isChoosing) return null
  return (
    <Announcement>
      <h1>Your Move</h1>
      <div className={styles.options}>
        <button onClick={player.chooseHit.bind(player)}>hit</button>
        <button onClick={player.chooseStand.bind(player)}>stand</button>
      </div>
    </Announcement>
  )
}
