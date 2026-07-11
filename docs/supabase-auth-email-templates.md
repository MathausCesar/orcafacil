# Templates de autenticacao do Zacly

Os e-mails de confirmacao de conta e redefinicao de senha sao enviados pelo Supabase Auth. Configure-os em `Authentication > Email Templates` e mantenha `{{ .ConfirmationURL }}` no botao para preservar o token seguro e o redirecionamento do aplicativo.

Configuracao obrigatoria:

- Site URL: `https://app.zacly.com.br`
- Redirect URL: `https://app.zacly.com.br/auth/callback`

## Confirmacao de cadastro

Assunto:

```text
Confirme seu e-mail e crie sua primeira proposta | Zacly
```

```html
<div style="background:#f4f7f6;color:#13201d;font-family:Arial,Helvetica,sans-serif;margin:0;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #dbe5e1;border-radius:12px;margin:0 auto;max-width:600px;overflow:hidden">
    <div style="background:#0b2720;padding:24px 32px">
      <div style="color:#56e0ad;font-size:12px;font-weight:700;letter-spacing:1.8px">ZACLY</div>
      <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:8px">Sua rotina profissional, mais simples.</div>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px">Confirme seu e-mail</h1>
      <p style="font-size:16px;line-height:1.65;margin:0">Seu acesso esta quase pronto. Confirme seu e-mail para criar uma proposta profissional e enviar pelo WhatsApp.</p>
      <a href="{{ .ConfirmationURL }}" style="background:#119d6b;border-radius:7px;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;margin-top:28px;padding:13px 20px;text-decoration:none">Confirmar meu e-mail</a>
    </div>
    <div style="border-top:1px solid #e4ece9;color:#62736d;font-size:12px;line-height:1.55;padding:20px 32px">Se voce nao criou uma conta no Zacly, pode ignorar esta mensagem.</div>
  </div>
</div>
```

## Redefinicao de senha

Assunto:

```text
Redefina sua senha com seguranca | Zacly
```

```html
<div style="background:#f4f7f6;color:#13201d;font-family:Arial,Helvetica,sans-serif;margin:0;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #dbe5e1;border-radius:12px;margin:0 auto;max-width:600px;overflow:hidden">
    <div style="background:#0b2720;padding:24px 32px">
      <div style="color:#56e0ad;font-size:12px;font-weight:700;letter-spacing:1.8px">ZACLY</div>
      <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:8px">Sua rotina profissional, mais simples.</div>
    </div>
    <div style="padding:32px">
      <h1 style="font-size:26px;line-height:1.25;margin:0 0 16px">Crie uma nova senha</h1>
      <p style="font-size:16px;line-height:1.65;margin:0">Recebemos um pedido para criar uma nova senha. O link e seguro e expira em breve. Se nao foi voce, ignore este e-mail.</p>
      <a href="{{ .ConfirmationURL }}" style="background:#119d6b;border-radius:7px;color:#ffffff;display:inline-block;font-size:16px;font-weight:700;margin-top:28px;padding:13px 20px;text-decoration:none">Criar nova senha</a>
    </div>
    <div style="border-top:1px solid #e4ece9;color:#62736d;font-size:12px;line-height:1.55;padding:20px 32px">Por seguranca, nunca compartilhe este link com outra pessoa.</div>
  </div>
</div>
```
