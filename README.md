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

### 2. Configuration du Backend
```bash
cd backend
composer install
cp .env.example .env
# Configurer la base de données dans le fichier .env (DB_DATABASE=votre_nom_db)
php artisan key:generate
php artisan migrate --seed
php artisan serve

//////////

Configuration Frontend (React)

cd ../frontend
npm install
cp .env.example .env  # (Configure VITE_API_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api))
npm run dev