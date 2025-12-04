import { Badge, IconButton, Paper, Popper, Typography } from '@mui/material'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'
import { useEffect, useState, type JSX } from 'react'
import { useMatchNotifications, type MatchNotification } from '@/hooks/useMatchNotifications'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import ScoreBoardIcon from '@mui/icons-material/Scoreboard'
import { APP_NOTIFICATIONS, useAppNotifications, type Notification } from '@/hooks/useAppNotifications'
import { Link, useLocation } from 'react-router'

export default function NotificationsButton() {
  const { matchNotifications } = useMatchNotifications()
  const { unseenNotificationsCount, markAllNotificationAsSeen, showPWAInstallNotification } = useAppNotifications()
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLButtonElement>(null)
  const [beforeInstallPrompt, setBeforeInstallPrompt] = useState<any>(null)
  const location = useLocation()

  const totalNotificationsCount = matchNotifications.length + unseenNotificationsCount - (showPWAInstallNotification && beforeInstallPrompt ? 0 : 1)

  useEffect(() => {
    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setBeforeInstallPrompt(e)
      console.log('PWA install prompt captured')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location])

  function handleClick() {
    markAllNotificationAsSeen()
    setOpen(prev => !prev)
  }

  function handleClickAway(e: MouseEvent | TouchEvent) {
    if (open && e.target instanceof HTMLElement && !anchorEl?.contains(e.target)) {
      setOpen(false)
      e.preventDefault()
      e.stopPropagation()
      e.stopImmediatePropagation?.()
    }
  }

  let notifications: JSX.Element[] = []
  notifications = matchNotifications.map((notification, index) => (
    <MatchNotification key={index} notification={notification} />
  ))
  notifications = notifications.concat(APP_NOTIFICATIONS.filter(notification => (showPWAInstallNotification && beforeInstallPrompt) || notification.id !== 'download-app').map((notification, index) => (
    <AppNotification key={index} notification={notification} />
  )))

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        color="inherit"
        onClick={handleClick}
        className="ignore-transition"
        ref={setAnchorEl}
        style={{ viewTransitionName: 'notifications-button' }}
      >
        <Badge badgeContent={totalNotificationsCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Popper
          open={true}
          anchorEl={anchorEl}
          placement="bottom-end"
          className={`fixed z-1200 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <NotificationsList notifications={notifications} open={open} />
        </Popper>
      </ClickAwayListener>
    </>
  )
}

function MatchNotification({ notification }: { notification: MatchNotification }) {
  const { forTeamUrl, teams, result, teamUrls } = notification
  const teamIndex = teamUrls.indexOf(forTeamUrl)
  const won = result[teamIndex] > result[(teamIndex + 1) % 2]

  return (
    <>
      <div className="flex items-center gap-0 mb-1">
        <ScoreBoardIcon fontSize="large" className="align-middle mr-2 text-accent" />
        <Typography variant="h6" fontWeight={700} fontSize={20}>Uitslag bekend</Typography>
      </div>
      <Typography className="notification-text" variant="body1" fontWeight={300}>
        <span className="font-normal">{teams[teamIndex]}</span>
        {' '}
        heeft met
        {' '}
        {result[teamIndex]}
        ‑
        {result[(teamIndex + 1) % 2]}
        {' '}
        {won ? 'gewonnen' : 'verloren'}
        {' '}
        van
        {' '}
        {teams[(teamIndex + 1) % 2]}
      </Typography>
      <div className="mt-2 flex justify-end">
        <Link
          to={`/team/${forTeamUrl}/match/${notification.matchId}`}
          viewTransition
        >
          Uitslag bekijken
        </Link>
      </div>
    </>
  )
}

function AppNotification({ notification }: { notification: Notification }) {
  const IconComponent = notification.icon

  return (
    <>
      <div className="flex items-center gap-0 mb-1">
        <IconComponent fontSize="large" className="align-middle mr-2 text-accent" />
        <Typography variant="h6" fontWeight={700} fontSize={20}>{notification.title}</Typography>
      </div>
      <Typography className="notification-text" variant="body1" fontWeight={300}>
        {notification.message}
      </Typography>
      <div className="mt-2 flex justify-end">
        {notification.actions?.map((action, index) => (
          <Link
            key={index}
            onClick={action.onClick}
            to="#"
          >
            {action.label}
          </Link>
        ))}
      </div>
    </>
  )
}

function NotificationsList({ notifications, open }: { notifications: JSX.Element[], open: boolean }) {
  return (
    <Paper elevation={3} className={`overflow-hidden transition-[height,width] duration-300 w-[70vw] ${open ? 'h-auto' : 'h-0'}`}>
      <div className="p-0 border overflow-x-hidden border-panel-border w-[70vw] h-fit transition-[width,height] duration-300 max-h-[60vh] overflow-y-auto bg-panel dark:text-white">
        {notifications.map((notification, index) => (
          <div key={index} className={`${index < notifications.length - 1 ? 'border-b border-panel-border' : ''} p-2`}>
            {notification}
          </div>
        ))}

      </div>
    </Paper>
  )
}
