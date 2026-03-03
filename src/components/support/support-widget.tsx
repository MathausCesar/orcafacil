'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    HelpCircle, Send, MessageSquarePlus, Lightbulb, Loader2,
    BookOpen, X, Search, ThumbsUp, Bug, Star, Plus, ChevronDown, ChevronUp,
    Clock, CheckCircle2, CircleDot, XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
    createSupportTicket,
    getMyTickets,
    getSuggestions,
    createSuggestion,
    toggleVote,
} from '@/app/actions/support'

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

type TicketType = 'doubt' | 'bug' | 'suggestion' | 'praise'
type Tab = 'faq' | 'ticket' | 'ideas'

interface Ticket {
    id: string
    type: string
    subject: string
    status: string
    admin_reply: string | null
    created_at: string
}

interface Suggestion {
    id: string
    title: string
    description: string | null
    status: string
    votes_count: number
    user_voted: boolean
    created_at: string
}

// ──────────────────────────────────────────────────────────────────────────────
// FAQ Data — 15+ perguntas em 4 categorias
// ──────────────────────────────────────────────────────────────────────────────

const FAQ_ITEMS = [
    // Orçamentos
    { category: 'Orçamentos', q: 'Como criar um novo orçamento?', a: 'No painel principal, clique em "Novo Orçamento". Selecione ou crie um cliente, adicione os itens/serviços e clique em Gerar Orçamento. Em menos de 1 minuto o PDF estará pronto!' },
    { category: 'Orçamentos', q: 'Como envio o link de aprovação para o cliente?', a: 'Após gerar o orçamento, copie o "Link de Aprovação" e envie pelo WhatsApp. O cliente abre no celular, visualiza o PDF e clica em Aprovar — você recebe a notificação na hora.' },
    { category: 'Orçamentos', q: 'O que significa o status "Em Análise"?', a: 'É o status padrão quando o orçamento é gerado. Significa que está válido e aguardando aprovação. Quando o cliente aprovar pelo link, o status muda para "Aprovado" automaticamente.' },
    { category: 'Orçamentos', q: 'Posso editar um orçamento já criado?', a: 'Sim! Acesse o orçamento na lista e clique em Editar. Você pode alterar itens, valores, datas e condições. O link de aprovação se mantém o mesmo.' },
    { category: 'Orçamentos', q: 'Como adiciono desconto no orçamento?', a: 'No formulário de criação, há um campo "Desconto (%)". Você também pode configurar desconto automático para pagamento PIX/Dinheiro em Perfil → Configurações.' },
    { category: 'Orçamentos', q: 'Quantos orçamentos posso criar no plano gratuito?', a: 'O plano gratuito permite até 5 orçamentos por mês. Para orçamentos ilimitados, assine o plano Pro.' },
    // Clientes
    { category: 'Clientes', q: 'Como cadastrar um novo cliente?', a: 'Vá em Clientes → Novo Cliente. Preencha Nome e WhatsApp (essenciais para o envio do orçamento) e clique em Salvar.' },
    { category: 'Clientes', q: 'Como cadastrar serviços e produtos?', a: 'Acesse Serviços/Produtos. Você pode cadastrar itens frequentes com o preço padrão. Ao montar um orçamento, eles aparecem na busca rápida — sem precisar redigitar toda vez.' },
    { category: 'Clientes', q: 'Posso emitir orçamento para pessoa jurídica (empresa)?', a: 'Sim! No cadastro do cliente, selecione "Pessoa Jurídica" e informe a Razão Social. Os dados aparecem corretamente no PDF.' },
    // Conta & Plano
    { category: 'Conta & Plano', q: 'Como faço upgrade para o plano Pro?', a: 'Acesse Configurações → Plano & Cobrança (ou o banner de upgrade no painel). Escolha o plano mensal ou anual e finalize pelo checkout seguro.' },
    { category: 'Conta & Plano', q: 'Como cancelo minha assinatura?', a: 'Acesse Configurações → Plano & Cobrança → Cancelar Assinatura. O acesso Pro permanece ativo até o fim do período pago.' },
    { category: 'Conta & Plano', q: 'Como altero minha senha?', a: 'Vá em Perfil → Segurança. Clique em "Alterar Senha" e siga o fluxo por e-mail. Por segurança, um link de redefinição será enviado para o seu e-mail cadastrado.' },
    // PDF & Aprovação
    { category: 'PDF & Aprovação', q: 'Como personalizo o visual do PDF?', a: 'Em Perfil → Configurações você pode: adicionar a logo da empresa, escolher a cor principal, definir CNPJ/site e configurar o layout (Clássico, Moderno ou Profissional).' },
    { category: 'PDF & Aprovação', q: 'Meu cliente aprovou — o que acontece?', a: 'Você recebe uma notificação e o status do orçamento muda para "Aprovado". É sinal de negócio fechado! 🎉' },
    { category: 'PDF & Aprovação', q: 'O PDF sai com marca d\'água no plano gratuito?', a: 'No plano gratuito, o PDF é gerado sem marca d\'água mas sem a logo da empresa. Com o plano Pro, a logo aparece em todos os PDFs.' },
]

