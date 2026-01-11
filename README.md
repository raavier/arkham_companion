# 🎴 Arkham Horror - Chaos Bag

Um simulador digital da **Bolsa do Caos** para **Arkham Horror: The Card Game**, com gerenciamento completo de campanhas, investigadores e estatísticas.

![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-3178C6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.3-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Funcionalidades

### 🎲 Bolsa do Caos
- **19 tipos de fichas** incluindo numéricas (+1 a -8) e especiais (Caveira, Cultista, Tábua, Elder Thing, Elder Sign, Tentáculo, Bênção, Maldição, Gelo)
- **Presets de dificuldade** (Fácil, Normal, Difícil, Expert)
- **Sorteio animado** com efeitos sonoros
- **Histórico de fichas sorteadas** com opção de devolver à bolsa
- **Tooltips** ao passar o mouse nas fichas

### 📚 Gerenciamento de Campanhas
- **11 campanhas oficiais** pré-configuradas:
  - A Noite do Fanático
  - O Legado de Dunwich
  - O Caminho para Carcosa
  - A Era Esquecida
  - O Círculo Desfeito
  - Os Devoradores de Sonhos
  - A Conspiração de Innsmouth
  - No Limite da Terra
  - As Chaves Escarlates
  - O Banquete de Cicuta Vale
  - Cenário Avulso
- **Salvamento automático** no localStorage
- **Múltiplas campanhas** simultâneas

### 📜 Cenários
- Lista completa de cenários por campanha
- Marcar cenários como completos
- Campo de resolução para cada cenário
- Controle de XP ganho com total automático

### 🔍 Investigadores
- Adicionar múltiplos investigadores
- Tracking de **Vida** e **Sanidade** atual
- Controle de **XP** individual
- **Trauma físico e mental**
- Status de **eliminação**
- Cores por classe (Guardião, Buscador, Místico, Sobrevivente, Trapaceiro, Neutro)

### 📊 Estatísticas
- Total de sorteios na campanha
- Distribuição percentual por ficha
- Gráfico de barras visual
- Histórico dos últimos 20 sorteios

### 📝 Notas
- Campo livre para anotações da campanha
- Lista de modificações na bolsa do caos
- Informações da campanha (data de criação, última atualização)

### 🔊 Áudio
- Som ao sortear ficha
- Som especial positivo (Elder Sign, Bênção, +1)
- Som especial negativo (Tentáculo, Maldição)
- Toggle para ligar/desligar sons

## 🚀 Instalação

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/arkham-chaos-bag.git
cd arkham-chaos-bag
```

2. **Instale as dependências**
```bash
npm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm start
```

4. **Acesse no navegador**
```
http://localhost:3000
```

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `build/`.

## 🛠️ Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Web Audio API** - Efeitos sonoros
- **localStorage** - Persistência de dados

## 📱 Responsividade

O app é totalmente responsivo e funciona bem em:
- 💻 Desktop
- 📱 Tablets
- 📱 Smartphones

## 🎮 Como Usar

1. **Criar uma campanha**: Clique em "📚 Campanhas" → "+ Nova Campanha"
2. **Selecionar dificuldade**: Use os botões de dificuldade ou personalize as fichas
3. **Sortear fichas**: Clique na bolsa ou no botão "SORTEAR"
4. **Gerenciar cenários**: Use a aba "📜 Cenários" para marcar progresso
5. **Adicionar investigadores**: Use a aba "🔍 Invest." para gerenciar o grupo
6. **Anotar informações**: Use a aba "📝 Notas" para registrar decisões

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## ⚠️ Aviso Legal

Este é um projeto de fã não oficial. **Arkham Horror: The Card Game** é propriedade da Fantasy Flight Games. Este aplicativo é gratuito e não possui fins comerciais.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Enviar pull requests

## 📞 Contato

Se tiver dúvidas ou sugestões, abra uma [issue](https://github.com/seu-usuario/arkham-chaos-bag/issues) no repositório.

---

Feito com ❤️ para a comunidade de Arkham Horror LCG
