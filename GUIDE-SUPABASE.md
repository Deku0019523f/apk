# 📘 Guide Complet de Configuration Supabase
## Site: Deku booster
---

## 📋 Table des matières

1. [Créer un projet Supabase](#1-créer-un-projet-supabase)
2. [Configurer la base de données](#2-configurer-la-base-de-données)
3. [Récupérer les clés API](#3-récupérer-les-clés-api)
4. [Configurer l'authentification](#4-configurer-lauthentification)
5. [Configurer les Edge Functions](#5-configurer-les-edge-functions)
6. [Configurer les secrets](#6-configurer-les-secrets)
7. [Créer le compte administrateur](#7-créer-le-compte-administrateur)
8. [Vérifications finales](#8-vérifications-finales)
9. [Dépannage](#9-dépannage)

---

## 1. Créer un projet Supabase

1. Rendez-vous sur **[supabase.com](https://supabase.com)** et connectez-vous (ou créez un compte gratuit)
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name** : `Deku booster`
   - **Database Password** : Choisissez un mot de passe fort (⚠️ notez-le !)
   - **Region** : Choisissez la région la plus proche de vos utilisateurs (ex: `West EU - Ireland` pour l'Afrique de l'Ouest)
4. Cliquez sur **"Create new project"**
5. Attendez 1-2 minutes que le projet soit prêt ✅

> 💡 **Astuce** : Le plan gratuit de Supabase est suffisant pour démarrer (jusqu'à 500 Mo de base de données et 50 000 requêtes/mois)

---

## 2. Configurer la base de données

1. Dans le menu gauche, cliquez sur **"SQL Editor"** (icône avec `>`)
2. Cliquez sur **"New Query"**
3. Copiez-collez **TOUT** le contenu du fichier `database/setup.sql`
4. Cliquez sur **"Run"** (ou `Ctrl+Enter`)
5. Vérifiez que le message affiche : **"Success. No rows returned"**

### Vérification :
- Allez dans **"Table Editor"** (menu gauche)
- Vous devriez voir les tables suivantes :
  ✅ `profiles`
  ✅ `wallets`
  ✅ `user_roles`
  ✅ `orders`
  ✅ `transactions`
  ✅ `deposit_requests`
  ✅ `api_keys`
  ✅ `api_usage_logs`
  ✅ `price_overrides`
  ✅ `disabled_categories`

> ⚠️ **Si vous avez une erreur** : Le script est conçu pour être exécuté sur un projet vide. Si les tables existent déjà, supprimez-les d'abord ou créez un nouveau projet.

---

## 3. Récupérer les clés API

1. Allez dans **Settings** (icône engrenage en bas du menu gauche)
2. Cliquez sur **"API"** dans le sous-menu
3. Vous trouverez deux informations essentielles :

| Clé | Où la trouver | Usage |
|-----|--------------|-------|
| **Project URL** | Section "Project URL" | Variable `VITE_SUPABASE_URL` |
| **anon / public** | Section "Project API keys" | Variable `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **service_role** | Section "Project API keys" (cliquer "Reveal") | Pour les Edge Functions uniquement ⚠️ |

> 🔴 **ATTENTION** : La clé `service_role` est **secrète** ! Ne la partagez jamais et ne l'exposez jamais côté client.

4. Copiez ces valeurs dans votre fichier `.env`

---

## 4. Configurer l'authentification

1. Allez dans **Authentication** (menu gauche)
2. Cliquez sur **"Providers"**
3. Vérifiez que **Email** est activé
4. Configuration recommandée :
   - ✅ **Enable Email Signup** : Activé
   - ⬜ **Confirm email** : Désactivé (pour simplifier les tests)
   - ✅ **Secure email change** : Activé

### Configurer les templates d'email (optionnel mais recommandé) :
1. Allez dans **Authentication > Email Templates**
2. Personnalisez les templates avec le nom de votre site : `Deku booster`

---

## 5. Configurer les Edge Functions

Les Edge Functions sont des fonctions serverless qui gèrent la logique métier (commandes, services, etc.).

### Via le Dashboard (méthode simple) :
1. Allez dans **"Edge Functions"** (menu gauche)
2. Les fonctions seront déployées automatiquement depuis votre code source

### Via la CLI Supabase (méthode avancée) :
```bash
# Installer la CLI Supabase
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref <votre-project-ref>

# Déployer les fonctions
supabase functions deploy boost-order
supabase functions deploy boost-services
supabase functions deploy exo-order
supabase functions deploy exo-services
supabase functions deploy user-api
```

---

## 6. Configurer les secrets

Les secrets sont des variables d'environnement accessibles par les Edge Functions.

### Via le Dashboard :
1. Allez dans **Settings > Edge Functions**
2. Cliquez sur **"Manage Secrets"**
3. Ajoutez les secrets suivants :

| Nom du Secret | Valeur | Description |
|--------------|--------|-------------|
| `DEKU_BOOST_API_KEY` | `f9aa0ec118d80ce90ae6249731ec9515f99c7ea139cb1f86d166765be0d54dd2` | Clé API Deku Boost |
| `SUPABASE_URL` | Votre URL Supabase | URL du projet |
| `SUPABASE_ANON_KEY` | Votre clé anon | Clé publique |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service_role | Clé d'administration |

### Via la CLI :
```bash
supabase secrets set DEKU_BOOST_API_KEY="f9aa0ec118d80ce90ae6249731ec9515f99c7ea139cb1f86d166765be0d54dd2"
supabase secrets set SUPABASE_URL="<votre-url>"
supabase secrets set SUPABASE_ANON_KEY="<votre-anon-key>"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="<votre-service-role-key>"
```

---

## 7. Créer le compte administrateur

1. **D'abord**, créez un compte sur votre site avec l'email : `deku0019523f@gmail.com`
2. **Ensuite**, allez dans Supabase > **SQL Editor**
3. Exécutez cette requête :

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'deku0019523f@gmail.com';
```

4. Rafraîchissez votre site et vous aurez accès au **panel admin** 🎉

---

## 8. Vérifications finales

Avant de considérer votre site comme prêt, vérifiez :

- [ ] ✅ Toutes les tables sont créées dans Table Editor
- [ ] ✅ Les clés API sont configurées dans `.env`
- [ ] ✅ Les secrets sont ajoutés dans Edge Functions
- [ ] ✅ L'authentification email fonctionne
- [ ] ✅ Le compte admin est créé et a accès au panel
- [ ] ✅ Les commandes de test fonctionnent
- [ ] ✅ Le portefeuille se met à jour correctement

---

## 9. Dépannage

### ❌ "Invalid API Key"
→ Vérifiez que votre `VITE_SUPABASE_PUBLISHABLE_KEY` est correct dans `.env`

### ❌ "JWT expired" ou erreur 401
→ L'utilisateur doit se reconnecter. Vérifiez les paramètres d'authentification.

### ❌ "Permission denied" ou erreur 403
→ Les politiques RLS bloquent l'accès. Vérifiez que le script SQL a bien été exécuté.

### ❌ Les Edge Functions ne répondent pas
→ Vérifiez que les fonctions sont déployées et que les secrets sont configurés.

### ❌ Le compte admin n'a pas accès
→ Vérifiez dans Table Editor > `user_roles` que l'entrée existe avec le bon `user_id`.

---

## 📞 Support

- **Email** : darkdeku225@outlook.com
- **WhatsApp** : +2250718623773
- **Telegram** : @darkdeku225

---
*Guide généré automatiquement par Deku booster • 15/03/2026*
