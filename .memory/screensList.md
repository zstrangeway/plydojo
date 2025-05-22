# PlyDojo Screens - Chess Tutor Application

## Last Updated
2025-05-27

## Authentication

### Login Screen - `/login`
**Purpose**: Authenticate existing users and provide access to the application.

**Layout Elements**:
- Logo and application name at the top center
- Login form in the center of the page with email and password fields
- "Log In" button beneath the form fields
- "Forgot Password?" link below the login button
- "Create an Account" link/button for new users at the bottom

**User Flows**:
1. **Successful Login**:
   - User enters valid email and password
   - System validates credentials (API: `POST /api/auth/login`)
   - User is redirected to Dashboard (`/`)
   
2. **Failed Login**:
   - User enters invalid credentials
   - System displays error message (API: `POST /api/auth/login` with error response)
   - Form is preserved with entered email (password field cleared)
   
3. **Password Recovery**:
   - User clicks "Forgot Password?" link
   - System displays password reset email field
   - User enters email and submits (API: `POST /api/auth/password-reset/request`)
   - System sends password reset instructions
   - Confirmation message displayed
   
4. **New User Registration**:
   - User clicks "Create an Account" link
   - System redirects to Registration Screen (`/register`)

### Registration Screen - `/register`
**Purpose**: Allow new users to create an account.

**Layout Elements**:
- Logo and application name at the top center
- Registration form with fields:
  - Email address
  - Password (with strength indicator)
  - Password confirmation
  - Optional: Name/Username
- Terms of service checkbox with link to full terms
- "Create Account" button
- "Already have an account? Log in" link
- Visual progress indicator showing registration steps:
  1. Account Information (current step during form completion)
  2. Email Verification (next step after form submission)
  3. Account Setup Complete

**User Flows**:
1. **Successful Registration**:
   - User completes all required fields
   - User accepts terms of service
   - System validates input (email format, password requirements)
   - System creates account in pending state (API: `POST /api/auth/register`)
   - System sends verification email
   - System redirects to Verification Pending Screen
   
2. **Failed Registration**:
   - User enters invalid or missing information
   - System displays specific error messages by each field (API: `POST /api/auth/register` with error response)
   - Form preserves valid entries
   - Progress indicator remains at step 1
   
3. **Return to Login**:
   - User clicks "Already have an account? Log in" link
   - System redirects to Login Screen

### Verification Pending Screen - `/verify/pending`
**Purpose**: Inform user that verification email has been sent and provide next steps.

**Layout Elements**:
- Logo and application name at the top center
- Success message confirming account creation
- Instructions to check email
- Email address where verification was sent
- Visual progress indicator highlighting step 2 (Email Verification)
- "Resend Verification Email" button (initially disabled, activates after 5 minutes)
- "Return to Login" link
- Support contact information

**User Flows**:
1. **Awaiting Verification**:
   - User reviews instructions
   - User checks their email inbox
   
2. **Resend Verification**:
   - After 5+ minutes, user clicks "Resend Verification Email"
   - System generates new token and sends new email (API: `POST /api/auth/verify-email/resend`)
   - Confirmation message appears
   - Button is disabled again for another time period
   
3. **Return to Login**:
   - User clicks "Return to Login" link
   - System redirects to Login Screen

### Verification Success Screen - `/verify/success`
**Purpose**: Confirm successful account verification and guide user to login.

**Layout Elements**:
- Logo and application name at the top center
- Success message with checkmark icon
- Visual progress indicator showing completion (step 3)
- "Log In Now" prominent button
- Brief introduction to PlyDojo features
- Support contact information

**User Flows**:
1. **Verification Completion**:
   - User arrives after clicking valid verification link in email (API: `GET /api/auth/verify-email/:token`)
   - System updates account status to active in database
   - System displays success confirmation
   
2. **Proceed to Login**:
   - User clicks "Log In Now" button
   - System redirects to Login Screen with success message

### Verification Error Screen - `/verify/error`
**Purpose**: Handle failed verification attempts and provide recovery options.

**Layout Elements**:
- Logo and application name at the top center
- Error message explaining the issue (expired link, invalid token, etc.)
- Visual indicator of verification failure
- "Request New Verification Email" button
- "Return to Login" link
- Support contact information

**User Flows**:
1. **Expired Token**:
   - User arrives after clicking expired verification link (API: `GET /api/auth/verify-email/:token` with expired token)
   - System detects expired token
   - System displays expiration message
   
