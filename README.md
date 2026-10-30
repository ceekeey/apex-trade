# 🚀 Apex Trade

<h3 align="center">Trade Smarter. Track Better. Grow Consistently.</h3>

<p align="center">
  A modern trading journal and performance-analysis platform built to help traders document their executions, manage risk, analyze performance, and develop consistent trading habits.
</p>

<p align="center">
  <a href="https://github.com/ceekeey">
    <img src="https://img.shields.io/badge/GitHub-ceekeey-181717?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
  <img src="https://img.shields.io/badge/Status-In%20Development-2563EB?style=for-the-badge" alt="Development Status"/>
  <img src="https://img.shields.io/badge/License-To%20Be%20Determined-gray?style=for-the-badge" alt="License"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=flat&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white" />
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Screenshots](#-screenshots)
- [Core Features](#-core-features)
- [Trade Documentation System](#-four-stage-trade-documentation)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#-application-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Development Roadmap](#-development-roadmap)
- [Security and Data Integrity](#-security-and-data-integrity)
- [Disclaimer](#-disclaimer)
- [Author](#-author)

---

## 💡 About the Project

**Apex Trade** is a trading journal and performance-analysis application designed to help individual traders become more disciplined, organized, and consistent.

Trading is not just about entering and exiting positions. It also involves planning, risk management, execution, psychology, and continuous evaluation.

Apex Trade aims to bring these activities into one organized platform.

With Apex Trade, traders can document their trades, organize trading accounts, record market conditions, capture chart screenshots, review trading decisions, and evaluate performance over time.

### 🎯 Project Objectives

- 📝 Record and organize trading activities.
- 📊 Analyze trading performance using reliable statistics.
- 🎯 Track planned risk and actual trade outcomes.
- 🖼️ Document every completed trade with four structured screenshots.
- 🧠 Review trading psychology, mistakes, and lessons.
- 📈 Encourage discipline and continuous improvement.

> **Our philosophy:** Every trade has a lesson. Document it, review it, and improve from it.

## 🖥️ Screenshots

Here is a preview of the Apex Trade application.

### 🏠 Home Page

<p align="center">
  <img src="docs/screenshots/home.png" alt="Apex Trade Home Page" width="100%" />
</p>

### 🔐 Authentication

<p align="center">
  <img src="docs/screenshots/login.png" alt="Apex Trade Login Page" width="100%" />
</p>

### 📊 Trading Dashboard

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Apex Trade Dashboard" width="100%" />
</p>

*Screenshots should be updated with the latest application interface.*

## ✨ Core Features

Apex Trade is being developed around the following capabilities:

| Feature | Description |
|---|---|
| 🔐 Authentication | Secure user authentication and session management |
| 👤 User Management | Manage user profiles and account information |
| 💼 Trading Accounts | Organize trades by trading account |
| 📉 Trade Management | Record and manage individual trades |
| 🎯 Strategy Management | Organize trades according to trading strategies |
| 🖼️ Screenshot Documentation | Attach four structured screenshots to each completed trade |
| 📓 Trading Journal | Record execution notes, psychology, mistakes, and lessons |
| 📊 Performance Analytics | Evaluate trading performance using consistent calculations |

## 📸 Four-Stage Trade Documentation

One of the central ideas behind Apex Trade is complete trade documentation.

Every completed trade must have four distinct screenshot categories.

| Stage | Screenshot Category | Purpose |
|---|---|---|
| 01 | Market Context / HTF Bias | Document higher-timeframe direction and market structure |
| 02 | Setup / POI | Capture the point of interest, setup area, and relevant liquidity |
| 03 | Entry Execution / Confirmation | Show entry confirmation, stop loss, and take profit |
| 04 | Trade Outcome / Exit | Document the closed position and final result |

### Why Four Screenshots?

A trading result alone does not explain whether a trade was executed properly.

By documenting all four stages, traders can review the complete decision-making process, identify mistakes, and understand what needs improvement.

**A trade can remain incomplete while documentation is missing. It cannot be marked complete until all four screenshot slots contain valid, persisted images.**

## 🛠️ Technology Stack

Apex Trade uses a modern JavaScript-based architecture.

### Frontend

| Technology | Purpose |
|---|---|
| ⚛️ React | User interface |
| ⚡ Vite | Development server and build tooling |
| JavaScript | Application logic |

### Backend

| Technology | Purpose |
|---|---|
| 🟢 Node.js | JavaScript runtime |
| 🚀 Express 5 | REST API framework |
| Sequelize 6 | Database ORM |
| Zod | Request validation |
| bcrypt | Password hashing |
| JSON Web Token | Authentication |
| Multer | File upload handling |
| Nodemailer | Email services |
| Helmet | Security headers |
| express-rate-limit | Request rate limiting |

### Database

- 🐬 MySQL
- Sequelize ORM
- Database migrations and relationships

## 🏗️ Application Architecture

Apex Trade follows a monorepo structure with separate frontend and backend applications.

```text
apex-trade/
│
├── client/                 # React + Vite frontend
│   ├── public/
│   └── src/
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── database/
│   │   ├── modules/
│   │   ├── services/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── constants/
│   │
│   └── tests/
│
├── context/                # Project documentation
│   ├── AGENTS.md
│   ├── PROJECT_CONTEXT.md
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── DATABASE.md
│   └── IMPLEMENTATION_PLAN.md
│
├── docs/
│   └── screenshots/
│
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

*The structure represents the intended architecture. Some modules and directories are introduced incrementally as development progresses.*

### Backend Design

The backend follows a modular MVC architecture supported by a service layer.

- **Routes:** Define API endpoints and middleware.
- **Controllers:** Handle HTTP requests and responses.
- **Services:** Contain business logic and application operations.
- **Models:** Define database entities and relationships.
- **Validators:** Validate incoming data using Zod.
- **Middlewares:** Handle authentication, authorization, security, and errors.

This separation keeps the application maintainable, testable, and easier to extend.

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MySQL](https://www.mysql.com/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/ceekeey/REPOSITORY_NAME.git
```

Replace `REPOSITORY_NAME` with the actual GitHub repository name.

### 2. Navigate to the Project

```bash
cd apex-trade
```

### 3. Install Dependencies

```bash
npm install
```

The project is targeting a single root package manifest for frontend and backend dependencies. The package consolidation is being handled as a controlled migration.

### 4. Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env
```

Configure your database credentials, authentication secrets, and other required environment variables.

Never commit `.env` or other files containing credentials.

### 5. Start the Development Servers

Use the development scripts available in the root `package.json`.

The intended commands are:

```bash
npm run dev:client
```

```bash
npm run dev:server
```

*These commands depend on the root package-script consolidation being completed.*

## 🗺️ Development Roadmap

Apex Trade is being developed incrementally, with a focus on reliability and maintainability.

- [x] Define product direction and application architecture.
- [x] Establish the frontend and backend technology choices.
- [x] Define the four-stage screenshot documentation requirement.
- [ ] Complete root package consolidation.
- [ ] Implement backend foundation and database integration.
- [ ] Implement authentication and session management.
- [ ] Implement trading account management.
- [ ] Implement trade management.
- [ ] Implement private screenshot storage and uploads.
- [ ] Implement journal and trade reviews.
- [ ] Implement performance analytics.
- [ ] Complete integration and security testing.

## 🔒 Security and Data Integrity

Security and financial accuracy are important parts of Apex Trade.

The application architecture prioritizes:

- Secure password hashing.
- Authentication and server-side authorization.
- User ownership verification for trading records.
- Private screenshot storage.
- Validated image uploads.
- Environment-based secrets management.
- Rate limiting and secure HTTP headers.
- Decimal-safe financial calculations.
- Database transactions for multi-step operations.

Each user's trading records and screenshots must remain accessible only to their authorized owner.

## ⚠️ Disclaimer

Apex Trade is a trading journal and educational performance-analysis application.

It is not a broker, exchange, investment platform, or trade-execution service. It does not execute trades, hold funds, or guarantee profits.

Trading involves financial risk. All trading decisions and associated risks remain the responsibility of the individual trader.

## 👨‍💻 Author

**Isah — Ceekeey**

Software Developer | Trading Enthusiast

<p align="left">
  <a href="https://github.com/ceekeey">
    <img src="https://img.shields.io/badge/GitHub-Follow%20Me-181717?style=for-the-badge&logo=github" alt="Follow on GitHub"/>
  </a>
</p>

---

<p align="center">
  <strong>APEX TRADE</strong>
  <br/>
  Trade Smarter. Track Better. Grow Consistently.
  <br/><br/>
  Built with ❤️, discipline, and a commitment to continuous improvement.
</p>