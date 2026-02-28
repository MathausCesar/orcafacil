import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Política de Privacidade | Zacly',
    description: 'Saiba como a Zacly coleta, usa e protege seus dados pessoais, em conformidade com a LGPD.',
    robots: { index: false },
}

export default function PrivacyPolicyPage() {
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
                    <Shield className="h-7 w-7 text-emerald-500 shrink-0" />
                    <h1 className="text-3xl font-extrabold text-white">Política de Privacidade</h1>
                </div>
                <p className="text-sm text-zinc-500 mb-10">Última atualização: {updated}</p>

                <div className="space-y-10 prose prose-invert prose-zinc max-w-none">

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">1. Identificação do Controlador</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            A <strong className="text-white">Zacly Plataforma</strong> (&quot;Controlador&quot;), responsável pelo tratamento dos dados pessoais coletados por meio da plataforma disponível em <strong className="text-white">zacly.com.br</strong> e <strong className="text-white">app.zacly.com.br</strong>, comprometendo-se com a transparência e a proteção dos dados de seus usuários, em conformidade com a <strong className="text-white">Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
                        </p>
                        <p className="text-zinc-400 leading-relaxed mt-2">
                            Para contato com o Encarregado de Proteção de Dados (DPO):{' '}
                            <a href="mailto:privacidade@zacly.com.br" className="text-emerald-400 hover:underline">
                                privacidade@zacly.com.br
                            </a>
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">2. Dados Pessoais Coletados</h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">Coletamos apenas os dados estritamente necessários para a prestação dos serviços:</p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                            <li><strong className="text-zinc-200">Dados de cadastro:</strong> nome, endereço de e-mail e senha (armazenada em hash irreversível).</li>
                            <li><strong className="text-zinc-200">Dados do negócio:</strong> nome da empresa, CNPJ ou CPF (opcional), endereço e telefone informados voluntariamente pelo usuário.</li>
                            <li><strong className="text-zinc-200">Dados de uso:</strong> registros de acesso (IP, data/hora, dispositivo), logs de operações realizadas na plataforma.</li>
                            <li><strong className="text-zinc-200">Dados de pagamento:</strong> transações de assinatura são processadas integralmente pelo <strong className="text-zinc-200">Stripe Inc.</strong>, que atua como operador independente. A Zacly não armazena dados de cartão de crédito.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">3. Finalidades e Base Legal</h2>
                        <div className="overflow-x-auto">
                            <table className="text-sm text-zinc-400 w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-800 text-zinc-300">
                                        <th className="text-left py-2 pr-4 font-semibold">Finalidade</th>
                                        <th className="text-left py-2 font-semibold">Base Legal (LGPD)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50">
                                    <tr><td className="py-2 pr-4">Criação e manutenção de conta</td><td className="py-2">Art. 7º, V — execução de contrato</td></tr>
                                    <tr><td className="py-2 pr-4">Prestação dos serviços da plataforma</td><td className="py-2">Art. 7º, V — execução de contrato</td></tr>
                                    <tr><td className="py-2 pr-4">Processamento de pagamentos</td><td className="py-2">Art. 7º, V — execução de contrato</td></tr>
                                    <tr><td className="py-2 pr-4">Segurança e prevenção a fraudes</td><td className="py-2">Art. 7º, IX — legítimo interesse</td></tr>
                                    <tr><td className="py-2 pr-4">Comunicações sobre o serviço</td><td className="py-2">Art. 7º, I — consentimento</td></tr>
                                    <tr><td className="py-2 pr-4">Cumprimento de obrigações legais</td><td className="py-2">Art. 7º, II — obrigação legal</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">4. Compartilhamento de Dados</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            A Zacly não vende dados pessoais a terceiros. O compartilhamento ocorre apenas com operadores contratados para viabilizar o serviço, sujeitos a obrigações contratuais de confidencialidade:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400 mt-3">
                            <li><strong className="text-zinc-200">Supabase Inc.</strong> — infraestrutura de banco de dados e autenticação (servidores nos EUA, cobertos por cláusulas contratuais padrão).</li>
                            <li><strong className="text-zinc-200">Stripe Inc.</strong> — processamento de pagamentos (dados financeiros tratados sob a política de privacidade da Stripe).</li>
                            <li><strong className="text-zinc-200">Vercel Inc.</strong> — hospedagem da aplicação web.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">5. Armazenamento e Retenção</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Os dados são armazenados pelo período necessário para a prestação do serviço. Após o encerramento da conta, os dados serão eliminados em até <strong className="text-zinc-200">90 dias</strong>, salvo quando a manutenção for exigida por obrigação legal (ex.: dados fiscais: 5 anos, conforme legislação tributária) ou para exercício de direitos em processo judicial ou administrativo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">6. Direitos dos Titulares</h2>
                        <p className="text-zinc-400 leading-relaxed mb-3">Nos termos do Art. 18 da LGPD, você tem o direito de:</p>
                        <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                            <li>Confirmar a existência de tratamento e acessar seus dados;</li>
                            <li>Solicitar correção de dados incompletos, inexatos ou desatualizados;</li>
                            <li>Solicitar anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                            <li>Solicitar a portabilidade dos dados a outro fornecedor;</li>
                            <li>Revogar o consentimento a qualquer momento;</li>
                            <li>Solicitar a eliminação dos dados tratados com base no consentimento.</li>
                        </ul>
                        <p className="text-zinc-400 leading-relaxed mt-3">
                            Para exercer seus direitos, entre em contato: <a href="mailto:privacidade@zacly.com.br" className="text-emerald-400 hover:underline">privacidade@zacly.com.br</a>. Responderemos em até <strong className="text-zinc-200">15 dias úteis</strong>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">7. Segurança dos Dados</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Adotamos medidas técnicas e organizacionais adequadas, incluindo criptografia em trânsito (TLS/HTTPS), senhas armazenadas em hash, controle de acesso baseado em funções (RLS) e autenticação por e-mail com confirmação de link.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">8. Cookies</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Utilizamos cookies estritamente necessários para autenticação e sessão do usuário. Não utilizamos cookies de rastreamento ou publicidade comportamental.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">9. Alterações nesta Política</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Esta política pode ser atualizada periodicamente. Em caso de alterações relevantes, notificaremos os usuários por e-mail com antecedência mínima de 15 dias. A data da última atualização consta sempre no topo deste documento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-lg font-bold text-white mb-3">10. Contato e Canal de Denúncias</h2>
                        <p className="text-zinc-400 leading-relaxed">
                            Você também pode recorrer à <strong className="text-zinc-200">ANPD (Autoridade Nacional de Proteção de Dados)</strong> em{' '}
                            <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                                www.gov.br/anpd
                            </a>.
                        </p>
                    </section>

                </div>

                <div className="mt-14 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                    <Link href="/termos-de-uso" className="text-sm text-emerald-400 hover:underline">
                        Ver Termos de Uso →
                    </Link>
                    <Link href="/" className="text-sm text-zinc-500 hover:text-white transition-colors">
                        ← Voltar ao site
                    </Link>
                </div>
            </div>
        </main>
    )
}
