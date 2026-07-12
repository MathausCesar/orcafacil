'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createQuote, updateQuote } from '@/app/actions/quotes'
import { ProductSearch } from '@/components/quotes/product-search'
import { VoiceProposalAssistant } from '@/components/quotes/voice-proposal-assistant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Trash2, Save, ArrowLeft, FileText, Loader2, Settings2, Wallet, Clock, CheckCircle2, AlignLeft, LayoutTemplate, Check, Package, Wrench, Lock, Sparkles, Gauge } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClientAutocomplete } from '@/components/clients/client-autocomplete'
import { useRouter } from 'next/navigation'
import { FREE_PROPOSAL_MODEL, PROPOSAL_MODELS, isFreePlan } from '@/lib/proposal-style'
import { PROFESSIONAL_CONTEXTS, getProfessionalContext } from '@/lib/professional-context'
import { usePostHog } from 'posthog-js/react'
import { addExceptionStep, captureActivationStage, captureConversion, captureEvent, captureException } from '@/lib/analytics'
import {
    getLayoutRecommendationForContext,
    getProposalModelName,
    type LayoutRecommendation,
} from '@/lib/profession-layout-recommendations'
import { calculateProposalReadiness } from '@/lib/proposal-readiness'
import type { VoiceProposalSuggestion } from '@/lib/voice-proposal-parser'

type NumericQuoteItemField = 'quantity' | 'unitPrice'

