# Coursit — Entity Relationship Diagram (ERD)

## Database: PostgreSQL 16 | ORM: Prisma

---

## Tables Overview

| # | Table | Purpose | Records (seed) |
|---|-------|---------|---------------|
| 1 | Branch | Organizational branches | 3 |
| 2 | Team | Teams within branches | 5 |
| 3 | User | All system users (4 roles) | 19 |
| 4 | Course | Course definitions (3 types) | 8 |
| 5 | CourseInstance | Course iterations/cycles | 5 |
| 6 | CoursePhase | Gantt timeline phases | 9 |
| 7 | CommandCandidacy | Management candidacy applications | 3 |
| 8 | CourseRegistration | Advanced course enrollments | 5 |
| 9 | FormTemplate | Dynamic form definitions per course | 0 |
| 10 | InfoPage | Static content pages (Markdown) | 2 |
| 11 | EventLog | Audit trail of all system actions | dynamic |

---

## Relationships Diagram

```
Branch (1) ─────┬──── (N) Team (1) ──── (N) User
                │                           │
                └──── (N) User              │
                                            │
                        ┌───────────────────┤
                        │                   │
                        ▼                   ▼
              CommandCandidacy        CourseRegistration
              (candidate FK)          (user FK)
              (submittedBy FK)        (tlApprovedBy FK)
              (reviewedBy FK)         (coordApprovedBy FK)
                        │             (bisApprovedBy FK)
                        │                   │
                        └────────┬──────────┘
                                 │
                                 ▼
                          CourseInstance
                                 │
                          ┌──────┴──────┐
                          │             │
                          ▼             ▼
                     CoursePhase    Course (1) ──── (N) FormTemplate
                     (cascade del)

                     EventLog ──── (N:1) ──── User

                     InfoPage (standalone)
```

---

## Enums

### UserRole
| Value | Hebrew | Description |
|-------|--------|-------------|
| `BIS_CDR` | מנהל מערכת | Full admin access, final approvals |
| `BRANCH_COORD` | רכז ענפי | Branch-scoped approvals |
| `TEAM_LEADER` | ראש צוות | Team-scoped, submits candidacies |
| `TRAINEE` | משתתף | Self-registration, view own status |

### CourseType
| Value | Hebrew | Description |
|-------|--------|-------------|
| `FOUNDATION` | יסוד | Core courses with candidacy flow |
| `ADVANCED` | מתקדם | Self-enrollment with approval chain |
| `LEADERSHIP` | ניהול | Courses for team leaders/managers |

### CourseInstanceStatus
| Value | Description |
|-------|-------------|
| `DRAFT` | Not visible to users |
| `OPEN` | Open for registration |
| `IN_PROGRESS` | Currently running |
| `COMPLETED` | Finished |

### PhaseType (Gantt)
| Value | Hebrew |
|-------|--------|
| `CANDIDACY_SUBMISSION` | הגשת מועמדות |
| `TRYOUTS` | מיונים |
| `COMMANDER_COURSE` | הכשרה |
| `STAFF_PREP` | הכנת צוות |
| `COURSE` | הקורס |
| `SUMMARY_WEEK` | סיכומים |
| `OTHER` | אחר |

### CandidacyStatus
```
PENDING → COORD_REVIEWED → APPROVED
                         → REJECTED
```

### RegistrationStatus
```
PENDING_TL → PENDING_COORD → PENDING_BIS → APPROVED
                                          → REJECTED
(rejection possible at any stage)
```

---

## Table Details

### Branch
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| name | VarChar(128) | |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

### Team
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| name | VarChar(128) | |
| branchId | Int | FK → Branch.id |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

### User
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| uniqueId | VarChar(64) | unique |
| name | VarChar(128) | |
| role | UserRole | enum |
| teamId | Int? | FK → Team.id (nullable) |
| branchId | Int? | FK → Branch.id (nullable) |
| isActive | Boolean | default true |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

**Relations:** candidaciesAsCandidate, candidaciesAsSubmitter, candidacyReviews, registrations, tlApprovals, coordApprovals, bisApprovals, eventLogs

### Course
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| name | VarChar(256) | |
| description | Text | |
| type | CourseType | enum |
| requirements | Text? | nullable |
| gmushHours | Int? | nullable |
| location | VarChar(256)? | nullable |
| isPublished | Boolean | default false |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

**Relations:** instances[], formTemplates[]

### CourseInstance
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| courseId | Int | FK → Course.id |
| name | VarChar(128) | e.g. "מחזור 42" |
| startDate | DateTime | |
| endDate | DateTime | |
| status | CourseInstanceStatus | default DRAFT |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

**Relations:** phases[], candidacies[], registrations[]

### CoursePhase
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| courseInstanceId | Int | FK → CourseInstance.id (cascade delete) |
| name | VarChar(128) | |
| phaseType | PhaseType | enum |
| startDate | DateTime | |
| endDate | DateTime | |
| description | Text? | nullable |
| sortOrder | Int | default 0 |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

### CommandCandidacy
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| courseInstanceId | Int | FK → CourseInstance.id |
| candidateId | Int | FK → User.id |
| submittedById | Int | FK → User.id |
| status | CandidacyStatus | default PENDING |
| motivation | Text? | |
| commanderNotes | Text? | |
| formData | Json? | |
| reviewedById | Int? | FK → User.id |
| reviewNotes | Text? | |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

**Unique:** [courseInstanceId, candidateId]

### CourseRegistration
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| courseInstanceId | Int | FK → CourseInstance.id |
| userId | Int | FK → User.id |
| status | RegistrationStatus | default PENDING_TL |
| formData | Json? | |
| tlApprovedById | Int? | FK → User.id |
| tlApprovedAt | DateTime? | |
| tlNotes | Text? | |
| coordApprovedById | Int? | FK → User.id |
| coordApprovedAt | DateTime? | |
| coordNotes | Text? | |
| coordPriority | Int? | |
| bisApprovedById | Int? | FK → User.id |
| bisApprovedAt | DateTime? | |
| bisNotes | Text? | |
| rejectionReason | Text? | |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

**Unique:** [courseInstanceId, userId]

### FormTemplate
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| courseId | Int | FK → Course.id |
| name | VarChar(128) | |
| fields | Json | schema definition |
| isRequired | Boolean | default true |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

### InfoPage
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| slug | VarChar(128) | unique |
| title | VarChar(256) | |
| content | Text | Markdown |
| sortOrder | Int | default 0 |
| isPublished | Boolean | default false |
| createdAt | DateTime | default now() |
| updatedAt | DateTime | auto |

### EventLog
| Column | Type | Constraints |
|--------|------|-------------|
| id | Int | PK, auto-increment |
| userId | Int | FK → User.id |
| action | VarChar(64) | LOGIN, SUBMIT, APPROVE, REJECT, REGISTER, CREATE, UPDATE, DELETE |
| entityType | VarChar(64) | USER, COURSE, CANDIDACY, REGISTRATION, etc. |
| entityId | Int? | nullable |
| details | Json? | before/after state |
| createdAt | DateTime | default now() |

**Indexes:** userId, [entityType, entityId], createdAt

---

## Approval Flows

### Foundation Course — Candidacy
```
Team Leader submits → PENDING
                        ↓
Branch Coordinator reviews → COORD_REVIEWED
                        ↓
Admin approves → APPROVED / REJECTED
```

### Advanced Course — Registration
```
Trainee self-registers → PENDING_TL
                          ↓
Team Leader approves → PENDING_COORD
                          ↓
Branch Coordinator prioritizes → PENDING_BIS
                          ↓
Admin final approval → APPROVED / REJECTED
```
