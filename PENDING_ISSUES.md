# Issues Pendentes - Melhorias do Sistema

Este arquivo documenta as melhorias do Arkham Companion.

## ✅ Melhorias Implementadas (2026-01-12)

## ✅ Issue #1: Adicionar confirmação antes do logoff

**Descrição:**
O botão vermelho no canto direito superior está dando logoff direto. Adicionar um diálogo de confirmação perguntando se o usuário realmente quer fazer logoff antes de executar a ação.

**Prioridade:** Média

**Status:** ✅ Implementado
**Solução:** Adicionado `window.confirm()` antes do logout no botão. O usuário agora precisa confirmar antes de sair.

---

## ✅ Issue #2: Reabilitar botões se janela de login do Google for fechada

**Descrição:**
Quando o usuário clica para entrar via Google, abre a janela do Google e desativa a maioria dos botões da tela de login. Se por algum caso a janela do Google for fechada sem a solução de login, os botões continuam desabilitados e o usuário não tem para onde ir. Necessário detectar quando a janela é fechada e reabilitar os botões.

**Prioridade:** Alta (afeta UX crítico)

**Status:** ✅ Implementado
**Solução:** Adicionado tratamento específico para os códigos de erro `auth/popup-closed-by-user` e `auth/cancelled-popup-request`. Quando o popup é fechado, os botões são reabilitados sem mostrar mensagem de erro.

---

## ✅ Issue #3: Adicionar botão para editar o nome da campanha

**Descrição:**
Falta um botão para permitir que o usuário edite o nome da campanha após criá-la.

**Prioridade:** Média

**Status:** ✅ Implementado
**Solução:** Implementado edição inline do nome da campanha. Agora o nome é clicável e ao clicar, vira um input editável. Suporta Enter para salvar e Escape para cancelar.

---

## ✅ Issue #4: Devolver ficha automaticamente após sorteio

**Descrição:**
Sempre que uma ficha é sorteada, existe a opção de devolver a ficha, que é desnecessária já que uma ficha sempre deve ser devolvida. Mudar o padrão para devolver automaticamente a ficha após o sorteio.

**Prioridade:** Baixa (melhoria de UX)

**Status:** ✅ Implementado
**Solução:** Modificado o comportamento do sorteio para devolver automaticamente todas as fichas sorteadas antes de sortear uma nova. O botão "Devolver" continua disponível para devolução manual se necessário.

---

**Data de criação:** 2026-01-12
**Data de conclusão:** 2026-01-12
