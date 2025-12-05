import { useState } from 'react'
import SecurityUpdateGoodIcon from '@mui/icons-material/SecurityUpdateGood'
import DownloadIcon from '@mui/icons-material/Download'
import ShareIcon from '@mui/icons-material/Share'
import { Instagram } from '@mui/icons-material'

declare global {
  interface Window {
    deferredPWAPrompt?: any
  }
}

export type Notification = {
  id: string
  message: string
  title: string
  icon: any
  actions?: {
    label: string
    onClick: () => void
  }[]
}

export const APP_NOTIFICATIONS: Notification[] = [
  {
    id: 'download-app',
    title: 'Download de app',
    message: 'Voor de beste ervaring voeg je Volleybal Statistieken toe als app',
    icon: DownloadIcon,
    actions: [{
      label: 'Download',
      onClick: () => window.deferredPWAPrompt?.prompt(),
    }],
  },
  {
    id: 'version-2.0',
    title: 'Versie 2.0 beschikbaar',
    message: 'Volleybal statistieken heeft een nieuwe look gekregen!',
    icon: SecurityUpdateGoodIcon,
    actions: [{
      label: 'Wat is er nieuw?',
      onClick: () => window.open('https://github.com/TijsWouters/Volleybal-Statistieken/blob/main/CHANGELOG.md', '_blank'),
    }],
  },
  {
    id: 'share',
    title: 'Deel Volleybal Statistieken',
    message: 'Vind je Volleybal Statistieken leuk? Deel een team, club, wedstrijd of poule met de knop bovenaan!',
    icon: ShareIcon,
  },
  {
    id: 'instagram',
    title: 'Instagram',
    message: 'Volg Volleybal Statistieken op Instagram!',
    icon: Instagram,
    actions: [{
      label: 'Volgen',
      onClick: () => window.open('https://www.instagram.com/volleybal_statistieken/', '_blank'),
    }],
  },
]

export function useAppNotifications() {
  function getUnseenNotificationsCount(): number {
    const seen = loadSeenNotifications()
    const count = APP_NOTIFICATIONS.filter(notification => !seen.includes(notification.id)).length
    if (seen.includes('download-app')) {
      return count + 1
    }
    return count
  }

  const [unseenNotificationsCount, setUnseenNotificationsCount] = useState<number>(getUnseenNotificationsCount())

  function loadSeenNotifications(): string[] {
    try {
      const raw = localStorage.getItem('volleystats.seenAppNotifications')
      if (!raw) return []
      const parsed = JSON.parse(raw) as string[]
      if (!Array.isArray(parsed)) return []
      return parsed
    }
    catch {
      return []
    }
  }

  function markAllNotificationAsSeen() {
    const seenIds = APP_NOTIFICATIONS.map(notification => notification.id)
    localStorage.setItem('volleystats.seenAppNotifications', JSON.stringify(seenIds))
    setUnseenNotificationsCount(getUnseenNotificationsCount())
  }

  function appIsInstalledAsPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
  }

  const showPWAInstallNotification = !appIsInstalledAsPWA()

  return { markAllNotificationAsSeen, unseenNotificationsCount, showPWAInstallNotification }
}
