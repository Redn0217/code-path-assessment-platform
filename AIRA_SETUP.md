# Aira AI Interview System - Database Setup

## Overview

The Aira page has been updated to use database-driven content instead of hardcoded mock data. This provides a more realistic and persistent interview experience.

## Database Setup

### Option 1: Quick Fix (If you're getting errors)

If you're seeing errors about missing `attempt_number` column:

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `quick_fix_attempt_number.sql`
4. Run the SQL to add the missing column

### Option 2: Full Setup (For new installations)

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `aira_tables_setup.sql`
4. Run the SQL to create all necessary tables

### Option 3: Add to Existing Installation

If you already have some Aira tables but missing the attempt_number column:

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `aira_add_attempt_number.sql`
4. Run the SQL to add attempt tracking to existing tables

### 4. Update Supabase Types (Optional)

The TypeScript types have already been updated in `src/integrations/supabase/types.ts` to include the new Aira tables.

## New Features

### Database-Driven Content

- **Interview Sessions**: Each user can have multiple interview sessions with different roles
- **Conversation History**: All AI-user conversations are stored and persisted
- **Real-time Activities**: System activities and notifications are tracked
- **Code Snippets**: Shared code during interviews is saved and can be retrieved
- **Analytics**: Performance metrics and skill assessments are stored

### Key Components

1. **useAiraInterview Hook** (`src/hooks/useAiraInterview.ts`)
   - Manages interview sessions, conversations, activities, and code snippets
   - Provides functions to create sessions, add conversations, update code, etc.

2. **useAiraAnalytics Hook** (`src/hooks/useAiraAnalytics.ts`)
   - Handles skill scoring, session metrics, and performance analytics
   - Calculates response quality, confidence scores, and overall grades

3. **Updated Aira Component** (`src/pages/Aira.tsx`)
   - Now uses database hooks instead of hardcoded data
   - Real user profiles and session data
   - Persistent conversation history and code snippets

## Database Tables Created

### `aira_interview_sessions`
- Tracks each interview session with role, stage, and status
- Links to user profiles and stores session metadata

### `aira_conversations`
- Stores all AI-user conversation messages
- Organized by session and stage with timestamps

### `aira_analytics`
- Performance metrics and skill assessments
- Categorized scores for different competencies

### `aira_activities`
- Real-time activity feed for system events
- Different types: question, answer, analysis, system

### `aira_code_snippets`
- Code shared during interviews
- Supports multiple files per session with analysis data

## Usage

### Starting an Interview

1. User selects a role (Frontend Developer, Backend Developer, etc.)
2. System creates a new interview session in the database
3. Default skill analytics are initialized
4. User progresses through interview stages

### Conversation Flow

1. AI messages and user responses are stored in `aira_conversations`
2. Each message is linked to the current session and stage
3. Conversation history persists across page refreshes

### Code Collaboration

1. Code written in the shared editor is automatically saved
2. Updates are stored in `aira_code_snippets` table
3. AI analysis and suggestions can be stored as metadata

### Analytics and Scoring

1. Skill scores are calculated and stored in `aira_analytics`
2. Session metrics are derived from conversation and timing data
3. Overall performance grades are calculated dynamically

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own interview data
- All policies ensure data isolation between users

## Benefits

1. **Persistence**: Interview progress is saved and can be resumed
2. **Analytics**: Real performance tracking and improvement insights
3. **Scalability**: Can handle multiple concurrent interview sessions
4. **Realism**: More authentic interview experience with real data
5. **Extensibility**: Easy to add new features and metrics

## Next Steps

1. Run the SQL migration in your Supabase dashboard
2. Test the Aira page to ensure everything works correctly
3. Consider adding more advanced analytics and AI features
4. Implement interview scheduling and management features
