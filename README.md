# Log Viewer Application

A modern log viewer application built with Next.js, Supabase, and Tailwind CSS.

## Features

- View logs from Supabase database
- Filter logs by level (ERROR, WARN, INFO, DEBUG)
- Search logs by message content
- Sort by created_at or level
- Pagination support
- Light and dark theme support
- Responsive design

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

Make sure your Supabase database has a `logs` table with the following schema:

```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('ERROR', 'WARN', 'INFO', 'DEBUG')),
  message TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_logs_created_at ON logs(created_at DESC);
CREATE INDEX idx_logs_level ON logs(level);
CREATE INDEX idx_logs_message ON logs USING gin(to_tsvector('english', message));
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Configuration Files

- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore for Prettier
- `.editorconfig` - Editor configuration
- `eslint.config.mjs` - ESLint configuration

## Enable log in supabase

```sql
  CREATE POLICY "Allow read for all"
  ON logger
  FOR SELECT
  USING (true);
```
