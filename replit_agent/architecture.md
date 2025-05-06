# Architecture Overview

## Overview

Webel is a full-stack application designed to connect engineers, consumers, and manufacturers in an innovative ecosystem. It serves as a platform for 3D printing services, engineering expertise, and resource sharing. The application follows a modern client-server architecture with a React frontend and Express.js backend, using PostgreSQL for data persistence.

## System Architecture

The application follows a standard web application architecture with the following main components:

1. **Frontend**: React-based single-page application (SPA) built with TypeScript and Vite
2. **Backend**: Express.js server with TypeScript
3. **Database**: PostgreSQL database with Drizzle ORM for database schema management
4. **Authentication**: Session-based authentication
5. **External Services**: Integration with payment processors (PayPal, Stripe), cloud storage (AWS S3), and AI capabilities (OpenAI)

```
┌─────────────────┐      ┌──────────────────┐      ┌────────────────┐
│                 │      │                  │      │                │
│  React Frontend │<────>│  Express Backend │<────>│ PostgreSQL DB  │
│    (Vite/SPA)   │      │   (TypeScript)   │      │   (Drizzle)    │
│                 │      │                  │      │                │
└─────────────────┘      └──────────────────┘      └────────────────┘
                                  ^
                                  │
                                  v
                         ┌────────────────────┐
                         │  External Services │
                         │   - AWS S3         │
                         │   - OpenAI         │
                         │   - PayPal         │
                         │   - Stripe         │
                         └────────────────────┘
```

## Key Components

### Frontend

1. **Client Application (`client/src/`)**: 
   - Built with React and TypeScript
   - Uses Vite as the build tool and development server
   - Implements client-side routing with wouter
   - State management with React Query (TanStack Query)
   - UI framework based on shadcn/ui components and Tailwind CSS
   - Organized into pages, components, hooks, and contexts

2. **Key Frontend Features**:
   - Resource management and sharing
   - Service discovery and provider registration
   - Location-based service discovery
   - User profile and authentication
   - Payment processing
   - Auction system
   - Administrative dashboard

### Backend

1. **Express Server (`server/`)**: 
   - REST API built with Express.js
   - TypeScript for type safety
   - Session-based authentication
   - Integration with database via Drizzle ORM

2. **API Routes**:
   - User management and authentication
   - Resource CRUD operations
   - Service provider registration and management
   - Payment processing
   - Admin functionality
   - Verification services
   - AI functionality via OpenAI integration

3. **Services**:
   - Authentication (`server/auth.ts`)
   - Database access (`server/db.ts`)
   - Storage management (`server/storage.ts`)
   - Payment processing (`server/payment.ts`, `server/paypal.ts`, `server/stripe.ts`)
   - AI services (`server/openai.ts`)
   - Phone/account verification (`server/verification.ts`)

### Database

1. **Schema Design (`shared/schema.ts`)**:
   - Uses Drizzle ORM for schema definition and database operations
   - Main tables include:
     - users
     - services
     - resources
     - auctions
     - bids
     - orders
     - transactions

2. **Entity Relationships**:
   - Users can be service providers
   - Services are owned by users
   - Resources have categories and can be uploaded by users
   - Auctions can receive bids from users
   - Orders track service purchases
   - Transactions record payment details

### Shared Code

1. **Shared Types and Schemas (`shared/`)**:
   - Database schema definitions shared between frontend and backend
   - TypeScript interfaces for data models
   - Common validation schemas using Zod

## Data Flow

### Authentication Flow

1. User submits login credentials via the login form
2. Server validates credentials and creates a session
3. Session ID is stored in a cookie on the client
4. Session is validated on subsequent requests
5. User data is fetched and stored in context for frontend use

### Resource Upload Flow

1. User uploads resource files (images, 3D models, etc.)
2. Files are uploaded to AWS S3 (or local storage in development)
3. Resource metadata is stored in the database
4. Users can search, browse, and download resources

### Service Discovery Flow

1. User searches for services with optional location filtering
2. Server queries services based on search criteria and location proximity
3. Results are displayed to the user with mapping capabilities
4. Users can contact service providers or initiate payment

### Payment Flow

1. User selects a service and payment method
2. Server initiates payment with the chosen provider (PayPal, Stripe)
3. User completes payment on the provider's interface
4. Server receives payment confirmation and updates order status
5. Service provider is notified of the new order

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **TanStack Query**: Data fetching and state management
- **wouter**: Lightweight router for React
- **shadcn/ui**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Icon library
- **Zod**: Schema validation
- **React Hook Form**: Form handling
- **date-fns**: Date manipulation

### Backend Dependencies

- **Express.js**: Web server framework
- **express-session**: Session management
- **Drizzle ORM**: Database ORM
- **@neondatabase/serverless**: Neon PostgreSQL client
- **Passport.js**: Authentication middleware
- **multer**: File upload handling
- **AWS SDK**: S3 integration
- **OpenAI**: AI functionality
- **PayPal SDK**: PayPal integration
- **crypto**: Cryptographic functions

## Deployment Strategy

The application is configured for deployment on Replit, as evident from the `.replit` configuration file. The deployment process includes:

1. **Build Step**: 
   - Frontend: Vite builds the React application
   - Backend: esbuild bundles the server code
   - Output directory: `dist/`

2. **Run Command**: `npm run start` (Node.js production server)

3. **Environment Configuration**:
   - Database connection via DATABASE_URL environment variable
   - API keys for external services
   - Session secrets
   - Production/development mode switching

4. **Database Management**:
   - Schema migrations via Drizzle
   - Production database provisioned through Neon PostgreSQL

5. **Static Assets**:
   - Served from `dist/public/`
   - Includes bundled frontend and uploaded files

The application is designed to be deployed as a single unit, with the Express server handling both API requests and serving the static frontend assets.

## Security Considerations

1. **Authentication**: 
   - Session-based authentication with secure cookies
   - Password hashing using scrypt with salt
   - CSRF protection through token validation

2. **Data Validation**:
   - Input validation with Zod schemas
   - API request sanitization

3. **Payment Security**:
   - Delegation of payment processing to trusted providers
   - Server-side payment verification

4. **User Verification**:
   - Phone verification
   - Bank account verification for service providers

## Future Extensibility

The architecture is designed to be extensible in the following ways:

1. **Service Types**: New service types can be added through the schema
2. **Payment Providers**: Additional payment gateways can be integrated
3. **Resource Types**: The system supports multiple resource types
4. **Localization**: Multi-language support is implemented
5. **AI Capabilities**: Further AI integration through OpenAI

This modular approach allows for scaling the application's features while maintaining a consistent architectural pattern.