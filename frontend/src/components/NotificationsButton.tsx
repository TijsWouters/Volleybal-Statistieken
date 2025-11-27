import { Badge, IconButton, Paper, Popper, Typography } from '@mui/material'
import NotificationsOutlined from '@mui/icons-material/NotificationsOutlined'
import { useState, type JSX } from 'react'
import { useMatchNotifications, type MatchNotification } from '@/hooks/useMatchNotifications'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import ScoreBoardIcon from '@mui/icons-material/Scoreboard'
import { APP_NOTIFICATIONS, useAppNotifications, type Notification } from '@/hooks/useAppNotifications'
import { Link } from 'react-router'

export default function NotificationsButton() {
  const { matchNotifications } = useMatchNotifications()
  const { unseenNotificationsCount, markAllNotificationAsSeen, showPWAInstallNotification } = useAppNotifications()
  const totalNotificationsCount = matchNotifications.length + unseenNotificationsCount
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget)
    markAllNotificationAsSeen()
    setOpen(prev => !prev)
  }

  function handleClickAway(e: MouseEvent | TouchEvent) {
    if (open && e.target instanceof HTMLElement && !anchorEl?.contains(e.target)) {
      setOpen(false)
    }
  }

  let notifications: JSX.Element[] = []
  notifications = matchNotifications.map((notification, index) => (
    <MatchNotification key={index} notification={notification} />
  ))
  notifications = notifications.concat(APP_NOTIFICATIONS.filter(notification => showPWAInstallNotification || notification.id !== 'download-app').map((notification, index) => (
    <AppNotification key={index} notification={notification} />
  )))

  return (
    <>
      <IconButton
        size="large"
        edge="end"
        color="inherit"
        onClick={handleClick}
      >
        <Badge badgeContent={totalNotificationsCount} color="error">
          <NotificationsOutlined />
        </Badge>
      </IconButton>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Popper
          open={open}
          anchorEl={anchorEl}
          placement="bottom-end"
          style={{ zIndex: 1200, position: 'fixed' }}
        >
          {({ TransitionProps }) => (
            <NotificationsList notifications={notifications} {...TransitionProps} />
          )}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
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

function NotificationsList({ notifications, ...transitionProps }: { notifications: JSX.Element[] }) {
  return (
    <Paper {...transitionProps} elevation={1} style={{ maxHeight: '70vh', overflowY: 'auto', margin: '0 1rem', padding: 0, border: '1px solid #ccc' }}>
      {notifications.map((notification, index) => (
        <div key={index} style={{ borderBottom: index < notifications.length - 1 ? '1px solid #ccc' : 'none', padding: '0.5rem 1rem' }}>
          {notification}
        </div>
      ))}
    </Paper>
  )
}
