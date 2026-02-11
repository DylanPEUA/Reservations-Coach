# Backend - Reservations Coach API

API REST pour l'application de réservation de coach sportif.

## 🚀 Installation

```bash
npm install
```

## Configuration

Copier .env.example en .env et configurer les variables d'environnement.

## Démarrage

Mode développement
```bash
npm run dev
```

Mode production
```bash
npm start
```

L'API démarre sur http://localhost:3000

## API Routes

- Get /api/health - Vérifier que le server fonctionne

## Structure

src/
├── controllers/      # Logique métier
├── routes/          # Routes API
├── models/          # Models de données
├── middleware/      # Middlewares Express
├── services/        # Services métier
├── utils/           # Utilitaires
├── database.js      # Connection PostgreSQL
└── server.js        # Point d'entrée

## 📜 Variables d'environnement

- PORT - Port du serveur (défaut: 3000)
- NODE_ENV - Environnement (development/production)
- DB_HOST - Host PostgreSQL
- DB_PORT - Port PostgreSQL
- DB_NAME - Nom de la base de données
- DB_USER - Utilisateur PostgreSQL
- DB_PASSWORD - Mot de passe PostgreSQL
- JWT_SECRET - Secret pour les tokens JWT
- JWT_EXPIRY - Expiration des tokens JWT
- CORS_ORIGIN - Origin pour CORS