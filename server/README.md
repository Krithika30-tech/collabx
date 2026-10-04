# CollabX: Project & Hackathon Team Builder

A MERN stack web application that helps students find teammates for projects and hackathons using skill-based matching, with team management, task tracking and real-time chat.

Built for **JGE2542 – MERN Stack Development Laboratory**, Jerusalem College of Engineering (2026–27).

## Features

- Secure registration and login (JWT authentication, bcrypt password hashing)
- Student profiles with skills, interests, availability and experience
- Create projects and search or filter them by keyword, category, skill and status
- Join requests with owner approval, role assignment and team management
- Task tracking with assignees, priority, due dates and status
- Compatibility matching: ranked teammates for a project, and ranked projects for a student
- Real-time team chat with Socket.IO (members only, history saved)
- Student discovery with filters (skill, experience, availability)
- Role-based access control and server-side authorization checks

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB with Mongoose |
| Backend | Node.js, Express.js |
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Real-time | Socket.IO |
| Security | JWT, bcryptjs |

## Compatibility Score

Each match is scored out of 100:

| Factor | Weight |
|---|---|
| Skills (share of required skills the student has) | 50 |
| Interests | 20 |
| Availability | 15 |
| Experience level | 15 |

## Getting Started

**Requirements:** Node.js (LTS) and MongoDB running locally.

```bash
# 1. Backend
cd server
npm install
# copy .env.example to .env and edit the values
npm run dev          # http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev          # http://localhost:5173
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Current user |
| GET / PUT | `/api/users/:id` | View or update a profile |
| GET | `/api/users` | Search students |
| GET / POST | `/api/projects` | List or create projects |
| GET / PUT | `/api/projects/:id` | View or update a project |
| POST | `/api/projects/:id/join` | Request to join |
| PUT | `/api/projects/:id/requests/:userId` | Accept or reject a request |
| PUT / DELETE | `/api/projects/:id/members/:userId` | Change a role or remove a member |
| GET / POST | `/api/projects/:id/tasks` | List or create tasks |
| PUT | `/api/tasks/:id` | Update a task |
| GET | `/api/projects/:id/messages` | Chat history |
| GET | `/api/matches` | Ranked projects, or teammates with `?projectId=` |

## Author

Krithika