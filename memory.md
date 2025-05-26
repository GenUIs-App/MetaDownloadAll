# Project Memory

## Configuration
- Package manager: Using npm as default (no yarn.lock or pnpm-lock found)
- Language: TypeScript for frontend, JavaScript for backend

## Features Implemented

### Account Management
- **Account Storage**: JSON-based storage in `be/data/accounts.json`
- **CRUD Operations**: Complete API for managing accounts
  - Create: Add new accounts with social media links
  - Read: Fetch all accounts with details
  - Update: Modify account details
  - Delete: Remove accounts
- **Social Media Platforms**:
  - Facebook
  - Instagram
  - Threads
  - TikTok
- **UI Features**:
  - Auto-extraction of usernames from URLs
  - View buttons for quick access to profiles
  - Collapsible account cards for editing
  - Scrollable account list sorted by newest first
  - Timestamps for account creation and updates

### Technical Decisions
- Backend uses Express.js with WebSocket support
- Frontend built with React + TypeScript + Vite
- Data persistence through JSON files with backward compatibility for existing systems
- Responsive UI with Tailwind CSS

## Recurring Solutions
- Username extraction from social media URLs
- Timestamp handling for auditing changes
- Form validation requiring at least one social media URL

## Future Considerations
- Implement user authentication
- Add media download functionality for TikTok
- Consider database storage for better scalability
