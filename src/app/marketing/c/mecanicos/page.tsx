import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Star, Zap, Clock, TrendingUp, Shield, Wrench, AlertTriangle, Quote } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/marketing/marketing-footer';

export const metadata: Metadata = {
    title: 'Zacly | O Fim dos Orçamentos de Boca na Oficina',
    description: 'Pare de perder dinheiro e tempo anotando peças em papel sujo de graxa. Envie orçamentos em PDF direto do elevador.',
};

export default function MechanicLandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-300 selection:bg-white/20">
            {/* CABEÇALHO SIMPLIFICADO PARA CONVERSÃO (Sem Links de Fuga) */}
            <header className="absolute top-0 w-full z-50 border-b border-white/5 bg-zinc-950/50 backdrop-blur-md">
                <div className="container h-16 flex items-center justify-between px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-xl font-bold text-white tracking-tight">Zacly.</span>
                    </Link>
                    <Link
                        href="https://app.zacly.com.br/login"
                        className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                    >
                        Já tenho conta
                    </Link>
                </div>
            </header>

            <main className="flex-1">
                {/* HERO SECTION */}
                <section className="relative overflow-hidden pt-28 pb-24 lg:pt-40 lg:pb-32">
                    {/* Subtle Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-[100%] pointer-events-none" />

                    <div className="container relative z-10 px-4 md:px-6">
                        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">

                            {/* Copy / CTA */}
                            <div className="flex-1 text-center lg:text-left space-y-8">
                                <div className="inline-flex items-center rounded-full border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 text-sm font-medium text-emerald-400 mb-2">
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Feito por quem entende de graxa e oficina cheia.
                                </div>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                                    O cliente achou caro? <br />
                                    <span className="text-zinc-500">A culpa é do seu orçamento.</span>
                                </h1>

                                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                                    Pare de perder dinheiro anotando peças num bloco de papel. Gere um <strong className="text-white">PDF com a sua logo</strong> em 30 segundos, mande pelo WhatsApp e veja o cliente fechar sem choro de preço.
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                    <Link
                                        href="https://app.zacly.com.br/register"
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 h-14 px-8 rounded-full text-base font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors group shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                                    >
                                        Começar Teste Grátis Agora
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5 mt-2 sm:mt-0">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        7 dias grátis. Não precisa de cartão.
                                    </p>
                                </div>

                                {/* Social Proof Mini */}
                                <div className="pt-6 flex flex-col items-center lg:items-start gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-amber-500">
                                            {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                        </div>
                                        <span className="text-sm font-medium text-zinc-400"><strong className="text-zinc-300">+2.500</strong> orçamentos em PDF já gerados.</span>
                                    </div>
                                </div>
                            </div>

                            {/* Mockup Visual - Celular Sujo / Realidade */}
                            <div className="flex-1 w-full max-w-[500px] lg:max-w-none relative">
                                <div className="absolute inset-0 bg-zinc-800 blur-3xl opacity-20 rounded-full" />

                                {/* Mockup do Celular Simples (Dark Mode) */}
                                <div className="relative z-10 mx-auto w-full max-w-[320px] aspect-[9/19] bg-zinc-900 rounded-[2.5rem] p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transform lg:rotate-[2deg] hover:rotate-0 transition-transform duration-500">
                                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center">
                                        <div className="w-1/3 h-4 bg-black rounded-b-xl"></div>
                                    </div>
                                    <div className="w-full h-full bg-zinc-950 rounded-[2rem] overflow-hidden flex flex-col pt-6 relative border border-white/5">

                                        <div className="w-full h-14 bg-zinc-900 border-b border-white/5 px-4 flex items-center justify-between shadow-sm">
                                            <div className="w-24 h-5 bg-zinc-800 animate-pulse rounded"></div>
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-bold">+</div>
                                        </div>

                                        <div className="flex-1 p-4 bg-zinc-950 space-y-4">

                                            {/* Alerta de Conversão */}
                                            <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-center justify-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Orçamento Aprovado</span>
                                            </div>

                                            <div className="w-full p-4 bg-zinc-900 rounded-xl shadow-md border border-white/5 space-y-3 relative overflow-hidden">

                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="h-4 w-20 bg-zinc-700 rounded mb-2"></div>
                                                        <div className="h-3 w-32 bg-zinc-800 rounded"></div>
                                                    </div>
                                                    <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center">
                                                        <span className="text-[10px]">LOGO</span>
                                                    </div>
                                                </div>
                                                <div className="h-px w-full bg-white/5 my-2"></div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-zinc-400">Kit Embreagem LUK</span>
                                                        <span className="text-xs font-bold text-white">R$ 890,00</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs text-zinc-400">Mão de Obra</span>
                                                        <span className="text-xs font-bold text-white">R$ 450,00</span>
                                                    </div>
                                                </div>
                                                <div className="h-px w-full bg-white/5 my-2"></div>
                                                <div className="flex justify-between items-center bg-zinc-800/50 p-2 rounded-lg">
                                                    <span className="text-xs font-medium text-zinc-300">Total do Serviço</span>
                                                    <span className="text-sm font-black text-emerald-400">R$ 1.340,00</span>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white text-black rounded-full py-3 px-4 shadow-xl flex items-center justify-center gap-2 font-bold text-sm">
                                                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                                                Enviar PDF no WhatsApp
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Badges */}
                                <div className="absolute top-10 -right-6 lg:-right-12 bg-zinc-900 rounded-xl p-3 shadow-2xl border border-white/10 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-medium">Lucro este mês</p>
                                        <p className="text-sm font-bold text-white">R$ 14.500,00</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGOS / SOCIAL PROOF BAR */}
                <section className="border-y border-white/5 bg-zinc-900/50 py-10">
                    <div className="container">
                        <p className="text-center text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">
                            As melhores oficinas já usam a nossa tecnologia
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="text-xl font-black text-white italic">AUTO<span className="text-zinc-500">PREMIUM</span></div>
                            <div className="text-xl font-black text-white">CAR<span className="font-light">CLINIC</span></div>
                            <div className="text-xl font-black text-white tracing-widest">MOTOR<span className="text-zinc-500">+</span></div>
                            <div className="text-xl font-black text-white">GARAGE<span className="text-zinc-500 font-bold">PRO</span></div>
                        </div>
                    </div>
                </section>

                {/* DORES SECTION */}
                <section className="py-24 bg-zinc-950 relative">
                    <div className="container px-4 md:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Essa é a realidade da sua oficina hoje?
                            </h2>
                            <p className="text-lg text-zinc-400">
                                Seu cliente não reclama de gastar. Ele só reclama quando não entende o que você está cobrando. Um orçamento amador mata sua venda.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <span className="text-2xl">📝</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">O Caderninho Sumiu</h3>
                                <p className="text-zinc-400">Você anota as peças atrás de uma nota fiscal, o papel some na oficina, e quando você vai passar pro cliente, esquece de cobrar o aditivo.</p>
                            </div>
                            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <span className="text-2xl">🗣️</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">"Não rola um desconto?"</h3>
                                <p className="text-zinc-400">Quando você manda aquele bloco de texto cru no WhatsApp, o cliente acha caro porque não vê credibilidade, e pede desconto de tudo.</p>
                            </div>
                            <div className="bg-zinc-900/80 p-8 rounded-2xl border border-zinc-700 relative">
                                <div className="absolute top-0 right-0 p-3">
                                    <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">Desperdício</span>
                                </div>
                                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-6">
                                    <span className="text-2xl">⏱️</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Refazer o Cálculo Zero</h3>
                                <p className="text-zinc-400">Entrou o mesmo carro para trocar pastilha da semana passada, mas como você não salva os orçamentos, tem que ligar na autopeça de novo.</p>
                            </div>
                        </div>

                        {/* Mid-Page CTA */}
                        <div className="mt-16 text-center">
                            <Link
                                href="https://app.zacly.com.br/register"
                                className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-full text-base font-bold bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                            >
                                Iniciar meu Teste Grátis de 7 Dias
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS / SOCIAL PROOF */}
                <section className="py-24 bg-zinc-900 border-y border-white/5 relative">
                    <div className="container px-4 md:px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-white mb-4">
                                O que dizem os donos de oficina
                            </h2>
                            <p className="text-lg text-zinc-400">Quem testa, não volta pro papel.</p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Review 1 */}
                            <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-lg">
                                <div className="flex text-emerald-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <Quote className="w-8 h-8 text-zinc-800 mb-4" />
                                <p className="text-zinc-300 mb-6 italic">"A aprovação dos orçamentos triplicou. O pessoal olha o PDF com a nossa logo no Zap e paga sem chorar. Deu um puta ar profissional pra oficina mecânica."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800" style={{ backgroundImage: `url('https://i.pravatar.cc/100?img=11')`, backgroundSize: 'cover' }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Roberto Almeida</p>
                                        <p className="text-xs text-zinc-500">Auto Center Almeida</p>
                                    </div>
                                </div>
                            </div>
                            {/* Review 2 */}
                            <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-lg hidden md:block">
                                <div className="flex text-emerald-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <Quote className="w-8 h-8 text-zinc-800 mb-4" />
                                <p className="text-zinc-300 mb-6 italic">"A rapidez pra montar orçamento é absurda. Já salvei o preço da revisão e agora puxo no botão. Parei de perder R$ 50 no final porque esqueci de anotar peça."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800" style={{ backgroundImage: `url('https://i.pravatar.cc/100?img=15')`, backgroundSize: 'cover' }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Marcos Silva</p>
                                        <p className="text-xs text-zinc-500">Mecânica do Marcola</p>
                                    </div>
                                </div>
                            </div>
                            {/* Review 3 */}
                            <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-lg hidden lg:block">
                                <div className="flex text-emerald-500 mb-4">
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                                <Quote className="w-8 h-8 text-zinc-800 mb-4" />
                                <p className="text-zinc-300 mb-6 italic">"A cara do cliente quando diz 'mestre, mandou até em PDF' vale o app inteiro. Passa muita confiança. É como se a gente virasse concessionária do dia pra noite."</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800" style={{ backgroundImage: `url('https://i.pravatar.cc/100?img=12')`, backgroundSize: 'cover' }}></div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Julio Cesar</p>
                                        <p className="text-xs text-zinc-500">JC Motors Imports</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* BENEFÍCIOS SECTION - A SOLUÇÃO NA GRAXA */}
                <section className="py-24 bg-zinc-950 border-t border-white/5 relative overflow-hidden">
                    <div className="container px-4 md:px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">

                            <div className="space-y-12">
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                        Venda como uma <span className="text-emerald-400">concessionária</span> usando só o seu celular.
                                    </h2>
                                    <p className="text-lg text-zinc-400">
                                        Surpreenda o dono do carro com um orçamento que chora profissionalismo e justifique naturalmente o preço do seu serviço.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Comprovante Contra o 'Choro'</h4>
                                            <p className="text-zinc-400">Plaquinha de carro, quebra total mecânica vs. mão de obra. O cliente não quer pechinchar com algo que parece oficial e blindado.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                                            <Clock className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-white mb-2">Montagem Expressa no Aparelho</h4>
                                            <p className="text-zinc-400">Monte orçamentos em apenas cliques salvando seus serviços fixos. Terminou a avaliação, o orçamento já cai no whats dele.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Imagem Demonstrativa Maior */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500/20 rounded-[2rem] transform rotate-3 scale-105 opacity-20 blur-xl"></div>
                                <div className="bg-zinc-900 border border-white/5 rounded-[2rem] shadow-2xl p-6 relative z-10">
                                    <div className="w-full aspect-[4/3] bg-zinc-950 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-white/5">
                                        <div className="text-center p-6 bg-zinc-900 w-[80%] rounded-xl shadow-xl border border-emerald-500/20 transform -rotate-2">
                                            <div className="flex justify-between items-center mb-6">
                                                <div className="w-16 h-8 bg-zinc-800 rounded"></div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-zinc-400">Orçamento <span className="text-white font-bold">#1042</span></p>
                                                    <p className="text-[10px] text-emerald-400 font-bold">Aprovado pelo cliente</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 mb-6">
                                                <div className="flex justify-between border-b border-white/5 pb-2">
                                                    <span className="text-xs font-medium text-zinc-400">Bateria Heliar 60Ah</span>
                                                    <span className="text-xs font-bold text-white">R$ 510,00</span>
                                                </div>
                                                <div className="flex justify-between border-b border-white/5 pb-2">
                                                    <span className="text-xs font-medium text-zinc-400">Substituição + Checagem</span>
                                                    <span className="text-xs font-bold text-white">R$ 100,00</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center bg-zinc-950 p-3 rounded-lg border border-emerald-500/10">
                                                <span className="font-bold text-emerald-500 uppercase text-[10px] tracking-widest">Total Liberado</span>
                                                <span className="text-xl font-black text-white">R$ 610,00</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 flex-1 bg-white hover:bg-zinc-200 text-black rounded-xl flex items-center justify-center font-bold gap-2 cursor-pointer transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                            Orçamento Aprovado em 20s
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* CTA FINAL */}
                <section className="py-24 bg-zinc-950 relative overflow-hidden border-t border-white/5">
                    {/* Subtle Glow CTA */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="container relative z-10 px-4 text-center">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
                            Sua oficina rende o dobro<br /> quando você cobra do jeito certo.
                        </h2>
                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
                            Gere o seu primeiro PDF de teste gratuitamente agora. Sem cartão de crédito cadastrado.
                        </p>

                        <div className="flex flex-col flex-wrap sm:flex-row justify-center gap-4 items-center">
                            <Link
                                href="https://app.zacly.com.br/register"
                                className="w-full sm:w-auto flex items-center justify-center h-16 px-12 rounded-full text-lg font-bold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all hover:-translate-y-1 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                            >
                                Iniciar Teste Grátis na Minha Oficina
                            </Link>
                            <div className="text-zinc-500 text-sm flex flex-col items-start gap-1 mt-2 sm:mt-0">
                                <span className="flex items-center gap-2">✓ Sem precisar de cartão</span>
                                <span className="flex items-center gap-2">✓ Configuração rápida</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <MarketingFooter />
        </div>
    );
}
