# Templates de e-mail do Supabase

Use estes HTMLs no painel do Supabase em **Authentication > Emails**:

- `confirmacao-conta.html`: template **Confirm signup**.
- `recuperacao-senha.html`: template **Reset password**.

Os dois templates usam `{{ .ConfirmationURL }}` de proposito. Esse link e gerado pelo Supabase a partir do `redirectTo` enviado pelo app, entao ele preserva o destino correto:

- confirmacao de conta volta para o callback do app;
- recuperacao de senha volta para `/update-password`.

Evite montar links manuais com `{{ .TokenHash }}` nestes templates, porque isso pode perder o destino configurado pelo app e mandar o usuario para a tela errada.