2. **Invalid Token**:
   - User arrives with tampered or invalid verification token (API: `GET /api/auth/verify-email/:token` with invalid token)
   - System detects invalid token
   - System displays generic error message
   
3. **Request New Verification**:
   - User clicks "Request New Verification Email"
   - System asks for email address confirmation
   - System generates new token and sends new email (API: `POST /api/auth/verify-email/resend`)
   - Confirmation message appears
   - User is redirected to Verification Pending Screen
   
4. **Return to Login**:
   - User clicks "Return to Login" link
   - System redirects to Login Screen

## Core Game Experience

### Dashboard - `/` (root)
**Purpose**: Central hub providing overview and access to all features.

**Layout Elements**:
- Header with logo, user profile icon, and notifications icon
- "Start New Game" prominent call-to-action button
- "Resume Game" section with list of in-progress games (if any)
- "Recent Games" section showing completed games
- Basic statistics panel (games played, win/loss record)
- Navigation sidebar/header with links to other main screens

**User Flows**:
1. **Start New Game**:
   - User clicks "Start New Game" button
   - System prompts for difficulty level selection
   - System creates new game and redirects to Game Screen with new game ID (API: `POST /api/games`)
   
2. **Resume Game**:
   - User clicks on an in-progress game
   - System loads game state and redirects to Game Screen with that game ID (API: `GET /api/games/:gameId`)
   
3. **Review Recent Game**:
   - User clicks on a completed game
   - System redirects to Game Analysis Screen for that game ID (API: `GET /api/games/:gameId/analysis`)
   
4. **Navigation**:
   - User clicks on navigation elements
   - System redirects to appropriate screen
   
5. **Access Profile**:
   - User clicks profile icon
   - System redirects to Profile Screen (API: `GET /api/profile`)

### Main Game Screen - `/game/:gameId`
**Purpose**: Primary gameplay environment for chess and AI tutoring.

**Layout Elements**:
- Left panel (approximately 60% of screen width):
  - Interactive chessboard with pieces
  - Game controls below board (restart, undo, resign, etc.)
  - Move history panel beside or below board
  - Time controls/clock (if applicable)
  - Difficulty settings
- Right panel (approximately 40% of screen width):
  - Chat interface with AI tutor
  - Message input field at bottom
  - Option to review previous messages
  - Tutor controls (e.g., request analysis, ask question)
  - Model selection dropdowns:
    - Opponent Model: Stockfish (default), LLM (future), Custom (future)
    - Tutor Model: OpenAI (default), other LLMs (future)
- Header with game information and navigation

**User Flows**:
1. **Making a Move**:
   - User selects and moves a chess piece
   - System validates move and updates board (API: `POST /api/games/:gameId/moves`)
   - AI opponent calculates and makes response move (returned in response to move API)
   - Move is recorded in move history
   - AI tutor may provide coaching comment in chat
   
2. **Invalid Move Attempt**:
   - User attempts invalid move
   - System prevents move and displays subtle indicator
   - No state change occurs
   
3. **Requesting Help**:
   - User types question in chat input
   - AI tutor responds with chess-relevant guidance (API: `POST /api/games/:gameId/chat`)
   - Conversation history updated
   
4. **Game Controls**:
   - User clicks undo: System reverts to previous position (API: `POST /api/games/:gameId/moves` with special undo parameter)
   - User clicks restart: System confirms and resets board (API: `POST /api/games` with same difficulty)
   - User clicks resign: System confirms and ends game (API: `POST /api/games/:gameId/moves` with resignation flag)
   
5. **Navigating Move History**:
   - User clicks on a previous move in history
   - Board updates to show position after that move
   - Clear indicator shows user is viewing history
   - Option to return to current position
   
6. **Accessing Analysis**:
   - User clicks "Analyze" button
   - System redirects to Game Analysis Screen for current game (API: `GET /api/games/:gameId/analysis`)
   
7. **Changing Difficulty**:
   - User adjusts difficulty setting
   - System confirms change (API: `PATCH /api/games/:gameId` with new difficulty)
   - AI opponent behavior adjusts accordingly
   
8. **Changing AI Models**:
   - User selects a different opponent model from dropdown
   - User selects a different tutor model from dropdown
   - System confirms changes (API: `PATCH /api/games/:gameId` with new model parameters)
   - AI behavior changes according to selected models
   
