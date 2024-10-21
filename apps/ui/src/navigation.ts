export enum View {
  DASHBOARD,
  INSTRUCTIONS,
  NOTIFICATIONS,
  ABOUT,
}

export const Navigation = [
  { view: View.DASHBOARD, label: 'Dashboard' },
  { view: View.INSTRUCTIONS, label: 'Instructions' },
  { view: View.NOTIFICATIONS, label: 'Notifications' },
  { view: View.ABOUT, label: 'About' },
]
