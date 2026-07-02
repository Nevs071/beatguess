\# BeatGuess



\*\*BeatGuess\*\* is a full-stack music quiz web application where players guess songs, artists, or albums from music previews.



The project supports solo quizzes, typed answers, multiple-choice questions, user authentication, score tracking, challenge rooms, room leaderboards, and AI-assisted answer validation.



The main technical goal of BeatGuess is to demonstrate a complete full-stack workflow: frontend, backend, database, authentication, deployment, game logic, asynchronous multiplayer fairness, and AI integration.



\---



\## Table of Contents



\- \[Overview](#overview)

\- \[Live Demo](#live-demo)

\- \[Project Status](#project-status)

\- \[Main Features](#main-features)

\- \[Tech Stack](#tech-stack)

\- \[Architecture](#architecture)

\- \[Repository Structure](#repository-structure)

\- \[Main User Flows](#main-user-flows)

\- \[Challenge Room Fairness Logic](#challenge-room-fairness-logic)

\- \[AI Answer Validation](#ai-answer-validation)

\- \[Database Schema](#database-schema)

\- \[Backend Modules](#backend-modules)

\- \[Frontend Routes](#frontend-routes)

\- \[Security Model](#security-model)

\- \[Environment Variables](#environment-variables)

\- \[Local Development](#local-development)

\- \[Deployment](#deployment)

\- \[What I Learned](#what-i-learned)

\- \[Future Improvements](#future-improvements)

\- \[AI-Assisted Development Note](#ai-assisted-development-note)



\---



\## Overview



BeatGuess is a music quiz platform with two main gameplay modes:



1\. \*\*Solo Quiz\*\*  

&#x20;  A player chooses artists, difficulty, answer mode, and question type, then plays alone and saves their score.



2\. \*\*Challenge Room\*\*  

&#x20;  A player creates a room, shares the code or invite link, and multiple players compete on the same quiz.



The most important multiplayer rule is:



```text

Same room = same questions for every player.

Different room = newly generated quiz.

```



This makes challenge rooms fair while still allowing every new room to feel different.



\---



\## Live Demo



Frontend:



```text

https://beatguess-rho.vercel.app

```



Backend:



```text

https://beatguess.onrender.com

```



\---



\## Project Status



BeatGuess is currently in \*\*beta development\*\*.



Core features already implemented:



\- Solo quiz mode

\- Multiple-choice mode

\- Typed-answer mode

\- Song / artist / album / mixed question types

\- Easy / medium / hard difficulty

\- Challenge room creation

\- Fixed questions per challenge room

\- Room code and invite link sharing

\- Room leaderboard

\- Global and personal score tracking

\- Auth0 authentication

\- PostgreSQL database persistence

\- OpenAI-assisted typed answer validation

\- Vercel frontend deployment

\- Render backend deployment



Current focus:



\- Better mobile polish

\- Cleaner error messages

\- Stronger result screen UX

\- Better leaderboard design

\- Code ownership and documentation



\---



\## Main Features



\### Solo Quiz



Players can configure a custom quiz by choosing:



\- Artists

\- Number of questions

\- Difficulty

\- Answer mode

\- Question type



Supported difficulties:



```text

Easy

Medium

Hard

```



Supported answer modes:



```text

Multiple choice

Typed answer

```



Supported question types:



```text

Song title

Artist name

Album name

Mixed

```



\---



\### Challenge Rooms



Challenge rooms allow asynchronous multiplayer.



A player can:



\- Create a room

\- Generate a room code

\- Copy an invite link

\- Share the room with friends

\- Let everyone play the same quiz

\- Compare scores on a room leaderboard



Important behavior:



```text

Room A with Damso → one fixed quiz for everyone in Room A.

Room B with Damso → a different fixed quiz, even with the same artist.

```



This is done by saving the generated quiz inside the database as `quiz\_payload`.



\---



\### AI-Assisted Typed Answer Validation



Typing mode is improved with a hybrid answer validation system.



The system checks:



\- Uppercase/lowercase differences

\- Accents

\- Punctuation

\- Small typos

\- Featuring artists

\- Remix / live / remastered text

\- Ambiguous answers with optional AI fallback



Examples:



```text

Official: Mwaka Moon (feat. Damso)

User: mwaka moon

Result: accepted

```



```text

Official: Dégaine

User: degaine

Result: accepted

```



```text

Official: Blinding Lights

User: blinding ligths

Result: accepted as close typo

```



AI is only used when the rule-based validator is unsure.



\---



\## Tech Stack



\### Frontend



\- Next.js

\- React

\- TypeScript

\- Tailwind CSS

\- Next.js App Router

\- Vercel



\### Backend



\- NestJS

\- TypeScript

\- PostgreSQL

\- Neon

\- Render



\### Authentication



\- Auth0



\### AI



\- OpenAI API

\- Rule-based validation

\- Fuzzy matching

\- AI fallback for ambiguous typed answers



\### Music Data



\- Deezer artist search

\- Deezer track preview data



\---



\## Architecture



```mermaid

flowchart TD

&#x20;   User\[User / Player]



&#x20;   User --> Web\[Next.js Frontend<br/>apps/web]



&#x20;   Web --> NextApi\[Next.js API Routes<br/>apps/web/app/api]



&#x20;   NextApi --> Backend\[NestJS Backend<br/>apps/api]



&#x20;   Backend --> Deezer\[Deezer API<br/>Artist + Track Data]



&#x20;   Backend --> DB\[(Neon PostgreSQL<br/>Scores + Rooms + Leaderboards)]



&#x20;   Backend --> OpenAI\[OpenAI API<br/>AI Answer Validation]



&#x20;   Web --> Auth0\[Auth0 Login]



&#x20;   NextApi --> Auth0



&#x20;   Backend --> Render\[Render Deployment]

&#x20;   Web --> Vercel\[Vercel Deployment]

```



\---



\## Repository Structure



```text

beatguess/

&#x20; apps/

&#x20;   web/

&#x20;     app/

&#x20;       page.tsx

&#x20;       play/

&#x20;       quiz/

&#x20;         custom-mix/

&#x20;         play/

&#x20;       challenge/

&#x20;         page.tsx

&#x20;         \[roomCode]/

&#x20;       scores/

&#x20;       account/

&#x20;       api/

&#x20;     components/

&#x20;     lib/



&#x20;   api/

&#x20;     src/

&#x20;       music/

&#x20;       quiz/

&#x20;       scores/

&#x20;       challenges/

&#x20;       answer-validation/

&#x20;       database/

&#x20;       app.module.ts



&#x20; docs/

&#x20; README.md

```



\---



\## Main User Flows



\### Solo Quiz Flow



```mermaid

flowchart TD

&#x20;   A\[Home Page] --> B\[Play Mode Selection]

&#x20;   B --> C\[Solo Quiz]

&#x20;   C --> D\[Choose Artists]

&#x20;   D --> E\[Choose Settings]

&#x20;   E --> F\[Start Quiz]

&#x20;   F --> G\[Backend Generates Quiz]

&#x20;   G --> H\[Player Answers Questions]

&#x20;   H --> I\[Result Screen]

&#x20;   I --> J\[Save Score]

&#x20;   J --> K\[Scores Page]

```



Solo mode generates a fresh quiz when the user starts playing.



\---



\### Challenge Room Flow



```mermaid

flowchart TD

&#x20;   A\[Home Page] --> B\[Play Mode Selection]

&#x20;   B --> C\[Challenge Room]

&#x20;   C --> D\[Choose Artists + Settings]

&#x20;   D --> E\[Generate Quiz Once]

&#x20;   E --> F\[Create Room]

&#x20;   F --> G\[Save quiz\_payload in Database]

&#x20;   G --> H\[Show Room Code + Invite Link]

&#x20;   H --> I\[Players Join Room]

&#x20;   I --> J\[Start Challenge]

&#x20;   J --> K\[Load Saved quiz\_payload]

&#x20;   K --> L\[Each Player Plays Same Questions]

&#x20;   L --> M\[Save Room Scores]

&#x20;   M --> N\[Room Leaderboard]

```



Challenge mode does not regenerate the quiz for every player.  

It loads the saved `quiz\_payload` from the room.



\---



\## Challenge Room Fairness Logic



The main fairness problem was:



```text

If every player generates a quiz when they click Start Challenge,

then every player may receive different questions.

```



The solution:



```text

Generate the quiz once when the room is created.

Save that generated quiz in challenge\_rooms.quiz\_payload.

When players start the challenge, load the saved quiz\_payload.

```



```mermaid

flowchart LR

&#x20;   A\[Create Room] --> B\[Generate Quiz Once]

&#x20;   B --> C\[Save quiz\_payload]

&#x20;   C --> D\[Player 1 Loads Same Payload]

&#x20;   C --> E\[Player 2 Loads Same Payload]

&#x20;   C --> F\[Player 3 Loads Same Payload]

```



Result:



```text

Same room = same questions.

New room = new generated questions.

```



This makes asynchronous multiplayer fair.



\---



\## AI Answer Validation



Typed answers should not fail because of small human mistakes.



The validation system uses a hybrid approach:



```mermaid

flowchart TD

&#x20;   A\[User Types Answer] --> B\[Normalize Answer]

&#x20;   B --> C\[Remove Accents + Punctuation]

&#x20;   C --> D\[Remove feat/remix/live/remastered text]

&#x20;   D --> E\[Rule-Based Exact Match?]



&#x20;   E -->|Yes| F\[Accept Answer]

&#x20;   E -->|No| G\[Fuzzy Typo Matching]



&#x20;   G -->|Clearly Close| F

&#x20;   G -->|Clearly Wrong| H\[Reject Answer]

&#x20;   G -->|Ambiguous| I{AI Enabled?}



&#x20;   I -->|No| H

&#x20;   I -->|Yes| J\[OpenAI Judge]

&#x20;   J --> K\[Return Correct / Wrong + Confidence]

```



The system is designed this way because:



\- Rule-based checks are fast

\- Fuzzy matching solves common typos

\- AI is only used when needed

\- Cost stays low

\- The API key remains protected in the backend



\---



\## Database Schema



```mermaid

erDiagram

&#x20;   SCORES {

&#x20;       uuid id

&#x20;       text auth0\_sub

&#x20;       text player\_name

&#x20;       text player\_email

&#x20;       int score

&#x20;       int total\_questions

&#x20;       int correct\_answers

&#x20;       int accuracy

&#x20;       text difficulty

&#x20;       text answer\_mode

&#x20;       text typed\_answer\_kind

&#x20;       text\_array artists

&#x20;       timestamptz created\_at

&#x20;   }



&#x20;   CHALLENGE\_ROOMS {

&#x20;       uuid id

&#x20;       text room\_code

&#x20;       text created\_by\_auth0\_sub

&#x20;       text created\_by\_name

&#x20;       text created\_by\_email

&#x20;       text\_array artist\_ids

&#x20;       text difficulty

&#x20;       int question\_amount

&#x20;       text answer\_mode

&#x20;       text typed\_answer\_kind

&#x20;       jsonb quiz\_payload

&#x20;       timestamptz created\_at

&#x20;   }



&#x20;   CHALLENGE\_SCORES {

&#x20;       uuid id

&#x20;       text room\_code

&#x20;       text auth0\_sub

&#x20;       text player\_name

&#x20;       text player\_email

&#x20;       text player\_picture

&#x20;       int score

&#x20;       int total\_questions

&#x20;       int correct\_answers

&#x20;       int accuracy

&#x20;       timestamptz created\_at

&#x20;   }



&#x20;   CHALLENGE\_ROOMS ||--o{ CHALLENGE\_SCORES : has

```



\---



\## Database Tables



\### `scores`



Stores general user scores.



Important fields:



```text

id

auth0\_sub

player\_name

player\_email

score

total\_questions

correct\_answers

accuracy

difficulty

answer\_mode

typed\_answer\_kind

artists

created\_at

```



\---



\### `challenge\_rooms`



Stores challenge room data.



Important fields:



```text

id

room\_code

created\_by\_auth0\_sub

created\_by\_name

created\_by\_email

artist\_ids

difficulty

question\_amount

answer\_mode

typed\_answer\_kind

quiz\_payload

created\_at

```



The most important field is:



```text

quiz\_payload

```



It stores the generated questions for the room.



\---



\### `challenge\_scores`



Stores scores for a specific room.



Important fields:



```text

id

room\_code

auth0\_sub

player\_name

player\_email

player\_picture

score

total\_questions

correct\_answers

accuracy

created\_at

```



\---



\## Backend Modules



\### Music Module



Path:



```text

apps/api/src/music/

```



Role:



\- Search artists

\- Fetch track data

\- Provide preview URLs

\- Connect with Deezer data



\---



\### Quiz Module



Path:



```text

apps/api/src/quiz/

```



Role:



\- Generate quiz questions

\- Build multiple-choice options

\- Support typed-answer mode

\- Support song / artist / album / mixed questions

\- Apply difficulty settings



\---



\### Scores Module



Path:



```text

apps/api/src/scores/

```



Role:



\- Save user scores

\- Load personal score history

\- Load global leaderboard



\---



\### Challenges Module



Path:



```text

apps/api/src/challenges/

```



Role:



\- Create challenge rooms

\- Generate room codes

\- Store room settings

\- Store fixed `quiz\_payload`

\- Load room data

\- Save room scores

\- Load room leaderboard



\---



\### Answer Validation Module



Path:



```text

apps/api/src/answer-validation/

```



Role:



\- Validate typed answers

\- Normalize text

\- Ignore accents and punctuation

\- Remove featuring/remix/live/remastered text

\- Accept small typos

\- Use OpenAI only for ambiguous answers



\---



\### Database Module



Path:



```text

apps/api/src/database/

```



Role:



\- Connect to Neon PostgreSQL

\- Provide database query access to backend services



\---



\## Frontend Routes



\### Home



```text

/

```



Main landing page.



\---



\### Play Mode Selection



```text

/play

```



Lets the user choose:



```text

Solo Quiz

Challenge Room

```



\---



\### Solo Quiz Setup



```text

/quiz/custom-mix

```



Used to configure a solo quiz.



\---



\### Quiz Play Page



```text

/quiz/play

```



Main gameplay page.



It supports two flows:



```text

Solo:

Uses artist IDs and settings in the URL.



Challenge:

Uses challengeRoom=ROOMCODE and loads the room quiz\_payload.

```



Example solo URL:



```text

/quiz/play?artists=123,456\&difficulty=easy\&amount=10\&answerMode=mcq\&typedAnswerKind=song

```



Example challenge URL:



```text

/quiz/play?challengeRoom=WQUD27

```



\---



\### Challenge Setup



```text

/challenge

```



Used to:



\- Create rooms

\- Join rooms by code

\- Generate the fixed quiz

\- Display the room code

\- Copy invite link



\---



\### Challenge Room



```text

/challenge/\[roomCode]

```



Used to:



\- Show room information

\- Start the challenge

\- Copy invite link

\- Copy room code

\- Display room leaderboard



\---



\### Scores



```text

/scores

```



Shows score history and leaderboard data.



\---



\### Account



```text

/account

```



Shows user profile and personal score information.



\---



\## Security Model



Private backend actions are protected with an internal API secret.



```mermaid

sequenceDiagram

&#x20;   participant User

&#x20;   participant Frontend as Next.js Page

&#x20;   participant ApiRoute as Next.js API Route

&#x20;   participant Backend as NestJS Backend

&#x20;   participant DB as PostgreSQL



&#x20;   User->>Frontend: Click create challenge

&#x20;   Frontend->>ApiRoute: POST /api/challenges

&#x20;   ApiRoute->>ApiRoute: Read Auth0 session

&#x20;   ApiRoute->>Backend: POST /challenges with INTERNAL\_API\_SECRET

&#x20;   Backend->>Backend: Validate secret

&#x20;   Backend->>DB: Insert challenge room

&#x20;   DB-->>Backend: Room data

&#x20;   Backend-->>ApiRoute: Created room

&#x20;   ApiRoute-->>Frontend: Room code

&#x20;   Frontend-->>User: Show room code + invite link

```



The frontend does not expose the backend secret.



OpenAI API keys are stored only in the backend environment.



\---



\## Environment Variables



\### Backend



File:



```text

apps/api/.env

```



Example:



```env

DATABASE\_URL=postgresql://...

INTERNAL\_API\_SECRET=your\_internal\_secret



OPENAI\_API\_KEY=your\_openai\_api\_key

AI\_VALIDATION\_ENABLED=true

AI\_VALIDATION\_MODEL=gpt-5-nano

```



For development without AI billing:



```env

AI\_VALIDATION\_ENABLED=false

```



\---



\### Frontend



File:



```text

apps/web/.env.local

```



Example local configuration:



```env

NEXT\_PUBLIC\_API\_URL=http://localhost:4000



AUTH0\_DOMAIN=...

AUTH0\_CLIENT\_ID=...

AUTH0\_CLIENT\_SECRET=...

AUTH0\_SECRET=...

APP\_BASE\_URL=http://localhost:3000



INTERNAL\_API\_SECRET=your\_internal\_secret

```



Production frontend configuration:



```env

NEXT\_PUBLIC\_API\_URL=https://beatguess.onrender.com

APP\_BASE\_URL=https://beatguess-rho.vercel.app

```



Important:



```text

Never commit .env files.

Never expose OPENAI\_API\_KEY in the frontend.

```



\---



\## Local Development



\### Install Dependencies



From each app folder:



```powershell

cd apps/api

pnpm install

```



```powershell

cd apps/web

pnpm install

```



\---



\### Start Backend



```powershell

cd apps/api

pnpm start:dev

```



Backend runs on:



```text

http://localhost:4000

```



\---



\### Start Frontend



```powershell

cd apps/web

pnpm dev

```



Frontend runs on:



```text

http://localhost:3000

```



\---



\## Build Commands



\### Backend Build



```powershell

cd apps/api

pnpm build

```



\---



\### Frontend Build



```powershell

cd apps/web

pnpm build

```



\---



\## Deployment



\### Frontend Deployment



Platform:



```text

Vercel

```



Settings:



```text

Root Directory: apps/web

Framework Preset: Next.js

Build Command: npm run build

Output Directory: leave empty

```



\---



\### Backend Deployment



Platform:



```text

Render

```



Settings:



```text

Root Directory: apps/api

Build Command: npm install --include=dev \&\& npm run build

Start Command: npm run start:prod

```



Important backend environment variables on Render:



```env

DATABASE\_URL=...

INTERNAL\_API\_SECRET=...

FRONTEND\_URL=https://beatguess-rho.vercel.app

OPENAI\_API\_KEY=...

AI\_VALIDATION\_ENABLED=true

AI\_VALIDATION\_MODEL=gpt-5-nano

```



\---



\## Current Technical Highlights



BeatGuess demonstrates:



\- Full-stack TypeScript development

\- Next.js App Router

\- NestJS backend architecture

\- PostgreSQL database modeling

\- Auth0 authentication

\- Secure API routing

\- Game state management

\- Challenge room logic

\- Room-based leaderboard design

\- AI-assisted answer validation

\- Frontend/backend deployment

\- Monorepo project structure



\---



\## What I Learned



Through this project, I practiced:



\- Building a full-stack web app

\- Designing frontend routes

\- Creating backend modules

\- Connecting a PostgreSQL database

\- Implementing authentication

\- Building score and leaderboard systems

\- Handling environment variables

\- Debugging local and deployed environments

\- Designing fair asynchronous multiplayer rooms

\- Integrating AI as a backend feature

\- Using AI-assisted development while learning to understand the codebase



\---



\## Future Improvements



Planned improvements:



\- Better mobile responsiveness

\- Cleaner error messages

\- More polished result screen

\- Better room leaderboard design

\- “Play again in this room” button

\- Daily challenge mode

\- Practice mode

\- Adventure mode

\- More detailed AI answer explanations

\- Testing with Jest / Playwright

\- Admin dashboard for rooms and scores

\- More complete documentation with screenshots



\---



\## AI-Assisted Development Note



This project was built with an AI-assisted development workflow.



AI was used as a coding and debugging assistant.  

The product direction, testing, feature decisions, and final integration were guided by the developer.



Important product and engineering decisions include:



\- Building solo and challenge modes

\- Making challenge rooms fair with fixed `quiz\_payload`

\- Separating global scores from room leaderboards

\- Adding tolerant typed-answer validation

\- Adding AI fallback only for ambiguous typed answers

\- Deploying frontend and backend separately

\- Protecting backend routes with an internal secret



The next personal objective is code ownership: understanding each important file, function, and implementation decision well enough to explain and defend the project in a technical discussion.



\---



\## Core Technical Idea



The strongest technical feature of BeatGuess is the challenge room system:



```text

Every new room generates a unique quiz.

Every player inside the same room receives the same saved questions.

```



This turns BeatGuess from a simple quiz app into a fair asynchronous multiplayer game.