9. **Game Completion**:
   - Game reaches checkmate, stalemate, or resignation
   - System displays game result overlay
   - Options presented: "New Game", "Analyze Game", "Return to Dashboard"

### Game Analysis Screen - `/game/:gameId/analysis`
**Purpose**: Detailed review and learning from completed or in-progress games.

**Layout Elements**:
- Interactive chessboard (larger portion of screen)
- Move history with integrated engine evaluation
- Visualization of alternative moves on board
- Analysis controls (depth setting, engine options)
- Mistake highlights in move list
- Position evaluation graph over time
- Key position explanations from AI tutor
- Navigation controls for moving through the game

**User Flows**:
1. **Navigating the Game**:
   - User clicks moves in move list
   - Board updates to show position
   - Analysis information updates for current position (client-side using data from API: `GET /api/games/:gameId/analysis`)
   
2. **Exploring Alternative Moves**:
   - User selects alternative move suggestion
   - Board shows resulting position from that move
   - System provides evaluation of this alternative line (API: `POST /api/games/:gameId/analysis/variation`)
   - User can continue exploring this variation
   - Clear "Return to Main Line" button
   
3. **Analyzing Mistakes**:
   - User clicks on highlighted mistake in move list
   - System shows explanation of why move was suboptimal (data from API: `GET /api/games/:gameId/analysis`)
   - Alternative moves are presented with evaluations
   
4. **Adjusting Analysis Depth**:
   - User changes analysis depth setting
   - System recalculates analysis at new depth (API: `GET /api/games/:gameId/analysis` with depth parameter)
   - More/fewer variations shown based on depth
   
5. **Returning to Game**:
   - For in-progress games: "Return to Game" button
   - System redirects to Game Screen at current position
   
6. **Exporting Analysis**:
   - User clicks "Export" button
   - System offers PGN or PDF format (API: `GET /api/games/:gameId/export` with format parameter)
   - Analysis is downloaded in selected format

## User Profile & Settings

### Profile Screen - `/profile`
**Purpose**: Display and manage user information and achievements.

**Layout Elements**:
- User information section with:
  - Profile picture/avatar
  - Username/full name
  - Account creation date
  - Skill rating/level
- Statistics section with:
  - Games played (total, wins, losses, draws)
  - Rating progress graph
  - Achievement badges
  - Favorite openings played
- Account settings section with:
  - Edit profile button
  - Change password option
  - Email preferences
  - Subscription details and management

**User Flows**:
1. **Viewing Statistics**:
   - User scrolls through profile statistics (data loaded from API: `GET /api/profile`)
   - Interactive elements show detailed tooltips
   
2. **Editing Profile**:
   - User clicks "Edit Profile" button
   - Inline form appears for editable fields
   - User makes changes and clicks "Save" (API: `PATCH /api/profile`)
   - System updates profile information
   - Success confirmation displayed
   
3. **Changing Password**:
   - User clicks "Change Password" option
   - Modal dialog appears with current/new password fields
   - User completes fields and submits (API: `POST /api/profile/password`)
   - System validates and updates password
   - Success confirmation displayed
   
4. **Managing Subscription**:
   - User clicks on subscription section
   - System displays current plan and options
   - User can upgrade, downgrade, or cancel (API: `PATCH /api/profile/subscription`)
   - Changes confirmed with appropriate dialogs

### Settings Screen - `/settings`
**Purpose**: Configure application preferences and customize experience.

**Layout Elements**:
- Settings categories in left sidebar or tabs
- Main content area showing settings for selected category
- "Save" button for categories with multiple settings
- Categories include:
  - Application Preferences
  - Board Customization
  - Audio Settings
  - Notification Preferences
  - Privacy Controls

**User Flows**:
1. **Application Preferences**:
   - Language selection
   - Theme selection (light/dark)
   - Display options toggles
   - Auto-save frequency
   - User saves changes (API: `PATCH /api/settings` with appPreferences object)
   
2. **Board Customization**:
   - Board color schemes
   - Piece set selection
   - Animation speed
   - Coordinate display toggle
   - Move highlight settings
   - User saves changes (API: `PATCH /api/settings` with boardSettings object)
   
3. **Audio Settings**:
   - Volume controls
   - Sound effects toggles
   - Move confirmation sounds
   - Notification sounds
   - User saves changes (API: `PATCH /api/settings` with audioSettings object)
   