const TICKET_TYPES: { value: TicketType; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'bug', label: 'Bug / Erro', icon: <Bug className="h-4 w-4" />, color: 'peer-checked:border-red-500 peer-checked:bg-red-500/10 peer-checked:text-red-500' },
    { value: 'doubt', label: 'Dúvida', icon: <HelpCircle className="h-4 w-4" />, color: 'peer-checked:border-blue-500 peer-checked:bg-blue-500/10 peer-checked:text-blue-500' },
    { value: 'suggestion', label: 'Sugestão', icon: <Lightbulb className="h-4 w-4" />, color: 'peer-checked:border-amber-500 peer-checked:bg-amber-500/10 peer-checked:text-amber-500' },
    { value: 'praise', label: 'Elogio', icon: <Star className="h-4 w-4" />, color: 'peer-checked:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-600' },
]

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    open: { label: 'Aberto', icon: <CircleDot className="h-3 w-3" />, cls: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' },
    in_progress: { label: 'Em análise', icon: <Loader2 className="h-3 w-3" />, cls: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' },
    answered: { label: 'Respondido', icon: <CheckCircle2 className="h-3 w-3" />, cls: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' },
    closed: { label: 'Fechado', icon: <XCircle className="h-3 w-3" />, cls: 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700' },
}

const SUGGESTION_STATUS: Record<string, { label: string; cls: string }> = {
    open: { label: 'Em análise', cls: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400' },
    planned: { label: 'Planejado', cls: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400' },
    done: { label: 'Concluído', cls: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' },
    rejected: { label: 'Recusado', cls: 'text-zinc-500 bg-zinc-100 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400' },
}

// ──────────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────────

function FaqTab() {
    const [query, setQuery] = useState('')
    const [openIdx, setOpenIdx] = useState<number | null>(null)

    const filteredFaqs = query.trim().length < 2
        ? FAQ_ITEMS
        : FAQ_ITEMS.filter(item =>
            item.q.toLowerCase().includes(query.toLowerCase()) ||
            item.a.toLowerCase().includes(query.toLowerCase())
        )

    const grouped = filteredFaqs.reduce<Record<string, typeof FAQ_ITEMS>>((acc, item) => {
        ; (acc[item.category] ??= []).push(item)
        return acc
    }, {})

    return (
        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            {/* Search */}
            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                    type="search"
                    value={query}
                    onChange={e => { setQuery(e.target.value); setOpenIdx(null) }}
                    placeholder="Buscar nas dúvidas..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-transparent outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-foreground placeholder:text-muted-foreground"
                />
            </div>

            {filteredFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    <p className="mb-1 font-medium">Nenhuma resposta encontrada</p>
                    <p className="text-xs">Tente outras palavras ou abra um chamado na aba Contato</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(grouped).map(([category, items]) => (
                        <div key={category}>
                            {query.trim().length < 2 && (
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5 px-0.5">{category}</p>
                            )}
                            <div className="space-y-0 divide-y divide-border rounded-lg border border-border overflow-hidden">
                                {items.map((item, i) => {
                                    const idx = FAQ_ITEMS.indexOf(item)
                                    const isOpen = openIdx === idx
                                    return (
                                        <div key={i}>
                                            <button
                                                type="button"
                                                onClick={() => setOpenIdx(isOpen ? null : idx)}
                                                className="w-full flex items-start justify-between gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors group"
                                            >
                                                <span className="text-sm font-medium text-foreground group-hover:text-emerald-600 transition-colors leading-snug">{item.q}</span>
                                                {isOpen
                                                    ? <ChevronUp className="shrink-0 mt-0.5 h-4 w-4 text-emerald-500" />
                                                    : <ChevronDown className="shrink-0 mt-0.5 h-4 w-4 text-muted-foreground" />
                                                }
                                            </button>
                                            {isOpen && (
                                                <div className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed bg-muted/30 animate-in fade-in slide-in-from-top-1 duration-200">
                                                    {item.a}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function TicketTab({ onSwitchToIdeas }: { onSwitchToIdeas: () => void }) {
    const [loading, setLoading] = useState(false)
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [showHistory, setShowHistory] = useState(false)
    const [formKey, setFormKey] = useState(0)

    useEffect(() => {
        getMyTickets().then(setTickets)
    }, [formKey])

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await createSupportTicket(formData)
            toast.success('Mensagem enviada! 🎉', {
                description: 'Recebemos seu contato e retornaremos em breve.',
            })
            setFormKey(k => k + 1)
        } catch (error: any) {
            toast.error('Erro ao enviar', { description: error.message || 'Tente novamente.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-4">
            <form key={formKey} action={handleSubmit} className="space-y-3">
                {/* Tipos de ticket */}
                <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Motivo do contato</p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {TICKET_TYPES.map((t, i) => (
                            <label key={t.value} className="cursor-pointer">
                                <input type="radio" name="type" value={t.value} className="peer sr-only" defaultChecked={i === 0} />
                                <div className={`rounded-lg border-2 border-border p-2.5 text-center transition-all ${t.color}`}>
                                    <div className="flex justify-center mb-1 opacity-70">{t.icon}</div>
                                    <span className="text-[10px] font-bold leading-tight block">{t.label}</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Assunto */}
                <div className="space-y-1">
                    <label htmlFor="ticket-subject" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assunto</label>
                    <input
                        id="ticket-subject"
                        name="subject"
                        type="text"
                        required
                        placeholder="Ex: Não consigo gerar o PDF..."
                        className="w-full text-sm rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                {/* Mensagem */}
                <div className="space-y-1">
                    <label htmlFor="ticket-msg" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Mensagem</label>
                    <textarea
                        id="ticket-msg"
                        name="message"
                        required
                        rows={3}
                        placeholder="Descreva com o máximo de detalhes..."
                        className="w-full text-sm rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-foreground placeholder:text-muted-foreground"
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] transition-all">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Enviar
                </Button>
            </form>

            {/* Histórico */}
            {tickets.length > 0 && (
                <div className="border-t border-border pt-3">
                    <button
                        type="button"
                        onClick={() => setShowHistory(v => !v)}
                        className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Meus chamados ({tickets.length})
                        {showHistory ? <ChevronUp className="ml-auto h-3.5 w-3.5" /> : <ChevronDown className="ml-auto h-3.5 w-3.5" />}
                    </button>
                    {showHistory && (
                        <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                            {tickets.map(ticket => {
                                const st = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open
                                return (
                                    <div key={ticket.id} className="rounded-lg border border-border p-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-medium text-foreground line-clamp-1">{ticket.subject}</span>
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap ${st.cls}`}>
                                                {st.icon} {st.label}
                                            </span>
                                        </div>
                                        {ticket.admin_reply && (
                                            <p className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded p-2 leading-relaxed">
                                                💬 {ticket.admin_reply}
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function IdeasTab() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [votingId, setVotingId] = useState<string | null>(null)
    const [formKey, setFormKey] = useState(0)

    useEffect(() => {
        getSuggestions().then(data => {
            setSuggestions(data as Suggestion[])
            setLoading(false)
        })
    }, [formKey])

    async function handleVote(id: string) {
        if (votingId) return
        setVotingId(id)
        // Optimistic update
        setSuggestions(prev => prev.map(s =>
            s.id === id
                ? { ...s, user_voted: !s.user_voted, votes_count: s.user_voted ? s.votes_count - 1 : s.votes_count + 1 }
                : s
        ))
        try {
            await toggleVote(id)
        } catch {
            // Reverter se falhar
            setSuggestions(prev => prev.map(s =>
                s.id === id
                    ? { ...s, user_voted: !s.user_voted, votes_count: s.user_voted ? s.votes_count - 1 : s.votes_count + 1 }
                    : s
            ))
            toast.error('Erro ao votar')
        } finally {
            setVotingId(null)
        }
    }

    async function handleCreate(formData: FormData) {
        setSubmitting(true)
        try {
            await createSuggestion(formData)
            toast.success('Ideia enviada! 💡', { description: 'Obrigado pela sugestão!' })
            setShowForm(false)
            setFormKey(k => k + 1)
        } catch (error: any) {
            toast.error('Erro ao enviar', { description: error.message })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Vote nas ideias que você também quer! 🗳️</p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(v => !v)}
                    className="h-7 px-2 text-xs gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                >
                    <Plus className="h-3 w-3" />
                    Nova ideia
                </Button>
            </div>

            {showForm && (
                <form key={formKey} action={handleCreate} className="border border-emerald-500/30 rounded-xl p-3 bg-emerald-500/5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Sua sugestão</p>
                    <input
                        name="title"
                        required
                        maxLength={100}
                        placeholder="Título curto e direto..."
                        className="w-full text-sm rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-foreground placeholder:text-muted-foreground"
                    />
                    <textarea
                        name="description"
                        rows={2}
                        placeholder="Descreva mais (opcional)..."
                        className="w-full text-sm rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none text-foreground placeholder:text-muted-foreground"
                    />
                    <Button type="submit" disabled={submitting} size="sm" className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
                        {submitting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
                        Enviar ideia
                    </Button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>Nenhuma sugestão ainda.</p>
                    <p className="text-xs mt-1">Seja o primeiro a enviar uma ideia!</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {suggestions.map(s => {
                        const st = SUGGESTION_STATUS[s.status] ?? SUGGESTION_STATUS.open
                        return (
                            <div key={s.id} className="rounded-xl border border-border p-3 hover:border-emerald-500/30 transition-colors group">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground leading-snug">{s.title}</p>
                                        {s.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{s.description}</p>
                                        )}
                                        <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-1.5 ${st.cls}`}>
                                            {st.label}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleVote(s.id)}
                                        disabled={!!votingId}
                                        className={`shrink-0 flex flex-col items-center gap-0.5 rounded-xl border-2 px-2.5 py-2 transition-all active:scale-95 ${s.user_voted
                                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                                            : 'border-border hover:border-emerald-400 text-muted-foreground hover:text-emerald-600'
                                            }`}
                                    >
                                        <ThumbsUp className={`h-3.5 w-3.5 transition-transform ${s.user_voted ? 'scale-110' : ''}`} />
                                        <span className="text-[11px] font-bold">{s.votes_count}</span>
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Widget
// ──────────────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'faq', label: 'Ajuda', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'ticket', label: 'Contato', icon: <MessageSquarePlus className="h-3.5 w-3.5" /> },
    { id: 'ideas', label: 'Ideias', icon: <Lightbulb className="h-3.5 w-3.5" /> },
]

export function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<Tab>('faq')

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-20 md:bottom-6 right-4 md:right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-50 bg-emerald-600 hover:bg-emerald-700 text-white"
                    aria-label="Central de Ajuda"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-[calc(100vw-2rem)] sm:w-[400px] p-0 rounded-2xl shadow-xl border-border overflow-hidden mb-2 sm:mb-0 sm:mr-6"
                align="end"
                sideOffset={16}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 px-6 py-5 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                            <HelpCircle className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base leading-tight">Central de Ajuda</h3>
                            <p className="text-emerald-100 text-xs mt-0.5">Como podemos ajudar hoje?</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-border bg-muted/30">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${activeTab === tab.id
                                ? 'text-emerald-600 border-b-2 border-emerald-500 bg-background'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="max-h-[65vh] sm:max-h-[440px] overflow-y-auto p-4 bg-background scrollbar-thin scrollbar-thumb-border">
                    {activeTab === 'faq' && <FaqTab />}
                    {activeTab === 'ticket' && <TicketTab onSwitchToIdeas={() => setActiveTab('ideas')} />}
                    {activeTab === 'ideas' && <IdeasTab />}
                </div>
            </PopoverContent>
        </Popover>
    )
}
