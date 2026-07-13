'use client'

import { useState, useEffect } from 'react'
import { getClients } from '@/app/actions/clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, User, Search } from 'lucide-react'
import { CreateClientDialog } from '@/components/clients/create-client-dialog'

export type ClientOption = {
    id?: string
    name: string
    phone?: string | null
}

interface ClientAutocompleteProps {
    onSelect: (client: ClientOption) => void;
    defaultValue?: string;
    defaultPhone?: string;
}

export function ClientAutocomplete({ onSelect, defaultValue, defaultPhone }: ClientAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue || '')
    const [phone, setPhone] = useState(defaultPhone || '')
    const [allClients, setAllClients] = useState<ClientOption[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loading, setLoading] = useState(false)
    const normalizedQuery = query.trim().toLowerCase()
    const suggestions = normalizedQuery
        ? allClients.filter((client) =>
            client.name?.toLowerCase().includes(normalizedQuery) || client.phone?.includes(normalizedQuery)
        )
        : allClients

    // Load all clients on mount (once)
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true)
            const results = await getClients('')
            setAllClients(results || [])
            setLoading(false)
        }
        loadAll()
    }, [])

    const handleFocus = () => {
        setShowSuggestions(true)
    }

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => setShowSuggestions(false), 150)
    }

    const handleSelect = (client: ClientOption) => {
        setQuery(client.name)
        setPhone(client.phone || '')
        setShowSuggestions(false)
        onSelect(client)
    }

    const handleCreateSuccess = async (newClient: ClientOption | null) => {
        setLoading(true)
        const results = await getClients('')
        setAllClients(results || [])
        setLoading(false)

        if (newClient && newClient.name) {
            handleSelect(newClient)
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Label htmlFor="clientName">Nome do Cliente</Label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Input
                            id="clientName"
                            name="clientName"
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value)
                                onSelect({ name: e.target.value, phone })
                            }}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            autoComplete="off"
                            required
                            placeholder={loading ? "Carregando clientes..." : "Clique para ver todos os clientes..."}
                        />
                        {loading && <Search className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <CreateClientDialog onSuccess={handleCreateSuccess} trigger={
                        <Button type="button" size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
                    } />
                </div>

                {showSuggestions && (
                    <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {suggestions.length === 0 ? (
                            query ? (
                                <div
                                    className="p-3 hover:bg-primary/5 cursor-pointer flex items-center gap-3 transition-colors"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelect({ name: query, phone })}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Plus className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Usar &quot;{query}&quot; como novo cliente</p>
                                        <p className="text-xs text-muted-foreground">Nenhum cliente cadastrado com esse nome ainda</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 text-sm text-center text-muted-foreground">
                                    Nenhum cliente cadastrado
                                </div>
                            )
                        ) : (
                            suggestions.map((client) => (
                                <div
                                    key={client.id}
                                    className="p-3 hover:bg-primary/5 cursor-pointer flex items-center gap-3 border-b last:border-0 transition-colors"
                                    onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                                    onClick={() => handleSelect(client)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{client.name}</p>
                                        {client.phone && <p className="text-xs text-muted-foreground">{client.phone}</p>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone (Opcional)</Label>
                <Input
                    id="clientPhone"
                    name="clientPhone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                />
            </div>
        </div>
    )
}
