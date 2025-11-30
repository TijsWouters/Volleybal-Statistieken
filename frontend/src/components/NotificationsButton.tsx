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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
          style={{ zIndex: 1200, position: 'fixed', transition: 'opacity 0.3s ease', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '0.25rem' }}>
        <ScoreBoardIcon fontSize="large" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-accent)' }} />
        <Typography variant="h6" fontWeight={700} fontSize={20}>Uitslag bekend</Typography>
      </div>
      <Typography className="notification-text" variant="body1" fontWeight={300}>
        <span style={{ fontWeight: 400 }}>{teams[teamIndex]}</span>
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
      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '0.25rem' }}>
        <IconComponent fontSize="large" style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: 'var(--color-accent)' }} />
        <Typography variant="h6" fontWeight={700} fontSize={20}>{notification.title}</Typography>
      </div>
      <Typography className="notification-text" variant="body1" fontWeight={300}>
        {notification.message}
      </Typography>
      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
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
    <Paper elevation={3} style={{ height: open ? 'auto' : '0', overflow: 'hidden', transition: 'height 0.3s ease, width 0.3s ease', width: open ? '70vw' : '0', margin: '0 1rem' }}>
      <div style={{ padding: 0, border: '1px solid #ccc', width: '70vw', height: 'fit-content', transition: 'width 0.3s ease, height 0.3s ease', maxHeight: '60vh', overflowY: 'auto' }}>
        {notifications.map((notification, index) => (
          <div key={index} style={{ borderBottom: index < notifications.length - 1 ? '1px solid #ccc' : 'none', padding: '0.5rem 1rem' }}>
            {notification}
          </div>
        ))}

      </div>
    </Paper>
  )
}