4. **Notification Preferences**:
   - Email notification toggles
   - In-app notification toggles
   - Game reminder settings
   - User saves changes (API: `PATCH /api/settings` with notificationSettings object)
   
5. **Privacy Controls**:
   - Profile visibility options
   - Game history visibility
   - Data usage preferences
   - Account data download/deletion options
   - User saves changes (API: `PATCH /api/settings` with privacySettings object)
   
6. **Saving Changes**:
   - User makes changes to settings
   - User clicks "Save" button
   - System updates preferences (API: `PATCH /api/settings` with changed settings objects)
   - Confirmation message displayed
   - Settings take effect immediately

## Game History

### Game History/Archive - `/history`
**Purpose**: Browse, search, and access past games for review and analysis.

**Layout Elements**:
- Filterable list of past games
- Search bar for finding specific games
- Filter controls (date range, outcome, opponent type)
- Sort options (recent, rating change, duration)
- Game entry contains:
  - Date and time
  - Opponent information
  - Result (win/loss/draw)
  - Opening played
  - Game duration
  - Rating change
  - Preview thumbnail of final position
- Pagination or infinite scroll for large history

**User Flows**:
1. **Browsing Games**:
   - User scrolls through paginated list (API: `GET /api/games/history` with pagination parameters)
   - More games load as user reaches bottom (infinite scroll)
   
2. **Filtering Games**:
   - User selects filter criteria
   - List updates to show matching games (API: `GET /api/games/history` with filter parameters)
   - Clear filters option available
   
3. **Searching Games**:
   - User enters search terms
   - System filters games matching search (API: `GET /api/games/history` with search parameter)
   - No results state with suggestions if needed
   
4. **Viewing Game Details**:
   - User clicks on game entry
   - System redirects to Game Analysis Screen for that game (API: `GET /api/games/:gameId/analysis`)
   
5. **Exporting Games**:
   - User selects one or more games
   - User clicks "Export" button
   - System offers PGN format for download (API: `GET /api/games/export` with selected game IDs)
   - Export confirmation displayed

## Supporting Screens

### Notifications - `/notifications`
**Purpose**: Display system messages, alerts, and updates to the user.

**Layout Elements**:
- List of notifications with:
  - Icon indicating notification type
  - Notification text/content
  - Timestamp
  - Read/unread status indicator
- Filter tabs for all/unread notifications
- "Mark all as read" button
- Clear/dismiss controls for individual notifications

**User Flows**:
1. **Viewing Notifications**:
   - User views chronologically sorted notifications (API: `GET /api/notifications`)
   - Unread notifications are visually highlighted
   - User scrolls through list
   
2. **Filtering Notifications**:
   - User selects tab to filter (All/Unread)
   - List updates to show matching notifications (API: `GET /api/notifications` with filter parameter)
   
3. **Opening Notification**:
   - User clicks on notification
   - System navigates to relevant screen
   - Notification marked as read (API: `PATCH /api/notifications/:id` with read status)
   
4. **Dismissing Notifications**:
   - User clicks "X" on individual notification
   - System removes notification from list (API: `DELETE /api/notifications/:id`)
   - Confirmation if dismissing multiple
   
5. **Marking All Read**:
   - User clicks "Mark all as read"
   - System updates all notifications to read state (API: `PATCH /api/notifications/read-all`)
   - Visual indicators update accordingly

## Development Notes
- All screens will use Tailwind CSS and shadcn/ui
- Responsive design for desktop and tablet only in initial version
- Accessibility considerations throughout
- Progressive disclosure of advanced features based on user skill level

## Future Phases (Not Included in Current Screen List)
1. API development to support application features
2. Separate Admin application
3. Brochure/marketing website
4. Mobile application version
5. OAuth/social login integration (Google, Facebook, etc.)
6. Learning Content:
   - Learning Hub - Centralized learning dashboard with progress tracking and recommendations
   - Structured Lessons - Curated educational content with interactive exercises
   - Position Trainer - Practice specific positions with guided hints
   - Opening Study - Interactive explorer for chess openings
   - Endgame Academy - Focused training on essential endgame positions
7. Social & Multiplayer Features:
   - Human vs. Human games with AI tutor observing and coaching
   - Friend system with following/connections
   - Social profiles with public game history
   - Game sharing and export options
   - Spectator mode for watching ongoing games
   - Leaderboards and rankings
   - Tournament system with brackets and scheduling
   - Chess clubs and study groups
   - Community forums and discussions 