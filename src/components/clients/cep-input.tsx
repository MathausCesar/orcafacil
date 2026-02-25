'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'

interface ViaCepResponse {
    cep: string
    logradouro: string
    complemento: string
    bairro: string
    localidade: string
    uf: string
    erro?: boolean
}

interface CepInputProps {
    defaultCep?: string
    defaultAddress?: string
    onAddressFound?: (address: string) => void
}

export function CepInput({ defaultCep = '', defaultAddress = '', onAddressFound }: CepInputProps) {
    const [cep, setCep] = useState(defaultCep)
    const [address, setAddress] = useState(defaultAddress)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const formatCep = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 8)
        if (digits.length > 5) {
            return `${digits.slice(0, 5)}-${digits.slice(5)}`
        }
        return digits
    }

    const lookupCep = useCallback(async (rawCep: string) => {
        const digits = rawCep.replace(/\D/g, '')
        if (digits.length !== 8) return

        setLoading(true)
        setError('')

        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
            const data: ViaCepResponse = await res.json()

            if (data.erro) {
                setError('CEP não encontrado')
                return
            }

            const parts = [
                data.logradouro,
                data.bairro,
                `${data.localidade} - ${data.uf}`,
                data.cep
            ].filter(Boolean)

            const fullAddress = parts.join(', ')
            setAddress(fullAddress)
            onAddressFound?.(fullAddress)
        } catch {
            setError('Erro ao buscar CEP')
        } finally {
            setLoading(false)
        }
    }, [onAddressFound])

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCep(e.target.value)
        setCep(formatted)

        const digits = formatted.replace(/\D/g, '')
        if (digits.length === 8) {
            lookupCep(digits)
        }
    }

    return (
        <>
            <div className="space-y-2">
                <Label htmlFor="cep" className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> CEP
                </Label>
                <div className="relative">
                    <Input
                        id="cep"
                        name="cep"
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="00000-000"
                        maxLength={9}
                        inputMode="numeric"
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                    id="address"
                    name="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                />
            </div>
        </>
    )
}
