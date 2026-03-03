import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Termos de Uso | Zacly',
    description: 'Leia os Termos de Uso da plataforma Zacly antes de criar sua conta.',
    robots: { index: false },
}

export default function TermsOfUsePage() {
    const updated = '28 de fevereiro de 2025'

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-200 px-4 py-16">
            <div className="max-w-3xl mx-auto">
                {/* Back */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-10 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Voltar
                </Link>

                {/* Header */}
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-7 w-7 text-emerald-500 shrink-0" />
                    <h1 className="text-3xl font-extrabold text-white">Termos de Uso</h1>
                </div>
                <p className="text-sm text-zinc-500 mb-10">Última atualização: {updated}</p>

                <div className="space-y-10">

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">1. Aceitação dos Termos</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma <strong className="text-white">Zacly</strong>, você declara que leu, compreendeu e concorda com estes Termos de Uso e com nossa <Link href="/politica-de-privacidade" className="text-emerald-400 hover:underline">Política de Privacidade</Link>. Se não concordar com alguma disposição, não utilize o serviço.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">2. Descrição do Serviço</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            A Zacly é uma plataforma SaaS (Software como Serviço) para criação, gestão e envio de orçamentos profissionais em formato digital. A plataforma é disponibilizada como software hospedado, sem necessidade de instalação, acessível via navegador web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">3. Cadastro e Conta</h2>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                            <li>Você deve ter pelo menos <strong className="text-zinc-200">18 anos</strong> ou capacidade civil plena para criar uma conta.</li>
                            <li>É responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas com sua conta.</li>
                            <li>É proibido criar contas em nome de terceiros sem autorização expressa.</li>
                            <li>Contas com suspeita de fraude, abuso ou violação destes termos podem ser suspensas imediatamente.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">4. Planos e Pagamentos</h2>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                            <li><strong className="text-zinc-200">Plano Gratuito:</strong> limitado a 5 orçamentos por mês, com marca d&apos;água Zacly nos documentos. Disponível por tempo indeterminado, podendo ter limitações alteradas mediante aviso prévio de 30 dias.</li>
                            <li><strong className="text-zinc-200">Plano Pro Mensal:</strong> assinatura recorrente com cobrança automática a cada 30 dias. O valor é debitado automaticamente no cartão cadastrado até que o usuário efetue o cancelamento. O cancelamento pode ser realizado a qualquer momento pela página de configurações e terá efeito ao final do período já pago.</li>
                            <li><strong className="text-zinc-200">Plano Pro Anual:</strong> pagamento único à vista, com cobrança recorrente anual automática até o cancelamento. O cancelamento pode ser feito a qualquer momento e terá efeito ao final do período já pago.</li>
                            <li>Todos os pagamentos são processados de forma segura pelo <strong className="text-zinc-200">Stripe</strong>, sujeito à sua política de uso aceitável.</li>
                            <li>Preços expressos em Reais (BRL) e podem ser alterados mediante aviso prévio de <strong className="text-zinc-200">30 dias</strong>.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">5. Reembolsos</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Nos termos do <strong className="text-zinc-200">Art. 49 do Código de Defesa do Consumidor</strong>, você pode solicitar reembolso integral em até 7 dias corridos após a compra de qualquer plano pago, sem necessidade de justificativa. Após esse prazo, reembolsos são concedidos apenas a critério da Zacly em casos de falha comprovada do serviço.
                            Requeira seu reembolso pelo e-mail: <a href="mailto:suporte@zacly.com.br" className="text-emerald-400 hover:underline">suporte@zacly.com.br</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">6. Uso Aceitável</h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">É vedado ao usuário:</p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                            <li>Utilizar a plataforma para fins ilegais, fraudulentos ou que violem direitos de terceiros;</li>
                            <li>Realizar engenharia reversa, descompilar ou modificar qualquer parte do software;</li>
                            <li>Revender ou sublicenciar o acesso à plataforma;</li>
                            <li>Inserir conteúdo que contenha malware, vírus ou scripts maliciosos;</li>
                            <li>Realizar acessos automatizados (bots, scrapers) sem autorização prévia por escrito.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">7. Propriedade Intelectual</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Todo o software, interface, design e marca Zacly são de propriedade exclusiva da Zacly Plataforma, protegidos pela legislação de propriedade intelectual brasileira e internacional. O usuário recebe uma licença de uso pessoal, não exclusiva e intransferível durante a vigência da conta ativa.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-2">
                            Os dados inseridos pelo usuário (clientes, orçamentos, produtos) permanecem de propriedade do usuário. A Zacly não reivindica direitos sobre esses dados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">8. Disponibilidade e SLA</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            A Zacly envidar esforços razoáveis para manter a disponibilidade da plataforma, mas não garante disponibilidade ininterrupta (uptime de 100%). Manutenções programadas serão comunicadas com antecedência mínima de 24 horas sempre que possível. A Zacly não se responsabiliza por perdas decorrentes de indisponibilidade temporária do serviço.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">9. Limitação de Responsabilidade</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Na máxima extensão permitida pela legislação aplicável, a Zacly não se responsabiliza por danos indiretos, incidentais, lucros cessantes ou perda de dados resultantes do uso ou impossibilidade de uso da plataforma. A responsabilidade total da Zacly ficará limitada ao valor pago pelo usuário nos últimos 3 meses.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">10. Encerramento da Conta</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Você pode encerrar sua conta a qualquer momento via configurações ou por solicitação a <a href="mailto:suporte@zacly.com.br" className="text-emerald-400 hover:underline">suporte@zacly.com.br</a>. A Zacly se reserva o direito de encerrar contas que violem estes Termos, com ou sem aviso prévio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">11. Alterações nos Termos</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Podemos atualizar estes Termos periodicamente. Alterações substanciais serão comunicadas por e-mail com <strong className="text-zinc-200">15 dias de antecedência</strong>. O uso continuado da plataforma após a vigência das novas condições implica aceitação tácita.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">12. Lei Aplicável e Foro</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Estes Termos são regidos pelas leis da República Federativa do Brasil. Eventuais disputas serão submetidas ao foro da Comarca de <strong className="text-zinc-200">São Paulo/SP</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja, salvo disposição legal em contrário.
                        </p>
                    </section>

                </div>

                <div className="mt-14 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <Link href="/politica-de-privacidade" className="text-sm text-emerald-400 hover:underline">
                        Ver Política de Privacidade →
                    </Link>
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
                        ← Voltar ao site
                    </Link>
                </div>
            </div>
        </main>
    )
}
