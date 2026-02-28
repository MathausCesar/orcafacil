'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Building2, PlusCircle, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { useOrganization } from '@/contexts/organization-context'
import { useRouter } from 'next/navigation'

export function WorkspaceSwitcher() {
    const [open, setOpen] = useState(false)
    const { organization, organizations, setOrganization, isLoading } = useOrganization()
    const router = useRouter()

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-2 rounded-lg border border-transparent animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-muted rounded"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                </div>
            </div>
        )
    }

    if (!organization) return null

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full sm:w-[250px] justify-between p-2 h-auto hover:bg-muted/50 transition-colors"
                >
                    <div className="flex items-center gap-3 truncate">
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={organization.logo_url || ''} className="object-cover" />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                {organization.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start truncate">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                                Espaço de Trabalho
                            </span>
                            <span className="text-sm font-bold tracking-tight text-foreground truncate w-full max-w-[150px] text-left">
                                {organization.name}
                            </span>
                        </div>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[250px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Buscar espaço..." />
                    <CommandList>
                        <CommandEmpty>Nenhum espaço encontrado.</CommandEmpty>
                        <CommandGroup heading="Seus Espaços">
                            {organizations.map((org) => (
                                <CommandItem
                                    key={org.id}
                                    onSelect={() => {
                                        setOrganization(org)
                                        setOpen(false)
                                        router.refresh()
                                    }}
                                    className="gap-2 cursor-pointer"
                                >
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={org.logo_url || ''} />
                                        <AvatarFallback className="text-[10px]">
                                            {org.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate flex-1">{org.name}</span>
                                    {organization.id === org.id && (
                                        <Check className="h-4 w-4 text-primary" />
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false)
                                    import('sonner').then((mod) => {
                                        mod.toast.info('Criação de múltiplos espaços de trabalho estará disponível em breve!');
                                    })
                                }}
                                className="gap-2 cursor-pointer text-primary"
                            >
                                <PlusCircle className="h-4 w-4" />
                                <span>Criar novo espaço</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
