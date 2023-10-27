import { ComponentProps, FC } from 'react'
import { cn } from '../../utils/cn'
import styles from './announcement.module.css'

interface Props extends ComponentProps<'div'> {}
export const Announcement: FC<Props> = ({ children, className, ...props }) => {
  return (
    <div {...props} className={cn(styles.announcement, className)}>
      {children}
    </div>
  )
}
