# Makerkit - Supabase SaaS Starter Kit - Turbo Edition

This is a Starter Kit for building SaaS applications using Supabase, Next.js, and Tailwind CSS.

This version uses Turborepo to manage multiple packages in a single repository.

**This project is currently under development. Please wait for the stable release before using it in production.**

### Roadmap

The roadmap for the project is as follows:

1. **March 31**: Alpha release - authentication, personal accounts, team accounts (memberships)
2. **April 7**: Beta release - billing, Stripe, Lemon Squeezy, and more
3. **April 14**: Release candidate - admin dashboard, translations, and more
4. **April 21**: Final Release candidate - final features and improvements
5. **April 28**: Stable release - final features and improvements
6. **May 4**: Post-release - documentation, tutorials, and more

## Features

- **Authentication**: Sign up, sign in, sign out, forgot password, update profile, and more.
- **Billing**: Subscription management, payment methods, invoices, and more.
- **Personal Account**: Manage your account, profile picture, and more.
- **Team Accounts**: Invite members, manage roles, and more.
- **Admin Dashboard**: Manage users, subscriptions, and more.
- **Pluggable**: Easily add new features and packages to your SaaS application.

The most notable difference between this version and the original version is the use of Turborepo to manage multiple packages in a single repository.

Thanks to Turborepo, we can manage and isolate different parts of the application in separate packages. This makes it easier to manage and scale the application as it grows.

Additionally, we can extend the codebase without it impacting your web application.

Let's get started!

## Quick Start

### 0. Prerequisites

- Node.js 18.x or later
- Docker
- Pnpm
- Supabase account (optional for local development)
- Payment Gateway account (Stripe/Lemon Squeezy)
- Email Service account (optional for local development)

#### 0.1. Install Pnpm

```bash
# Install pnpm
npm i -g pnpm
```

### 1. Setup dependencies

```bash
# Install dependencies
pnpm i
```

### 2. Start the development server

```bash
# Start the development server
pnpm dev
```

This command will run both the web application and the Supabase container. If the Supabase container is already running, it will only start the web application.

## Architecture

This project uses Turborepo to manage multiple packages in a single repository.

### Apps

The core web application can be found in the `apps/web` package.

Here is where we add the skeleton of the application, including the routing, layout, and global styles.

The main application defines the following:
1. **Configuration**: Environment variables, feature flags, paths, and more. The configuration gets passed down to other packages.
2. **Routing**: The main routing of the application. Since this is file-based routing, we define the routes here.
3. **Local components**: Shared components that are used across the application but not necessarily shared with other apps/packages.
4. **Global styles**: Global styles that are used across the application.

### Packages

Below are the reusable packages that can be shared across multiple applications (or packages).

- **`@kit/ui`**: Shared UI components and styles (using Shadcn UI and some custom components)
- **`@kit/shared`**: Shared code and utilities
- **`@kit/supabase`**: Supabase package that defines the schema and logic for managing Supabase
- **`@kit/i18n`**: Internationalization package that defines utilities for managing translations
- **`@kit/billing`**: Billing package that defines the schema and logic for managing subscriptions
- **`@kit/billing-gateway`**: Billing gateway package that defines the schema and logic for managing payment gateways
- **`@kit/email-templates`**: Here we define the email templates using the `react.email` package.
- **`@kit/mailers`**: Mailer package that abstracts the email service provider (e.g., Resend, Cloudflare, SendGrid, Mailgun, etc.)

And features that can be added to the application:
- **`@kit/auth`**: Authentication package (using Supabase)
- **`@kit/accounts`**: Package that defines components and logic for managing personal accounts
- **`@kit/team-accounts`**: Package that defines components and logic for managing team
- **`@kit/admin`**: Admin package that defines the schema and logic for managing users, subscriptions, and more.

And billing packages that can be added to the application:
- **`@kit/stripe`**: Stripe package that defines the schema and logic for managing Stripe. This is used by the `@kit/billing-gateway` package and abstracts the Stripe API.
- **`@kit/lemon-squeezy`**: Lemon Squeezy package that defines the schema and logic for managing Lemon Squeezy. This is used by the `@kit/billing-gateway` package and abstracts the Lemon Squeezy API. (Coming soon)
- **`@kit/paddle`**: Paddle package that defines the schema and logic for managing Paddle. This is used by the `@kit/billing-gateway` package and abstracts the Paddle API. (Coming soon

### Application Configuration

The configuration is defined in the `apps/web/config` folder. Here you can find the following configuration files:
- **`app.config.ts`**: Application configuration (e.g., name, description, etc.)
- **`auth.config.ts`**: Authentication configuration
- **`billing.config.ts`**: Billing configuration
- **`feature-flags.config.ts`**: Feature flags configuration
- **`paths.config.ts`**: Paths configuration (e.g., routes, API paths, etc.)
- **`personal-account-sidebar.config.ts`**: Personal account sidebar configuration (e.g., links, icons, etc.)
- **`organization-account-sidebar.config.ts`**: Team account sidebar configuration (e.g., links, icons, etc.)

## Installing a Shadcn UI component

To install a Shadcn UI component, you can use the following command:

```bash
npx shadcn-ui@latest add <component> --path=packages/src/ui/shadcn
```

For example, to install the `Button` component, you can use the following command:

```bash
npx shadcn-ui@latest add button --path=packages/src/ui/shadcn
```

We pass the `--path` flag to specify the path where the component should be installed.