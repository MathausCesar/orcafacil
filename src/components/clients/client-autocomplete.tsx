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
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loading, setLoading] = useState(false)

    // Debounce logic simplified
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true)
                const results = await getClients(query)
                setSuggestions(results || [])
                setLoading(false)
                setShowSuggestions(true)
            } else {
                setSuggestions([])
                setShowSuggestions(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (client: any) => {
        setQuery(client.name)
        setPhone(client.phone || '')
        setShowSuggestions(false)
        onSelect(client)
    }

    const handleCreateSuccess = (result: any) => {
        // Idealmente a action retornaria o cliente criado. 
        // Por enquanto, usuário preenche manual ou busca o novo.
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
                                onSelect({ name: e.target.value, phone }) // Update parent form even if not selected
                            }}
                            autoComplete="off"
                            required
                            placeholder="Buscar ou digitar nome..."
                        />
                        {loading && <Search className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                    </div>
                    <CreateClientDialog onSuccess={handleCreateSuccess} trigger={
                        <Button type="button" size="icon" variant="outline"><Plus className="h-4 w-4" /></Button>
                    } />
                </div>

                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
                        {suggestions.map((client) => (
                            <div
                                key={client.id}
                                className="p-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2"
                                onClick={() => handleSelect(client)}
                            >
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">{client.phone}</p>
                                </div>
                            </div>
                        ))}
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
