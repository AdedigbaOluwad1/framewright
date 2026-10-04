export type ThemeMode = 'dark' | 'light'

export const WORKSPACES = ['Editing', 'Audio', 'Titles'] as const
export type Workspace = (typeof WORKSPACES)[number]
