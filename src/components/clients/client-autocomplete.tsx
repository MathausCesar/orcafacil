'use client'

import { useState, useEffect } from 'react'
import { getClients } from '@/app/actions/clients'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, User, Search } from 'lucide-react'
import { CreateClientDialog } from '@/components/clients/create-client-dialog'
import { useDebounce } from '@/hooks/use-debounce'
// Criarei useDebounce inline ou utils se nao tiver

interface ClientAutocompleteProps {
    onSelect: (client: any) => void;
    defaultValue?: string;
    defaultPhone?: string;
}

export function ClientAutocomplete({ onSelect, defaultValue, defaultPhone }: ClientAutocompleteProps) {
    const [query, setQuery] = useState(defaultValue || '')
    const [phone, setPhone] = useState(defaultPhone || '')
    const [allClients, setAllClients] = useState<any[]>([])
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loading, setLoading] = useState(false)

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

    // Filter locally as user types
    useEffect(() => {
        if (!showSuggestions) return
        if (!query.trim()) {
            setSuggestions(allClients)
        } else {
            const q = query.toLowerCase()
            setSuggestions(allClients.filter(c =>
                c.name?.toLowerCase().includes(q) || c.phone?.includes(q)
            ))
        }
    }, [query, allClients, showSuggestions])

    const handleFocus = () => {
        setSuggestions(query.trim()
            ? allClients.filter(c => c.name?.toLowerCase().includes(query.toLowerCase()))
            : allClients
        )
        setShowSuggestions(true)
    }

    const handleBlur = () => {
        // Delay to allow click on suggestion
        setTimeout(() => setShowSuggestions(false), 150)
    }

    const handleSelect = (client: any) => {
        setQuery(client.name)
        setPhone(client.phone || '')
        setShowSuggestions(false)
        onSelect(client)
    }

    const handleCreateSuccess = (result: any) => {
        setSuggestions([])
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
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {suggestions.length === 0 ? (
                            <div className="p-4 text-sm text-center text-muted-foreground">
                                {query ? `Nenhum cliente encontrado para "${query}"` : 'Nenhum cliente cadastrado'}
                            </div>
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
