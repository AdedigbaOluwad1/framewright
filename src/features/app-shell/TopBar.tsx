import { useRef } from 'react'
import { Icon } from '@iconify/react'
import { BrandLockup } from '@/shared/ui/brand-lockup'
import { Button } from '@/shared/ui/button'
import { IconButton } from '@/shared/ui/icon-button'
import { Input } from '@/shared/ui/input'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/shared/ui/menubar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import {
  SHORTCUTS,
  formatShortcut,
  type ActionHandlers,
  type ActionId,
} from '@/shared/shortcuts/registry'
import { WORKSPACES, type ThemeMode, type Workspace } from './types'

interface TopBarProps {
  projectName: string
  workspace: Workspace
  theme: ThemeMode
  actions: ActionHandlers
  onRenameProject: (name: string) => void
  onNewProject: () => void
  onSaveProject: () => void
  onClearLocalData: () => void
  onImportFiles: (files: File[]) => void
  onWorkspaceChange: (workspace: Workspace) => void
  onToggleTheme: () => void
  onTogglePanel: (panel: 'project' | 'inspector' | 'timeline') => void
}

export function TopBar({
  projectName,
  workspace,
  theme,
  actions,
  onRenameProject,
  onNewProject,
  onSaveProject,
  onClearLocalData,
  onImportFiles,
  onWorkspaceChange,
  onToggleTheme,
  onTogglePanel,
}: TopBarProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  function actionItem(id: ActionId) {
    const def = SHORTCUTS[id]
    return (
      <MenubarItem onSelect={actions[id]}>
        {def.label}
        <MenubarShortcut>{formatShortcut(def.display)}</MenubarShortcut>
      </MenubarItem>
    )
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 px-4">
      <BrandLockup className="mx-1 h-[18px] shrink-0" />

      <Menubar
        aria-label="Application menu"
        className="h-10 border-0 bg-transparent p-0 shadow-none"
      >
        <MenubarMenu>
          <MenubarTrigger className="text-[0.9rem]">File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={onNewProject}>New project</MenubarItem>
            <MenubarItem onSelect={() => fileInput.current?.click()}>
              Import media…
            </MenubarItem>
            <MenubarItem onSelect={onSaveProject}>Save project</MenubarItem>
            <MenubarSeparator />
            {actionItem('export')}
            <MenubarSeparator />
            <MenubarItem variant="destructive" onSelect={onClearLocalData}>
              Clear local data
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-[0.9rem]">Edit</MenubarTrigger>
          <MenubarContent>
            {actionItem('undo')}
            {actionItem('redo')}
            <MenubarSeparator />
            {actionItem('split')}
            {actionItem('delete')}
            {actionItem('rippleDelete')}
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-[0.9rem]">View</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onSelect={() => onTogglePanel('project')}>
              Toggle project panel
            </MenubarItem>
            <MenubarItem onSelect={() => onTogglePanel('inspector')}>
              Toggle inspector
            </MenubarItem>
            <MenubarItem onSelect={() => onTogglePanel('timeline')}>
              Toggle timeline
            </MenubarItem>
            <MenubarSeparator />
            {actionItem('zoomIn')}
            {actionItem('zoomOut')}
            <MenubarSeparator />
            {actionItem('commandPalette')}
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger className="text-[0.9rem]">Help</MenubarTrigger>
          <MenubarContent>{actionItem('commandPalette')}</MenubarContent>
        </MenubarMenu>
      </Menubar>

      <input
        ref={fileInput}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          if (event.target.files?.length)
            onImportFiles(Array.from(event.target.files))
          event.target.value = ''
        }}
      />

      <Input
        aria-label="Project name"
        defaultValue={projectName}
        key={projectName}
        className="mx-auto h-9 w-56 border-transparent bg-transparent text-center text-[0.9rem] hover:border-border focus-visible:border-ring"
        onBlur={(event) => {
          if (event.target.value !== projectName)
            onRenameProject(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur()
        }}
      />

      <Select
        value={workspace}
        onValueChange={(v) => onWorkspaceChange(v as Workspace)}
      >
        <SelectTrigger
          aria-label="Workspace"
          size="sm"
          className="h-9 w-28 text-[0.9rem]"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {WORKSPACES.map((name) => (
            <SelectItem key={name} value={name}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <IconButton
        label={
          theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
        }
        onClick={onToggleTheme}
        icon={
          theme === 'dark' ? (
            <Icon icon="hugeicons:sun-03" className="size-4" />
          ) : (
            <Icon icon="hugeicons:moon-02" className="size-4" />
          )
        }
      />

      <Button
        size="sm"
        className="h-9 gap-1 text-[0.9rem]"
        onClick={actions.export}
      >
        <Icon icon="hugeicons:download-01" aria-hidden="true" /> Export
      </Button>
    </header>
  )
}
