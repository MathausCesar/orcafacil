import * as React from 'react'

type ZaclyEmailTemplateProps = {
    preheader?: string
    eyebrow?: string
    title: string
    greeting?: string
    message: string
    ctaLabel?: string
    ctaUrl?: string
    footer?: string
}

export function ZaclyEmailTemplate({
    preheader,
    eyebrow = 'ZACLY',
    title,
    greeting,
    message,
    ctaLabel,
    ctaUrl,
    footer = 'Propostas profissionais, sem complicar sua rotina.',
}: ZaclyEmailTemplateProps) {
    return (
        <div style={{ backgroundColor: '#f4f7f6', color: '#13201d', fontFamily: 'Arial, Helvetica, sans-serif', margin: 0, padding: '32px 16px' }}>
            {preheader ? (
                <div style={{ color: '#f4f7f6', display: 'none', fontSize: '1px', lineHeight: '1px', maxHeight: 0, maxWidth: 0, opacity: 0, overflow: 'hidden' }}>
                    {preheader}
                </div>
            ) : null}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #dbe5e1', borderRadius: '12px', margin: '0 auto', maxWidth: '600px', overflow: 'hidden' }}>
                <div style={{ backgroundColor: '#0b2720', padding: '24px 32px' }}>
                    <div style={{ color: '#56e0ad', fontSize: '12px', fontWeight: 700, letterSpacing: '1.8px' }}>{eyebrow}</div>
                    <div style={{ color: '#ffffff', fontSize: '20px', fontWeight: 700, marginTop: '8px' }}>Sua rotina profissional, mais simples.</div>
                </div>
                <div style={{ padding: '32px' }}>
                    <h1 style={{ color: '#13201d', fontSize: '26px', lineHeight: '1.25', margin: '0 0 16px' }}>{title}</h1>
                    {greeting ? <p style={{ fontSize: '16px', lineHeight: '1.65', margin: '0 0 12px' }}>{greeting}</p> : null}
                    <p style={{ fontSize: '16px', lineHeight: '1.65', margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
                    {ctaLabel && ctaUrl ? (
                        <a href={ctaUrl} style={{ backgroundColor: '#119d6b', borderRadius: '7px', color: '#ffffff', display: 'inline-block', fontSize: '16px', fontWeight: 700, marginTop: '28px', padding: '13px 20px', textDecoration: 'none' }}>
                            {ctaLabel}
                        </a>
                    ) : null}
                </div>
                <div style={{ borderTop: '1px solid #e4ece9', color: '#62736d', fontSize: '12px', lineHeight: '1.55', padding: '20px 32px' }}>
                    <div>{footer}</div>
                    <div style={{ marginTop: '5px' }}>Zacly - gestao pratica para quem faz acontecer.</div>
                </div>
            </div>
        </div>
    )
}
