'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Package } from 'lucide-react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'

interface ProductSearchProps {
    onAddProduct: (product: { name: string; price: number; quantity: number }) => void;
}

interface SavedService {
    id: string
    description: string
    default_price: number
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [savedServices, setSavedServices] = useState<SavedService[]>([])
    const [suggestions, setSuggestions] = useState<SavedService[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    // Load saved services on mount
    useEffect(() => {
        const loadServices = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from('services')
                .select('id, description, default_price')
                .order('description')

            if (data) setSavedServices(data)
        }
        loadServices()
    }, [])

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleDescriptionChange = (value: string) => {
        setDescription(value)
        if (value.trim().length > 0) {
            const filtered = savedServices.filter(s =>
                s.description.toLowerCase().includes(value.toLowerCase())
            )
            setSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        } else {
            // Show all services when input is empty
            setSuggestions(savedServices)
            setShowSuggestions(savedServices.length > 0)
        }
    }

    const selectSuggestion = (service: SavedService) => {
        setDescription(service.description)
        setPrice(service.default_price.toString())
        setShowSuggestions(false)
    }

    const handleAdd = () => {
        if (!description.trim()) {
            toast.error('Informe a descrição do item.')
            return
        }
        const priceVal = parseFloat(price.replace(',', '.')) || 0
        const qtyVal = parseFloat(quantity) || 1

        if (priceVal <= 0) {
            toast.warning('O preço deve ser maior que zero.')
            return
        }

        onAddProduct({ name: description.trim(), price: priceVal, quantity: qtyVal })
        setDescription('')
        setPrice('')
        setQuantity('1')
        toast.success('Item adicionado!')
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    const formatBRL = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

    return (
        <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="relative" ref={suggestionsRef}>
                <div className="space-y-1">
                    <Label htmlFor="itemName" className="text-xs font-medium text-muted-foreground">Descrição do Item / Serviço</Label>
                    <Input
                        id="itemName"
                        placeholder="Ex: Troca de Óleo, Pastilha de Freio..."
                        value={description}
                        onChange={(e) => handleDescriptionChange(e.target.value)}
                        onFocus={() => {
                            // Show all services on focus if input is empty
                            if (description.trim().length === 0 && savedServices.length > 0) {
                                setSuggestions(savedServices)
                                setShowSuggestions(true)
                            } else if (suggestions.length > 0) {
                                setShowSuggestions(true)
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                        autoComplete="off"
                    />
                </div>

                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-card border border-primary/15 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                        {suggestions.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className="w-full text-left px-3 py-2.5 hover:bg-primary/10 transition-colors flex justify-between items-center border-b border-primary/5 last:border-0"
                                onClick={() => selectSuggestion(s)}
                            >
                                <span className="text-sm font-medium text-foreground">{s.description}</span>
                                <span className="text-xs font-semibold text-primary ml-2">{formatBRL(s.default_price)}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 items-end">
                <div className="w-24 space-y-1">
                    <Label htmlFor="itemQty" className="text-xs font-medium text-muted-foreground">Qtd</Label>
                    <Input
                        id="itemQty"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>

                <div className="flex-1 space-y-1">
                    <Label htmlFor="itemPrice" className="text-xs font-medium text-muted-foreground">Valor Unit. (R$)</Label>
                    <Input
                        id="itemPrice"
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>

                <Button onClick={handleAdd} disabled={!description.trim()} className="bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-primary/90 hover:to-emerald-600/90 shadow-md shadow-primary/20">
                    <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
            </div>

            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Package className="h-3 w-3" />
                {savedServices.length > 0
                    ? 'Dica: Digite para buscar nos seus serviços salvos. O preço será preenchido automaticamente.'
                    : 'Dica: Cadastre serviços no seu Perfil para agilizar seus orçamentos.'
                }
            </p>
        </div>
    )
}
