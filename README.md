# EvoluMC Launcher — EvoluMC_Studios

Launcher officiel Minecraft pour le serveur EvoluMC.  
Connexion Microsoft (OAuth2) · Vanilla Minecraft · Gestion des versions

---

## 📁 Fichiers inclus

| Fichier | Rôle |
|---|---|
| `index.html` | Interface complète du launcher |
| `main.js` | Processus principal Electron |
| `package.json` | Configuration du projet & build |

---

## 🚀 Transformer en .exe (Windows)

### Prérequis
- [Node.js](https://nodejs.org) v18 ou supérieur
- [Git](https://git-scm.com) (optionnel)

### Étapes

```bash
# 1. Place tous les fichiers dans un dossier
cd evolumc-launcher

# 2. Installe les dépendances
npm install

# 3. Lance en mode développement (test)
npm start

# 4. Compile l'installeur .exe Windows
npm run build-win
```

Le fichier `EvoluMC Launcher Setup 1.0.0.exe` sera généré dans le dossier `dist/`.

---

## 🖥️ Fonctionnalités du launcher

- ✅ Connexion compte **Microsoft** (simulation OAuth2)
- ✅ Mode **hors-ligne** (démo)
- ✅ Sélection de **version** (1.18.2 → 1.21.4)
- ✅ Barre de **progression** au lancement
- ✅ **Bibliothèque** de versions Vanilla
- ✅ Statut serveur en temps réel (ping, joueurs)
- ✅ **Paramètres** : RAM, Java, résolution, Discord RPC
- ✅ Interface **sombre** native Windows

---

## 📝 Notes

- L'icône `.ico` doit être ajoutée manuellement (`icon.ico` — 256×256 recommandé)
- La vraie intégration Minecraft nécessite `minecraft-launcher-lib` (npm)
- La vraie connexion Microsoft utilise l'API Xbox Live / OAuth2

---

EvoluMC_Studios © 2024