function parseBrazilianNumber(value: string) {
    const cleanValue = value.trim().replace(/\s/g, '')

    if (!cleanValue) return null

    const normalized = cleanValue.includes(',')
        ? cleanValue.replace(/\./g, '').replace(',', '.')
        : cleanValue

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

function formatNumberInput(value: number) {
    return String(value).replace('.', ',')
}

function getQuoteTotalBand(value: number) {
    if (value < 500) return 'under_500'
    if (value < 1500) return '500_1499'
    if (value < 5000) return '1500_4999'
    if (value < 10000) return '5000_9999'
    return '10000_plus'
}

export interface QuoteItem {
    id: string;
    serviceId?: string | null;
    itemType?: 'service' | 'product';
    description: string;
    details?: string | null;
    quantity: number;
    unitPrice: number;
    unitCost?: number;
}

interface QuoteFormProps {
    quickMode?: boolean
    starterMode?: boolean
    proSampleAvailable?: boolean
    plan?: string | null
    initialData?: {
        id?: string
        experienceMode?: 'free_simple' | 'pro_sample' | 'pro'
        clientName: string
        clientPhone?: string
        expirationDate?: string
        paymentTerms?: string
        notes?: string
        showDetailedItems?: boolean
        showTimeline?: boolean
        showPaymentOptions?: boolean
        estimatedDays?: string
        cashDiscountPercent?: number
        cashDiscountFixed?: number
        cashDiscountType?: string
        depositAmount?: number
        paymentMethods?: string[]
        installmentCount?: string
        layoutStyle?: string
        professionalContext?: string
        items: QuoteItem[]
    }
    brandPreview?: {
        businessName: string | null
        logoUrl: string | null
        accentColor: string | null
        hasLogoAnalysis: boolean
    }
    layoutRecommendation?: LayoutRecommendation | null
}

function getDefaultExpirationDate() {
    const expiration = new Date()
    expiration.setDate(expiration.getDate() + 7)
    return expiration.toISOString().split('T')[0]
}

export function QuoteForm({ initialData, quickMode = false, starterMode = false, proSampleAvailable = false, plan, brandPreview, layoutRecommendation }: QuoteFormProps) {
    const isFree = isFreePlan(plan)
    const initialExperienceMode = initialData?.experienceMode || (isFree ? 'free_simple' : 'pro')
    const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
    const [loading, setLoading] = useState(false)
    const isSubmitting = useRef(false)
    const [date, setDate] = useState<string>(initialData?.expirationDate || getDefaultExpirationDate())
    const [clientName, setClientName] = useState(initialData?.clientName || '')
    const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '')
    const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || 'A combinar')
    const [notes, setNotes] = useState(initialData?.notes || '')
    const [itemDrafts, setItemDrafts] = useState<Record<string, Partial<Record<NumericQuoteItemField, string>>>>({})

    // Customization states
    // In a real app, these could come from initialData too if persisted
    const [showDetailedItems, setShowDetailedItems] = useState(initialData?.showDetailedItems || false)
    const [showTimeline, setShowTimeline] = useState(initialData?.showTimeline || false)
    const [showPaymentOptions, setShowPaymentOptions] = useState(initialData?.showPaymentOptions || false)
    const [estimatedDays, setEstimatedDays] = useState(initialData?.estimatedDays || '')
    const [cashDiscountType, setCashDiscountType] = useState(initialData?.cashDiscountType || 'percent')
    const [cashDiscount, setCashDiscount] = useState(
        initialData?.cashDiscountType === 'fixed'
            ? String(initialData?.cashDiscountFixed || '')
            : String(initialData?.cashDiscountPercent || '')
    )
    const [depositAmount, setDepositAmount] = useState(String(initialData?.depositAmount || ''))
    const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.paymentMethods || [])
    const [installmentCount, setInstallmentCount] = useState(initialData?.installmentCount || '')
    const [layoutStyle, setLayoutStyle] = useState(
        isFree && initialExperienceMode !== 'pro_sample'
            ? FREE_PROPOSAL_MODEL
            : initialData?.layoutStyle || FREE_PROPOSAL_MODEL,
    )
    const [professionalContext, setProfessionalContext] = useState(initialData?.professionalContext || 'general')
    const [experienceMode, setExperienceMode] = useState<'free_simple' | 'pro_sample' | 'pro'>(initialExperienceMode)
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(!quickMode)
    const [layoutManuallyChanged, setLayoutManuallyChanged] = useState(Boolean(initialData?.id))
    const starterTrackedRef = useRef(false)
    const logoPromptTrackedRef = useRef(false)
    const formViewTrackedRef = useRef(false)

    const router = useRouter()
    const posthog = usePostHog()
    const hasProPresentation = !isFree || experienceMode === 'pro_sample'

    useEffect(() => {
        if (!starterMode || items.length === 0 || starterTrackedRef.current) return

        starterTrackedRef.current = true
        captureEvent('test_quote_prefilled', {
            professional_context: professionalContext,
            item_count: items.length,
            product_item_count: items.filter((item) => item.itemType === 'product').length,
            catalog_source: 'onboarding',
            quick_mode: quickMode,
        })
    }, [items, professionalContext, quickMode, starterMode])

    useEffect(() => {
        if (!quickMode || !brandPreview || brandPreview.logoUrl || logoPromptTrackedRef.current) return

        logoPromptTrackedRef.current = true
        captureEvent('logo_prompt_viewed', {
            source: 'quote_form',
            professional_context: professionalContext,
            plan_type: isFree ? 'free' : 'paid',
        })
    }, [brandPreview, isFree, professionalContext, quickMode])

    useEffect(() => {
        if (formViewTrackedRef.current) return
        formViewTrackedRef.current = true
        captureEvent('quote_form_viewed', {
            quick_mode: quickMode,
            starter_mode: starterMode,
            plan_type: isFree ? 'free' : 'paid',
            professional_context: professionalContext,
            has_logo: Boolean(brandPreview?.logoUrl),
            has_prefilled_items: Boolean(initialData?.items?.length),
        })
    }, [brandPreview?.logoUrl, initialData?.items?.length, isFree, professionalContext, quickMode, starterMode])

    const handleAddItem = (product: {
        serviceId?: string | null
        itemType?: 'service' | 'product'
        name: string
        price: number
        quantity: number
        details?: string | null
        unitCost?: number
    }) => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            serviceId: product.serviceId || null,
            itemType: product.itemType || 'service',
            description: product.name,
            details: product.details || null,
            quantity: product.quantity,
            unitPrice: product.price,
            unitCost: product.unitCost || 0
        }
        setItems([...items, newItem])
        captureEvent('quote_item_added', {
            item_type: newItem.itemType,
            professional_context: professionalContext,
            quick_mode: quickMode,
        })
    }

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const handleVoiceSuggestion = (suggestion: VoiceProposalSuggestion) => {
        if (suggestion.clientName) setClientName(suggestion.clientName)
        if (suggestion.clientPhone) setClientPhone(suggestion.clientPhone)
        if (suggestion.estimatedDays) {
            setShowTimeline(true)
            setEstimatedDays(String(suggestion.estimatedDays))
        }
        if (suggestion.notes) {
            setNotes((current) => current.trim()
                ? `${current.trim()}\n${suggestion.notes}`
                : suggestion.notes || '')
        }
        if (suggestion.item) {
            handleAddItem({
                name: suggestion.item.description,
                price: suggestion.item.unitPrice,
                quantity: suggestion.item.quantity,
                itemType: 'service',
            })
        }
    }

    const handleUpdateItem = <Field extends keyof QuoteItem>(id: string, field: Field, value: QuoteItem[Field]) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
    }

    const handleItemNumberChange = (id: string, field: NumericQuoteItemField, value: string) => {
        setItemDrafts((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }))

        const parsed = parseBrazilianNumber(value)
        if (parsed !== null) {
            handleUpdateItem(id, field, parsed)
        }
    }

    const handleItemNumberBlur = (id: string, field: NumericQuoteItemField) => {
        setItemDrafts((current) => {
            const next = { ...current }
            const itemDraft = { ...(next[id] || {}) }
            delete itemDraft[field]

            if (Object.keys(itemDraft).length > 0) {
                next[id] = itemDraft
            } else {
                delete next[id]
            }

            return next
        })
    }

    const handleProfessionalContextChange = (contextId: string) => {
        const context = getProfessionalContext(contextId)

        setProfessionalContext(context.id)
        setShowTimeline(true)
        setEstimatedDays((current) => current || String(context.defaultEstimatedDays))
        setShowPaymentOptions(true)
        setPaymentMethods((current) => current.length > 0 ? current : [...context.suggestedPaymentMethods])

        if ((context.suggestedPaymentMethods as readonly string[]).includes('installment') && !installmentCount) {
            setInstallmentCount('3')
        }

        if (!notes.trim()) {
            setNotes(context.defaultNotes)
        }

        if (hasProPresentation && !layoutManuallyChanged && !initialData?.id) {
            setLayoutStyle(getLayoutRecommendationForContext(context.id).model)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        if (isSubmitting.current) return;

        if (items.length === 0) {
            captureEvent('quote_validation_failed', { reason: 'missing_item', quick_mode: quickMode })
            toast.error('Adicione pelo menos um item.')
            return
        }

        if (!clientName) {
            captureEvent('quote_validation_failed', { reason: 'missing_client_name', quick_mode: quickMode })
            toast.error('Informe o nome do cliente.')
            return
        }

        if (experienceMode === 'pro_sample' && (!brandPreview?.logoUrl || !clientPhone.trim())) {
            captureEvent('quote_validation_failed', {
                reason: !brandPreview?.logoUrl ? 'pro_sample_missing_logo' : 'pro_sample_missing_client_phone',
                quick_mode: quickMode,
            })
            toast.error('Para usar o Deguste Pro, envie sua logo e informe o WhatsApp do cliente.')
            return
        }

        isSubmitting.current = true;
        setLoading(true)
        formData.set('items', JSON.stringify(items))
        formData.set('clientName', clientName)
        if (clientPhone) formData.set('clientPhone', clientPhone)
        formData.set('expirationDate', date)
        formData.set('paymentTerms', paymentTerms)
        formData.set('notes', notes)

        // Add customization fields
        formData.set('show_detailed_items', String(showDetailedItems))
        formData.set('show_timeline', String(showTimeline))
        formData.set('show_payment_options', String(showPaymentOptions))
        if (showTimeline && estimatedDays) {
            formData.set('estimated_days', estimatedDays)
        }
        if (showPaymentOptions) {
            if (paymentMethods.length > 0) {
                formData.set('payment_methods', JSON.stringify(paymentMethods))
            }
            if (cashDiscount) {
                const normalizedCashDiscount = String(parseBrazilianNumber(cashDiscount) || 0)
                if (cashDiscountType === 'percent') {
                    formData.set('cash_discount_percent', normalizedCashDiscount)
                    formData.set('cash_discount_fixed', '0')
                } else {
                    formData.set('cash_discount_fixed', normalizedCashDiscount)
                    formData.set('cash_discount_percent', '0')
                }
                formData.set('cash_discount_type', cashDiscountType)
            }
            if (paymentMethods.includes('installment') && installmentCount) {
                formData.set('installment_count', installmentCount)
            }
        }
        formData.set('deposit_amount', hasProPresentation ? String(parseBrazilianNumber(depositAmount) || 0) : '0')
        formData.set('experience_mode', experienceMode)
        formData.set('layout_style', hasProPresentation ? layoutStyle : FREE_PROPOSAL_MODEL)
        formData.set('professional_context', professionalContext)

        const productItemCount = items.filter((item) => item.itemType === 'product').length
        const serviceItemCount = items.length - productItemCount
        const quoteAnalyticsPayload = {
            item_count: items.length,
            service_item_count: serviceItemCount,
            product_item_count: productItemCount,
            total_band: getQuoteTotalBand(total),
            has_client_phone: Boolean(clientPhone),
            layout_style: hasProPresentation ? layoutStyle : FREE_PROPOSAL_MODEL,
            professional_context: professionalContext,
            plan_type: isFree ? experienceMode : 'paid',
            quick_mode: quickMode,
            has_detailed_items: showDetailedItems,
            has_timeline: showTimeline,
            has_payment_options: showPaymentOptions,
            payment_method_count: paymentMethods.length,
            has_pix_deposit: hasProPresentation && (parseBrazilianNumber(depositAmount) || 0) > 0,
            proposal_readiness_score: readiness.score,
            layout_recommendation_model: activeRecommendation.model,
            layout_recommendation_source: activeRecommendation.source,
            layout_matches_recommendation: (hasProPresentation ? layoutStyle : FREE_PROPOSAL_MODEL) === activeRecommendation.model,
        }

        addExceptionStep(initialData?.id ? 'quote_update_started' : 'quote_create_started', quoteAnalyticsPayload)

        try {
            let result;
            if (initialData?.id) {
                result = await updateQuote(initialData.id, formData)
            } else {
                result = await createQuote(formData)
            }

            if (result?.error === 'LIMIT_REACHED') {
                const limitMessage = 'message' in result && typeof result.message === 'string'
                    ? result.message
                    : 'Limite de orçamentos atingido.'
                toast.error(limitMessage, {
                    action: {
                        label: 'Ver Planos',
                        onClick: () => router.push('/pricing')
                    },
                    duration: 10000,
                })
                posthog.capture('quote_limit_reached', quoteAnalyticsPayload)
                router.push('/pricing')
                return
            } else if (result?.error === 'PRO_SAMPLE_REQUIREMENTS') {
                posthog.capture('pro_sample_requirements_missing', quoteAnalyticsPayload)
                toast.error('message' in result && typeof result.message === 'string'
                    ? result.message
                    : 'Complete os dados da proposta para usar o Deguste Pro.')
            } else if (result?.error) {
                posthog.capture(initialData?.id ? 'quote_update_failed' : 'quote_create_failed', {
                    ...quoteAnalyticsPayload,
                    reason: 'action_error',
                })
                toast.error(result.error)
            } else if (result?.success) {
                const quoteId = 'quoteId' in result && typeof result.quoteId === 'string'
                    ? result.quoteId
                    : initialData?.id
                const trackedTotal = 'total' in result && typeof result.total === 'number'
                    ? result.total
                    : total
                const successPayload = {
                    ...quoteAnalyticsPayload,
                    quote_id: quoteId,
                    value: trackedTotal,
                    currency: 'BRL',
                    transaction_id: quoteId ? `quote_${quoteId}` : undefined,
                }

                if (initialData?.id) {
                    posthog.capture('quote_updated', successPayload)
                } else {
                    captureConversion('quote_created', successPayload)
                    captureActivationStage('quote_created_not_sent', {
                        ...successPayload,
                        starter_mode: starterMode,
                    })
                }
                toast.success(initialData?.id ? 'Orçamento atualizado!' : 'Orçamento criado!')
                if (result.redirect) {
                    router.push(result.redirect)
                }
            }
        } catch (error) {
            posthog.capture(initialData?.id ? 'quote_update_failed' : 'quote_create_failed', {
                ...quoteAnalyticsPayload,
                reason: 'unexpected_error',
            })
            captureException(error, {
                source: 'quote_form',
                flow: initialData?.id ? 'update_quote' : 'create_quote',
                ...quoteAnalyticsPayload,
            })
            toast.error('Erro ao salvar orçamento.')
        } finally {
            isSubmitting.current = false;
            setLoading(false)
        }
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)
    const contextRecommendation = getLayoutRecommendationForContext(professionalContext)
    const activeRecommendation = layoutRecommendation?.professionalContext === professionalContext
        ? layoutRecommendation
        : contextRecommendation
    const activeLayout = hasProPresentation ? layoutStyle : FREE_PROPOSAL_MODEL
    const hasStarterItems = starterMode && items.length > 0
    const canUseProSample = Boolean(
        proSampleAvailable
        && brandPreview?.logoUrl
        && clientName.trim()
        && clientPhone.trim()
        && items.length > 0
    )
    const canChooseExperience = Boolean(
        isFree
        && !initialData?.id
        && clientName.trim()
        && clientPhone.trim()
        && items.length > 0
    )
    const readiness = calculateProposalReadiness({
        clientName,
        clientPhone,
        items,
        total,
        expirationDate: date,
        paymentTerms,
        notes,
        showDetailedItems,
        showTimeline,
        estimatedDays,
        showPaymentOptions,
        paymentMethods,
        hasLogo: Boolean(brandPreview?.logoUrl),
        hasLogoAnalysis: Boolean(brandPreview?.hasLogoAnalysis),
        layoutMatchesRecommendation: activeLayout === activeRecommendation.model,
    })

    return (
        <form action={handleSubmit} className="pb-40 lg:pb-0">
            {/* Header Area */}
            <div className="mb-6 flex min-w-0 items-start gap-3 sm:mb-8 sm:items-center sm:gap-4">
                <Link href={initialData?.id ? `/quotes/${initialData.id}` : "/"}>
                    <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-full border-border">
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </Link>
                <div className="min-w-0">
                    <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                        {initialData?.id ? 'Editar Orçamento' : hasStarterItems ? 'Proposta teste em 2 minutos' : 'Novo Orçamento'}
                    </h1>
                    <p className="text-sm leading-5 text-muted-foreground">
                        {hasStarterItems
                            ? 'Revise os itens sugeridos, ajuste valores e salve quando estiver pronto.'
                            : 'Comece pelo cliente e pelos itens. O visual fica como ajuste opcional.'}
                    </p>
                </div>
            </div>

            {quickMode && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <p className="font-semibold">
                        {hasStarterItems ? 'Proposta teste ja preenchida' : 'Modo rápido para o primeiro orçamento'}
                    </p>
                    <p className="mt-1 text-emerald-800/80">
                        {hasStarterItems
                            ? 'Preparamos itens comuns para seu oficio. Troque cliente, quantidades e valores antes de enviar para alguem real.'
                            : 'Comece com cliente, itens e observações. Layout, pagamento e cronograma continuam disponíveis nos ajustes da proposta.'}
                    </p>
                </div>
            )}

            {canChooseExperience && (
                <Card className="mb-6 border-0 shadow-sm ring-1 ring-border">
                    <CardHeader className="pb-3 border-b border-border">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Escolha como testar o Zacly
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 pt-4 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => {
                                setExperienceMode('free_simple')
                                setLayoutStyle(FREE_PROPOSAL_MODEL)
                            }}
                            className={`rounded-2xl border p-4 text-left transition-all ${experienceMode === 'free_simple'
                                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                                }`}
                        >
                            <span className="flex items-start justify-between gap-3">
                                <span>
                                    <span className="block text-sm font-black text-foreground">Proposta simples gratis</span>
                                    <span className="mt-1 block text-xs leading-5">
                                        Modelo Profissional, marca Zacly e personalizacao limitada.
                                    </span>
                                </span>
                                {experienceMode === 'free_simple' && <Check className="h-4 w-4 text-primary" />}
                            </span>
                        </button>
                        <button
                            type="button"
                            disabled={!canUseProSample}
                            onClick={() => {
                                if (!canUseProSample) {
                                    captureEvent('pro_sample_blocked', {
                                        has_logo: Boolean(brandPreview?.logoUrl),
                                        has_client_name: Boolean(clientName.trim()),
                                        has_client_phone: Boolean(clientPhone.trim()),
                                        item_count: items.length,
                                    })
                                    return
                                }
                                setExperienceMode('pro_sample')
                                setShowAdvancedSettings(true)
                                if (!layoutManuallyChanged) {
                                    setLayoutStyle(activeRecommendation.model)
                                }
                            }}
                            className={`rounded-2xl border p-4 text-left transition-all ${experienceMode === 'pro_sample'
                                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary/20'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                                } ${!canUseProSample ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            <span className="flex items-start justify-between gap-3">
                                <span>
                                    <span className="block text-sm font-black text-foreground">Deguste Pro</span>
                                    <span className="mt-1 block text-xs leading-5">
                                        Uma proposta com logo, cores, modelos visuais e sem marca Zacly.
                                    </span>
                                    {!canUseProSample && (
                                        <span className="mt-2 inline-flex rounded-full bg-muted px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
                                            {!proSampleAvailable ? 'Ja usado' : 'Complete cliente, WhatsApp, item e logo'}
                                        </span>
                                    )}
                                </span>
                                {experienceMode === 'pro_sample' ? <Check className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4" />}
                            </span>
                        </button>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-8">

                {/* Main Column (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Data */}
                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ClientAutocomplete
                                defaultValue={clientName}
                                defaultPhone={clientPhone}
                                onSelect={(client) => {
                                    setClientName(client.name)
                                    setClientPhone(client.phone || '')
                                    captureEvent('quote_client_selected', {
                                        source: 'autocomplete',
                                        has_phone: Boolean(client.phone),
                                        quick_mode: quickMode,
                                    })
                                }}
                            />
                            <input type="hidden" name="clientPhone" value={clientPhone} />
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
                        <CardHeader className="pb-4 border-b border-border bg-muted/30">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                Itens e Serviços
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <ProductSearch onAddProduct={handleAddItem} />

                            <VoiceProposalAssistant onApply={handleVoiceSuggestion} />

                            {items.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Desktop Table Header */}
                                    <div className="hidden lg:grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-4 uppercase tracking-wider">
                                        <div className="col-span-5">Descrição</div>
                                        <div className="col-span-1 text-center">Qtd</div>
                                        <div className="col-span-3 text-right">Unitário</div>
                                        <div className="col-span-3 text-right">Total</div>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-1 items-center gap-2 rounded-xl border border-border bg-card p-3 shadow-sm transition-all hover:border-primary/30 hover:shadow-md sm:p-4 lg:grid-cols-12 lg:gap-2">

                                                <div className="lg:col-span-5 min-w-0">
                                                    <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.itemType === 'product'
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-200 bg-slate-50 text-slate-600'
                                                            }`}>
                                                            {item.itemType === 'product' ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                                                            {item.itemType === 'product' ? 'Produto' : 'Serviço'}
                                                        </span>
                                                        {item.itemType === 'product' && item.serviceId && (
                                                            <span className="text-[10px] text-muted-foreground">vinculado ao estoque</span>
                                                        )}
                                                    </div>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                        className="h-auto min-w-0 truncate border-transparent bg-transparent px-0 py-1 font-medium hover:border-slate-200 focus:border-emerald-500 lg:px-3"
                                                        placeholder="Descrição do item"
                                                    />
                                                </div>

                                                <div className="lg:col-span-1 flex items-center lg:justify-center">
                                                    <span className="lg:hidden text-sm text-muted-foreground mr-2">Qtd:</span>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={itemDrafts[item.id]?.quantity ?? formatNumberInput(item.quantity)}
                                                        onChange={(e) => handleItemNumberChange(item.id, 'quantity', e.target.value)}
                                                        onBlur={() => handleItemNumberBlur(item.id, 'quantity')}
                                                        className="w-16 text-center h-8"
                                                    />
                                                </div>

                                                <div className="lg:col-span-3 flex items-center lg:justify-end min-w-0">
                                                    <span className="lg:hidden text-sm text-muted-foreground mr-2 shrink-0">Unitário:</span>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={itemDrafts[item.id]?.unitPrice ?? formatNumberInput(item.unitPrice)}
                                                        onChange={(e) => handleItemNumberChange(item.id, 'unitPrice', e.target.value)}
                                                        onBlur={() => handleItemNumberBlur(item.id, 'unitPrice')}
                                                        className="w-full max-w-[120px] text-right h-8"
                                                    />
                                                </div>

                                                <div className="mt-2 flex min-w-0 items-center justify-between gap-2 border-t pt-3 lg:col-span-3 lg:mt-0 lg:justify-end lg:border-t-0 lg:pt-0">
                                                    <span className="min-w-0 truncate text-sm font-bold text-foreground">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-full"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {showDetailedItems && (
                                                    <div className="col-span-1 lg:col-span-12 mt-2">
                                                        <Textarea
                                                            value={item.details || ''}
                                                            onChange={(e) => handleUpdateItem(item.id, 'details', e.target.value)}
                                                            className="text-sm min-h-[60px] resize-none bg-muted/30 border-border"
                                                            placeholder="Detalhamento opcional do serviço ou produto..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-border">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Subtotal dos itens</p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                    <p className="text-muted-foreground">Nenhum item adicionado ainda.</p>
                                    <p className="text-sm text-muted-foreground/70">Use a busca acima para adicionar serviços ou produtos.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observations */}
                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle className="text-base font-semibold">Observações Finais</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Textarea
                                id="notes"
                                name="notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Ex: Garantia de 3 meses, condições especiais de entrega..."
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Right) - Sticky */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="lg:sticky lg:top-6 flex flex-col gap-6">
                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader className="pb-4 border-b border-border">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                        <Wrench className="h-4 w-4" />
                                    </div>
                                    Tipo de serviço
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-3">
                                <Select value={professionalContext} onValueChange={handleProfessionalContextChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Escolha o tipo de serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROFESSIONAL_CONTEXTS.map((context) => (
                                            <SelectItem key={context.id} value={context.id}>
                                                {context.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Ajusta sugestões de prazo, pagamento e texto sem travar sua proposta.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader className="pb-3 border-b border-border">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                        <Gauge className="h-4 w-4" />
                                    </div>
                                    Pontuacao da proposta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-4">
                                <div>
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-2xl font-black tracking-tight text-foreground">
                                                {readiness.score}% pronta
                                            </p>
                                            <p className="text-xs leading-5 text-muted-foreground">
                                                Sua proposta esta {readiness.label}.
                                            </p>
                                        </div>
                                        <span className="rounded-full border bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                                            Confianca
                                        </span>
                                    </div>
                                    <Progress value={readiness.score} className="mt-3 h-2" />
                                </div>

                                {readiness.improvements.length > 0 ? (
                                    <div className="space-y-2">
                                        {readiness.improvements.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex gap-2 text-xs leading-5 text-muted-foreground">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                        A proposta ja tem os pontos principais para passar seguranca ao cliente.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Summary & Save */}
                        <Card className="order-last lg:order-first border-0 shadow-lg ring-1 ring-border bg-slate-900 dark:bg-card text-white dark:text-card-foreground overflow-hidden">
                            <CardContent className="p-6">
                                <div className="space-y-1 mb-6">
                                    <p className="text-slate-400 dark:text-muted-foreground text-sm font-medium uppercase tracking-wider">Valor Total</p>
                                    <p className="text-4xl font-bold text-white dark:text-foreground tracking-tight">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                    </p>
                                </div>
                                <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-900/20 border-0" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    {initialData?.id ? 'Salvar alterações' : 'Finalizar orçamento'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Customization Options */}
                        {quickMode && !showAdvancedSettings ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto w-full justify-start gap-3 rounded-2xl border-dashed p-4 text-left"
                                onClick={() => setShowAdvancedSettings(true)}
                            >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                                <span className="flex min-w-0 flex-col items-start">
                                    <span className="font-semibold text-foreground">Mostrar ajustes da proposta</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        {!hasProPresentation ? 'Revise pagamento, cronograma e detalhes extras.' : 'Escolha layout, pagamento, cronograma e detalhes extras.'}
                                    </span>
                                </span>
                            </Button>
                        ) : (
                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader className="pb-3 border-b border-border bg-muted/30">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <Settings2 className="h-4 w-4" /> Ajustes da proposta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {/* Layout Style Selector */}
                                     <div className="p-4 space-y-3">
                                         <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                <LayoutTemplate className="h-4 w-4" />
                                            </div>
                                             <Label className="font-medium">Modelo visual</Label>
                                         </div>
                                        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                                            <div className="flex items-start gap-3">
                                                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-black text-foreground">
                                                        {activeRecommendation.title}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                        Sugerido: {getProposalModelName(activeRecommendation.model)}. {activeRecommendation.evidence || activeRecommendation.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                         {!hasProPresentation && (
                                             <div className="rounded-xl border bg-muted/40 p-3 text-xs leading-5 text-muted-foreground">
                                                <div className="flex items-start gap-2">
                                                    <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                                                    <p>
                                                        A proposta simples gratis usa o modelo Profissional. Use o deguste Pro para testar os outros modelos uma vez.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {PROPOSAL_MODELS.map((l) => {
                                                const locked = !hasProPresentation && l.id !== FREE_PROPOSAL_MODEL
                                                const selected = activeLayout === l.id

                                                return (
                                                    <button
                                                        key={l.id}
                                                         type="button"
                                                         disabled={locked}
                                                         onClick={() => {
                                                            if (!locked) {
                                                                setLayoutManuallyChanged(true)
                                                                setLayoutStyle(l.id)
                                                            }
                                                         }}
                                                        className={`relative p-3 rounded-xl border-2 text-center transition-all text-xs font-semibold ${selected
                                                            ? 'border-primary bg-primary/5 text-primary'
                                                            : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                                                            } ${locked ? 'cursor-not-allowed opacity-60 hover:border-border' : ''}`}
                                                    >
                                                         {selected && <Check className="absolute top-1.5 right-1.5 h-3 w-3 text-primary" />}
                                                         {locked && <Lock className="absolute top-1.5 right-1.5 h-3 w-3 text-muted-foreground" />}
                                                         <span>{l.name}</span>
                                                        {activeRecommendation.model === l.id && (
                                                            <span className="mt-1 block text-[10px] uppercase tracking-wide text-primary">
                                                                Recomendado
                                                            </span>
                                                        )}
                                                         {locked && <span className="mt-1 block text-[10px] uppercase tracking-wide">Pro</span>}
                                                     </button>
                                                )
                                            })}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-snug">
                                            {!hasProPresentation ? 'O modelo Profissional foi escolhido por manter a proposta clara e confiavel.' : 'Cada orcamento salva o modelo escolhido no momento da criacao.'}
                                        </p>
                                        {brandPreview && (
                                            <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-background">
                                                        {brandPreview.logoUrl ? (
                                                            <Image src={brandPreview.logoUrl} alt="Logo" fill className="object-contain p-1.5" unoptimized />
                                                        ) : (
                                                            <Sparkles className="h-5 w-5 text-primary" />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="h-2.5 w-2.5 rounded-full"
                                                                style={{ backgroundColor: brandPreview.accentColor || '#0D9B5C' }}
                                                            />
                                                            <p className="truncate text-xs font-black text-foreground">
                                                                {brandPreview.logoUrl ? 'PDF com sua marca' : 'PDF pronto para receber sua logo'}
                                                            </p>
                                                        </div>
                                                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                            {brandPreview.logoUrl
                                                                ? `${brandPreview.businessName || 'Sua empresa'} aparecera no cabecalho da proposta.`
                                                                : 'Envie a logo para o Zacly analisar cores e montar um visual mais confiavel automaticamente.'}
                                                        </p>
                                                        {!brandPreview.logoUrl && (
                                                            <Link
                                                                href="/profile?focus=logo"
                                                                className="mt-2 inline-flex text-[11px] font-bold text-primary hover:underline"
                                                                onClick={() => captureEvent('logo_prompt_clicked', {
                                                                    source: 'quote_form',
                                                                    professional_context: professionalContext,
                                                                })}
                                                            >
                                                                Adicionar logo
                                                            </Link>
                                                        )}
                                                        {brandPreview.logoUrl && brandPreview.hasLogoAnalysis && (
                                                            <p className="mt-2 text-[11px] font-semibold text-primary">
                                                                Visual analisado automaticamente.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <Label className="font-medium">Condições comerciais</Label>
                                        </div>
                                        <div className="grid gap-3">
                                            <div>
                                                <Label htmlFor="expirationDate" className="mb-1.5 block text-xs text-muted-foreground">
                                                    Validade da proposta
                                                </Label>
                                                <Input
                                                    id="expirationDate"
                                                    name="expirationDate"
                                                    type="date"
                                                    value={date}
                                                    onChange={(event) => setDate(event.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="paymentTerms" className="mb-1.5 block text-xs text-muted-foreground">
                                                    Condição combinada
                                                </Label>
                                                <Input
                                                    id="paymentTerms"
                                                    name="paymentTerms"
                                                    value={paymentTerms}
                                                    onChange={(event) => setPaymentTerms(event.target.value)}
                                                    placeholder="Ex: 50% no início e 50% na entrega"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Detailed Items Toggle */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <AlignLeft className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_detailed" className="font-medium cursor-pointer">Mostrar detalhes dos itens</Label>
                                                    <Checkbox
                                                        id="show_detailed"
                                                        checked={showDetailedItems}
                                                        onCheckedChange={(checked) => setShowDetailedItems(checked as boolean)}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 leading-snug">Exibe descrições extras de produtos e serviços no documento.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_timeline" className="font-medium cursor-pointer">Cronograma</Label>
                                                    <Checkbox
                                                        id="show_timeline"
                                                        checked={showTimeline}
                                                        onCheckedChange={(checked) => setShowTimeline(checked as boolean)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {showTimeline && (
                                            <div className="pr-1 sm:pl-11 animate-in slide-in-from-top-2 duration-200">
                                                <Label className="text-xs text-muted-foreground mb-1.5 block">Dias estimados</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Ex: 5"
                                                    value={estimatedDays}
                                                    onChange={(e) => setEstimatedDays(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_payment" className="font-medium cursor-pointer">Pagamento</Label>
                                                    <Checkbox
                                                        id="show_payment"
                                                        checked={showPaymentOptions}
                                                        onCheckedChange={(checked) => setShowPaymentOptions(checked as boolean)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {showPaymentOptions && (
                                            <div className="pr-1 space-y-3 sm:pl-11 animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'pix', label: 'PIX' },
                                                        { value: 'cash', label: 'Dinheiro' },
                                                        { value: 'card', label: 'Cartão' },
                                                        { value: 'installment', label: 'Parcelado' },
                                                    ].map((m) => (
                                                        <div key={m.value} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={m.value}
                                                                checked={paymentMethods.includes(m.value)}
                                                                onCheckedChange={(c) => {
                                                                    if (c) setPaymentMethods([...paymentMethods, m.value])
                                                                    else setPaymentMethods(paymentMethods.filter(x => x !== m.value))
                                                                }}
                                                            />
                                                            <Label htmlFor={m.value} className="text-xs">{m.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>

                                                {paymentMethods.includes('installment') && (
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">Número de parcelas</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Ex: 12"
                                                            value={installmentCount}
                                                            onChange={(e) => setInstallmentCount(e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                )}

                                                {hasProPresentation ? (
                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <Label className="text-xs font-bold text-emerald-950">Solicitar sinal via Pix</Label>
                                                                <p className="mt-1 text-[11px] leading-4 text-emerald-800">O cliente recebe QR Code e copia e cola. A confirmacao continua manual no seu extrato.</p>
                                                            </div>
                                                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-emerald-700">Pro</span>
                                                        </div>
                                                        <Input
                                                            type="text"
                                                            inputMode="decimal"
                                                            placeholder="Valor do sinal, ex: 150,00"
                                                            value={depositAmount}
                                                            onChange={(event) => setDepositAmount(event.target.value)}
                                                            className="mt-3 h-8 border-emerald-200 bg-white text-sm"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                                                        <p className="font-bold text-slate-800">Sinal via Pix no Pro</p>
                                                        <p className="mt-1">Envie QR Code e copia e cola da sua chave Pix, sem taxa e sem intermediacao da Zacly.</p>
                                                    </div>
                                                )}

                                                {(paymentMethods.includes('pix') || paymentMethods.includes('cash')) && (
                                                    <div>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">Desconto à vista</Label>
                                                        <div className="flex gap-2">
                                                            <div className="flex bg-muted rounded-md p-1 self-start">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCashDiscountType('percent')}
                                                                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-all ${cashDiscountType === 'percent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                                                >%</button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCashDiscountType('fixed')}
                                                                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-all ${cashDiscountType === 'fixed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                                                >R$</button>
                                                            </div>
                                                            <Input
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder={cashDiscountType === 'percent' ? "Ex: 5" : "Ex: 100,00"}
                                                                value={cashDiscount}
                                                                onChange={(e) => setCashDiscount(e.target.value)}
                                                                className="h-8 text-sm flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        )}
                    </div>
                </div>

                {/* Mobile Floating Button - Visible only on mobile */}
                <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/95 px-3 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
                    <div className="mx-auto max-w-2xl">
                        <Button type="submit" size="lg" className="w-full bg-emerald-600 font-bold" disabled={loading}>
                            {loading ? 'Salvando...' : `Salvar (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)})`}
                        </Button>
                    </div>
                </div>

            </div>
        </form>
    )
}
