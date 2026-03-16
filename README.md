# 🏫 Système de Gestion des Salles et Pannes - ENCGO

Projet de fin de module pour la gestion des équipements informatiques, pannes, et affectations.

## 📁 Structure du Projet
- **/backend**: API REST développée avec Laravel 11.
- **/frontend**: Interface utilisateur développée avec React (Vite) et Redux Toolkit.

---

## 🚀 Guide d'Installation (Pour l'équipe)

### 1. Prérequis
Assurez-vous d'avoir installé :
- PHP >= 8.2 & Composer
- Node.js & npm
- MySQL (XAMPP ou Laragon)

---

### 2. Configuration du Backend
```bash
cd backend
composer install
cp .env.example .env
```

Configurer la base de données dans le fichier `.env` :
```
DB_DATABASE=votre_nom_db
DB_USERNAME=root
DB_PASSWORD=
```

Ensuite :
```bash
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

### 3. Configuration du Frontend
```bash
cd frontend
npm install
cp .env.example .env
```

Configurer le fichier `.env` :
```
VITE_API_URL=http://127.0.0.1:8000/api
```

Ensuite :
```bash
npm run dev
```

---

## 🌿 Git Workflow (Pour l'équipe)

Chaque membre travaille sur sa propre branche :
```bash
# Créer une branche pour ta fonctionnalité
git checkout -b feature/nom-de-la-fonctionnalite

# Après avoir terminé, pousser la branche
git push origin feature/nom-de-la-fonctionnalite
```

Ensuite ouvrir une **Pull Request** sur GitHub vers la branche `main`.
