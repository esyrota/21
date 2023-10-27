import { cn } from '../../utils/cn'
import { Player, PlayerEvent } from '../../core/Player'
import { ComponentProps, FC, useEffect, useState } from 'react'
import styles from './player-choice.module.css'

interface Props extends ComponentProps<'div'> {
  player: Player
}

export const PlayerChoice: FC<Props> = ({ player, className, ...props }) => {
  const [isChoosing, setChoosing] = useState(false)
  useEffect(() => {
    const removeListeners = [
      player.on(PlayerEvent.ASK_CHOICE, () => setChoosing(true)),
      player.on(PlayerEvent.MOVE_END, () => setChoosing(false)),
    ]
    return () => {
      removeListeners.forEach((remove) => remove())
    }
  }, [player])

  if (!isChoosing) return null
  return (
    <div {...props} className={cn(styles.choise, className)}>
      <h1>Your Move</h1>
      <div className={styles.options}>
        <button onClick={player.chooseHit.bind(player)}>hit</button>
        <button onClick={player.chooseStand.bind(player)}>stand</button>
      </div>
    </div>
  )
}
