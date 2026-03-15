# SOIN DIRECT - Application de Soins à Domicile

**SOIN DIRECT** est une application complète de gestion de soins à domicile en Côte d'Ivoire. Elle permet aux patients de demander des soins médicaux mineurs et aux professionnels de santé d'effectuer des interventions à domicile.

---

## 🏗️ Architecture Technique

### Stack Moderne
- **Framework Frontend/Backend**: [SvelteKit](https://kit.svelte.dev/)
- **Base de données & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Style**: [Tailwind CSS](https://tailwindcss.com/)
- **Icônes**: [Lucide Svelte](https://lucide.dev/)
- **Langage**: TypeScript

---

## 🚀 Installation & Démarrage

### 1. Cloner le projet
```bash
git clone [repository-url]
cd soin-directt
```

### 2. Configuration Supabase
L'application utilise Supabase pour l'authentification et la base de données.
- Copiez le fichier `.env.example` en `.env`.
- Remplissez les variables `PUBLIC_SUPABASE_URL` et `PUBLIC_SUPABASE_ANON_KEY` avec les informations de votre projet Supabase.
- Appliquez les migrations situées dans `supabase/migrations/` sur votre instance Supabase.

### 3. Installation des dépendances
```bash
npm install
```

### 4. Démarrage en mode développement
```bash
npm run dev
```
L'application sera accessible sur: **http://localhost:5173**

---

## 📱 Fonctionnalités

### Patient
- ✅ Inscription et connexion
- ✅ Demande de soins (Pansement, Tension, Prise de sang, etc.)
- ✅ Suivi des missions en temps réel
- ✅ Historique des constantes vitales

### Professionnel (IDE, Kiné, Biologiste)
- ✅ Gestion des missions assignées
- ✅ Saisie des constantes vitales
- ✅ Consultation du dossier patient

### Administrateur
- ✅ Gestion des utilisateurs et rôles
- ✅ Assignation des missions
- ✅ Tableau de bord des statistiques

---

## 🩺 Constantes Vitales Suivies
Le système permet de suivre :
- TA Systolique/Diastolique
- Pouls
- Glycémie
- Poids

---

## 🔒 Sécurité
- Authentification gérée par Supabase Auth.
- Sécurité des données via **Row Level Security (RLS)** sur PostgreSQL.
- Rôles spécifiques : Patient, IDE, Biologiste, Kiné, Admin.

---

## ⚠️ Avertissement Légal
**SOIN DIRECT** intervient uniquement pour des besoins médicaux **MINEURS** et de confort à domicile. En cas d'urgence médicale, appelez le **15 (SAMU)** immédiatement.

---

**SOIN DIRECT** - © 2024 - Service de soins à domicile
