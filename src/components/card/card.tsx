import { ComponentProps, FC } from 'react'
import { CardCode, Card as CardType } from '../../core/Card'
import { CardFace } from './face'
import styles from './card.module.css'
import { cn } from '../../utils/cn'

interface Props extends ComponentProps<'img'> {
  card: CardType
  className?: string
}

export const Card: FC<Props> = ({ card, className, ...props }) => {
  const src = CardFace[card.toString() as CardCode]
  return <img {...props} src={src} alt={card.toString()} className={cn(styles.card, className)} />
}
