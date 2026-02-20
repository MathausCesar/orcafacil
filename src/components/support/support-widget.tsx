'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, Send, MessageSquarePlus, Lightbulb, Loader2, BookOpen, X } from 'lucide-react'
import { toast } from 'sonner'
import { createSupportTicket } from '@/app/actions/support'

export function SupportWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'faq' | 'ticket'>('faq')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            await createSupportTicket(formData)
            toast.success('Mensagem enviada!', {
                description: 'Recebemos seu contato e retornaremos em breve.'
            })
            // Reset form by closing popover or switching tab
            setIsOpen(false)
            setActiveTab('faq')
        } catch (error: any) {
            toast.error('Erro ao enviar', {
                description: error.message || 'Tente novamente mais tarde.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    size="icon"
                    className="fixed bottom-20 md:bottom-6 right-4 md:right-6 h-14 w-14 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all z-50 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[calc(100vw-2rem)] sm:w-[380px] p-0 rounded-2xl shadow-xl border-zinc-200 overflow-hidden mb-2 sm:mb-0 sm:mr-6"
                align="end"
                sideOffset={16}
            >
                {/* Header */}
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                    <HelpCircle className="h-10 w-10 mx-auto mb-3 text-emerald-100" />
                    <h3 className="font-bold text-lg">Central de Ajuda</h3>
                    <p className="text-emerald-100 text-sm mt-1">Como podemos ajudar o seu negócio hoje?</p>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-100 bg-zinc-50/50">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'faq' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        onClick={() => setActiveTab('faq')}
                    >
                        <BookOpen className="h-4 w-4" /> Tutoriais
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'ticket' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-zinc-500 hover:text-zinc-700'
                            }`}
                        onClick={() => setActiveTab('ticket')}
                    >
                        <MessageSquarePlus className="h-4 w-4" /> Contato
                    </button>
                </div>

                {/* Content Area */}
                <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto p-4 bg-white scrollbar-thin scrollbar-thumb-zinc-200">
                    {/* FAQ TAB */}
                    {activeTab === 'faq' && (
                        <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1" className="border-zinc-100">
                                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-emerald-600">
                                        Como criar um novo cliente?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-600 leading-relaxed">
                                        Vá até a aba <strong>Clientes</strong> no menu principal e clique no botão <strong>"Novo Cliente"</strong>. Preencha os dados básicos (Nome e WhatsApp são muito importantes para o envio do orçamento!) e clique em Salvar.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2" className="border-zinc-100">
                                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-emerald-600">
                                        Como cadastrar serviços/produtos?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-600 leading-relaxed">
                                        Acesse a página de <strong>Serviços/Produtos</strong>. Você pode adicionar itens frequentes que você sempre vende. Quando for montar o orçamento, esses itens aparecerão na busca rápida, poupando seu tempo na digitação!
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3" className="border-zinc-100">
                                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-emerald-600">
                                        O que significa o status "Em Análise"?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-600 leading-relaxed">
                                        <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold mb-2">Em Análise</span><br />
                                        É o status padrão de quando você gera um orçamento. Significa que ele está válido, aguardando aprovação sua ou do seu cliente. Ao enviar o link, o cliente pode clicar em "Aprovar" pelo próprio celular!
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-4" className="border-zinc-100 border-b-0">
                                    <AccordionTrigger className="text-sm font-semibold hover:no-underline hover:text-emerald-600">
                                        Como personalizo meu layout?
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-600 leading-relaxed">
                                        Vá em <strong>Configurações</strong>. Lá você pode anexar a logo da sua empresa, escolher a cor principal que aparece em todos os orçamentos e documentos, além de definir detalhes como site e CNPJ.
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )}

                    {/* TICKET TAB */}
                    {activeTab === 'ticket' && (
                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                            <form action={handleSubmit} className="space-y-4 pt-2">
                                <p className="text-sm text-zinc-500 mb-4">
                                    Encontrou um erro ou tem uma sugestão genial para o aplicativo? Mande pra gente!
                                </p>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Motivo do Contato</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <label className="cursor-pointer">
                                            <input type="radio" name="type" value="doubt" className="peer sr-only" defaultChecked />
                                            <div className="rounded-lg border-2 border-zinc-200 p-3 text-center peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 transition-all">
                                                <HelpCircle className="h-5 w-5 mx-auto mb-1 opacity-70" />
                                                <span className="text-xs font-bold">Dúvida / Erro</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name="type" value="suggestion" className="peer sr-only" />
                                            <div className="rounded-lg border-2 border-zinc-200 p-3 text-center peer-checked:border-amber-500 peer-checked:bg-amber-50 peer-checked:text-amber-700 transition-all">
                                                <Lightbulb className="h-5 w-5 mx-auto mb-1 opacity-70" />
                                                <span className="text-xs font-bold">Ideia / Melhoria</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="subject" className="text-xs font-semibold uppercase text-zinc-500">Assunto</label>
                                    <input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        required
                                        placeholder="Ex: Como posso ocultar meu CPF?"
                                        className="w-full text-sm rounded-lg border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-xs font-semibold uppercase text-zinc-500">Mensagem</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        placeholder="Descreva com o máximo de detalhes..."
                                        className="w-full text-sm rounded-lg border border-zinc-200 bg-transparent px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-[0.98] transition-all"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Enviar Mensagem
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
