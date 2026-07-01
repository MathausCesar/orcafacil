'use client'

import { useState, type ReactNode } from 'react'
import { Building2, CreditCard, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabKey = 'company' | 'proposal' | 'team' | 'account'

interface ProfileSettingsTabsProps {
    company: ReactNode
    proposal: ReactNode
    team: ReactNode
    account: ReactNode
}

const TABS: Array<{
    key: TabKey
    label: string
    icon: typeof Building2
}> = [
    { key: 'company', label: 'Empresa', icon: Building2 },
    { key: 'proposal', label: 'Proposta', icon: FileText },
    { key: 'team', label: 'Equipe', icon: Users },
    { key: 'account', label: 'Conta', icon: CreditCard },
]

export function ProfileSettingsTabs({ company, proposal, team, account }: ProfileSettingsTabsProps) {
    const [activeTab, setActiveTab] = useState<TabKey>('company')

    const panels: Record<TabKey, ReactNode> = {
        company,
        proposal,
        team,
        account,
    }

    return (
        <div className="space-y-6">
            <div className="grid h-auto w-full grid-cols-2 gap-2 rounded-xl bg-muted/70 p-1 sm:grid-cols-4">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            aria-pressed={isActive}
                            className={cn(
                                'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors',
                                'text-muted-foreground hover:bg-background/70 hover:text-foreground',
                                isActive && 'bg-background text-foreground shadow-sm'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            <div>{panels[activeTab]}</div>
        </div>
    )
}
