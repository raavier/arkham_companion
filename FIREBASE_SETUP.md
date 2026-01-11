# 🔥 Guia de Configuração do Firebase

Este guia vai te ajudar a configurar o Firebase para o Arkham Companion em **5 minutos**.

## 📋 O que você vai precisar

- Uma conta Google (Gmail)
- 5 minutos do seu tempo

## 🚀 Passo a Passo

### 1️⃣ Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** (ou "Add project")
3. Escolha um nome (ex: "arkham-companion")
4. **Desabilite** o Google Analytics (não é necessário)
5. Clique em **"Criar projeto"**

### 2️⃣ Registrar o App Web

1. No painel do projeto, clique no ícone **"Web"** (`</>`)
2. Dê um apelido pro app (ex: "Arkham Companion Web")
3. **NÃO** marque "Firebase Hosting"
4. Clique em **"Registrar app"**
5. **COPIE** as configurações que aparecem (você vai precisar delas!)

   Vai parecer com isso:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "seu-projeto.firebaseapp.com",
     projectId: "seu-projeto",
     storageBucket: "seu-projeto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

### 3️⃣ Ativar Autenticação

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Get started"** (Começar)
3. Na aba **"Sign-in method"**, ative:
   - ✅ **Email/Password** (clique, ative, salve)
   - ✅ **Google** (clique, ative, escolha um email de suporte, salve)

### 4️⃣ Criar Banco de Dados Firestore

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Create database"**
3. Escolha **"Start in production mode"** (vamos configurar as regras depois)
4. Escolha a localização mais próxima (ex: `southamerica-east1` para Brasil)
5. Clique em **"Enable"**

### 5️⃣ Configurar Regras de Segurança

1. Ainda no Firestore Database, clique na aba **"Rules"**
2. **Substitua** o conteúdo por:

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can only read/write their own data
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. Clique em **"Publish"** (Publicar)

### 6️⃣ Configurar o Projeto

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e cole as informações do passo 2:
   ```
   REACT_APP_FIREBASE_API_KEY=AIzaSy...
   REACT_APP_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=seu-projeto
   REACT_APP_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
   REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. Salve o arquivo

### 7️⃣ Iniciar o Projeto

```bash
npm start
```

Pronto! 🎉 Agora você pode criar uma conta e seus dados serão salvos com segurança no Firebase!

---

## ✨ O que mudou?

### Antes (localStorage)
- ❌ Dados só no navegador
- ❌ Limpar cache = perder tudo
- ❌ Não pode acessar em outro dispositivo

### Agora (Firebase)
- ✅ Dados na nuvem (seguros)
- ✅ Acesse de qualquer dispositivo
- ✅ Sincronização automática
- ✅ Login com Google ou email

---

## 🔐 Segurança

As regras do Firestore garantem que:
- Cada usuário só vê **suas próprias campanhas**
- Ninguém pode acessar dados de outros usuários
- Precisa estar logado para ler/escrever

---

## 🆘 Problemas Comuns

### "Firebase: Error (auth/configuration-not-found)"
- Você esqueceu de configurar o arquivo `.env`
- Confira se copiou todas as variáveis corretamente

### "Missing or insufficient permissions"
- As regras do Firestore não foram configuradas
- Volte no passo 5 e configure as regras

### "Firebase: Error (auth/unauthorized-domain)"
- Você está rodando em `localhost` diferente do configurado
- No Firebase Console > Authentication > Settings > Authorized domains
- Adicione `localhost`

---

## 📊 Plano Gratuito

O Firebase oferece um plano gratuito generoso:
- ✅ 50.000 usuários ativos/mês
- ✅ 50.000 leituras/dia
- ✅ 20.000 escritas/dia
- ✅ 1 GB de armazenamento

Para esse app, isso é mais que suficiente! 🎮

---

## 🎓 Próximos Passos

Quer aprender mais sobre Firebase?
- [Documentação oficial](https://firebase.google.com/docs)
- [Firebase + React Tutorial](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
