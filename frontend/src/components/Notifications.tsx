import { Fab, Badge, Modal, Paper, Button, Typography } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'

import { useNotifications } from '@/hooks/useNotifications'
import { useNavigate } from 'react-router'

export default function Notifications() {
  const { notifications, deleteNotification, deleteAllNotifications } = useNotifications()
  const [open, setOpen] = useState(false)

  if (notifications.length === 0) {
    return null
  }

  return (
    <>
      <Fab className="notifications-fab" size="large" onClick={() => setOpen(true)}>
        <Badge badgeContent={notifications.length} className="badge">
          <NotificationsIcon fontSize="large" />
        </Badge>
      </Fab>
      <NotificationsMenu
        notifications={notifications}
        deleteNotification={deleteNotification}
        deleteAllNotifications={deleteAllNotifications}
        open={open}
        setOpen={setOpen}
      />
    </>
  )
}

function NotificationsMenu({
  notifications,
  deleteNotification,
  deleteAllNotifications,
  open,
  setOpen,
}: {
  notifications: ReturnType<typeof useNotifications>['notifications']
  deleteNotification: ReturnType<typeof useNotifications>['deleteNotification']
  deleteAllNotifications: ReturnType<typeof useNotifications>['deleteAllNotifications']
  open: boolean
  setOpen: (open: boolean) => void
}) {
  function handleDeleteAll() {
    deleteAllNotifications()
    setOpen(false)
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Paper elevation={0} className="notifications-modal">
        <div className="modal-header">
          <Button className="delete-all" onClick={handleDeleteAll} color="error" variant="contained" endIcon={<DeleteIcon />}>Alles verwijderen</Button>
          <CloseIcon className="close" onClick={() => setOpen(false)} />
        </div>
        <div className="notifications-list">
          {notifications.map(notification => (
            <NotificationItem
              key={`${notification.forTeamUrl}-${notification.matchId}`}
              notification={notification}
              deleteNotification={deleteNotification}
              setOpen={setOpen}
            />
          ))}
        </div>
      </Paper>
    </Modal>
  )
}

function NotificationItem({ notification, deleteNotification, setOpen }: {
  notification: ReturnType<typeof useNotifications>['notifications'][0]
  deleteNotification: ReturnType<typeof useNotifications>['deleteNotification']
  setOpen: (open: boolean) => void
}) {
  const { forTeamUrl, teams, result, teamUrls } = notification
  const teamIndex = teamUrls.indexOf(forTeamUrl)
  const won = result[teamIndex] > result[(teamIndex + 1) % 2]
  const navigate = useNavigate()

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    deleteNotification(notification.forTeamUrl, notification.matchId)
    navigate(`/team${notification.forTeamUrl}/match/${notification.matchId}`)
    setOpen(false)
    e.stopPropagation()
  }

  return (
    <div className="notification-item" onClick={handleClick}>
      <Typography className="notification-text" variant="body1">
        <strong>{teams[teamIndex]}</strong>
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
      <Button
        onClick={() => deleteNotification(notification.forTeamUrl, notification.matchId)}
        className="delete-button"
        color="error"
        variant="contained"
      >
        <DeleteIcon />
      </Button>
    </div>
  )
}
