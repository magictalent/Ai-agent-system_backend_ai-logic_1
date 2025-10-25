# AI Sales Agents Platform

An end-to-end AI Sales Assistant platform that connects directly to clients' CRMs (HubSpot, Salesforce, Pipedrive) and Google Workspace to automate lead communication and meeting scheduling.

## Features

- **Multi-CRM Integration**: Connect with HubSpot, Salesforce, and Pipedrive
- **Google Workspace Integration**: Calendar scheduling and Gmail automation
- **AI-Powered Communication**: Automated lead engagement via WhatsApp, Email, and SMS
- **Real-time Analytics**: Track performance and optimize sales funnels
- **Lead Management**: Comprehensive lead tracking and qualification
- **Campaign Management**: Create and manage automated sales campaigns
- **Meeting Scheduling**: Automated calendar booking and management

## Tech Stack

### Backend
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: WebSocket support

### Frontend
- **Framework**: Next.js 16 with React 19
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install:all
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE ai_sales_agents;
```

### 3. Environment Configuration

Copy the environment file and configure:

```bash
# Backend
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=ai_sales_agents
JWT_SECRET=your-super-secret-jwt-key-here
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs

## Project Structure

```
ai-sales-agents/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── users/       # User management
│   │   │   ├── leads/       # Lead management
│   │   │   ├── campaigns/   # Campaign management
│   │   │   ├── conversations/ # Message handling
│   │   │   ├── crm-integrations/ # CRM connections
│   │   │   ├── calendar-integrations/ # Calendar sync
│   │   │   └── analytics/   # Analytics & reporting
│   │   └── common/          # Shared utilities
│   └── dist/               # Compiled JavaScript
├── frontend/               # Next.js React app
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   └── contexts/      # React contexts
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/profile` - Get user profile
- `POST /auth/refresh` - Refresh token

### CRM Integrations
- `GET /crm-integrations` - List CRM connections
- `POST /crm-integrations` - Create CRM connection
- `POST /crm-integrations/:id/test` - Test connection
- `POST /crm-integrations/:id/sync` - Sync leads

### Calendar Integrations
- `GET /calendar-integrations` - List calendar connections
- `POST /calendar-integrations` - Create calendar connection
- `POST /calendar-integrations/:id/events` - Create event
- `GET /calendar-integrations/:id/availability` - Get available slots

### Leads Management
- `GET /leads` - List leads
- `POST /leads` - Create lead
- `PUT /leads/:id` - Update lead
- `DELETE /leads/:id` - Delete lead

### Campaigns
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `PUT /campaigns/:id` - Update campaign
- `POST /campaigns/:id/start` - Start campaign

## Development

### Backend Development

```bash
cd backend
npm run start:dev    # Development with hot reload
npm run build        # Build for production
npm run start:prod   # Start production build
npm run test         # Run tests
npm run lint         # Lint code
```

### Frontend Development

```bash
cd frontend
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Start production build
npm run lint         # Lint code
```

## Database Schema

The application uses the following main entities:

- **Users**: User accounts with role-based access
- **Organizations**: Company/team management
- **Leads**: Lead information and status
- **Campaigns**: Marketing campaigns
- **Conversations**: Message threads
- **CRM Connections**: External CRM integrations
- **Calendar Connections**: Google Calendar integrations
- **Notifications**: System notifications

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ai_sales_agents

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# CRM Integrations (for future use)
HUBSPOT_API_KEY=your-hubspot-key
SALESFORCE_CLIENT_ID=your-salesforce-id
PIPEDRIVE_API_TOKEN=your-pipedrive-token

# Google Workspace (for future use)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.