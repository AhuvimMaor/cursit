# ביס 60 — אפיון טכני: מערכת ניהול הדרכה

## סקירה
מערכת ניהול הדרכה, קורסים והכשרות עבור ביס 60.
מטרה: שימור ידע במקום מרוכז ונגיש למפקדי ומשרתי המרכז.

---

## 1. הרשאות ותפקידים (Permissions Matrix)

| תפקיד | Role Enum | תצוגה (Read) | פעולות (Execute) | היקף גישה |
|--------|-----------|-------------|-----------------|-----------|
| מפקד ביס | `BIS_CDR` | הכל | אישור סופי, ניהול משתמשים, עריכת תוכן | מרכז (כלל הענפים) |
| קה"ד ענפי | `BRANCH_COORD` | קטלוג, גאנט, רישומי הענף | תיעדוף ואישור רישומים מתקדמים | ענפי |
| ראש צוות | `TEAM_LEADER` | קורסי יסוד, גאנט, צוות | הגשת מועמדות לפיקוד (לקורסי יסוד) | צוותי |
| חניך | `TRAINEE` | קטלוג קורסים, גאנט אישי | הגשת בקשת רישום לקורס מתקדם | אישי |

---

## 2. מודל נתונים (Database Schema)

### 2.1 ERD — דיאגרמת קשרים

```
Branch (1) ──── (N) Team (1) ──── (N) User
                                       │
                                       ├── (N) CommandCandidacy (as candidate)
                                       ├── (N) CommandCandidacy (as submitter)
                                       ├── (N) CourseRegistration (as registrant)
                                       ├── (N) CourseRegistration (as coord approver)
                                       └── (N) CourseRegistration (as bis approver)

Course (1) ──── (N) CourseInstance (1) ──── (N) CoursePhase
  │                      │
  │                      ├── (N) CommandCandidacy
  │                      └── (N) CourseRegistration
  │
  └── (N) FormTemplate

InfoPage (standalone)
```

### 2.2 טבלאות

#### `Branch` — ענף
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| name | String(128) | שם הענף |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

#### `Team` — צוות
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| name | String(128) | שם הצוות |
| branchId | Int FK | → Branch.id |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

#### `User` — משתמש
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| uniqueId | String(64) | unique, מ"א / ת"ז |
| name | String(128) | שם מלא |
| role | Enum | `BIS_CDR`, `BRANCH_COORD`, `TEAM_LEADER`, `TRAINEE` |
| teamId | Int FK? | → Team.id (nullable for BIS_CDR) |
| branchId | Int FK? | → Branch.id (nullable for BIS_CDR) |
| isActive | Boolean | default true |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

> User.branchId — שייכות ענפית ישירה. עבור BRANCH_COORD זה הענף שלו.
> User.teamId — שייכות צוותית. עבור TEAM_LEADER זה הצוות שלו.
> BIS_CDR — ללא שייכות ענפית/צוותית (null).

#### `Course` — הגדרת קורס
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| name | String(256) | שם הקורס |
| description | Text | רקע קצר |
| type | Enum | `FOUNDATION`, `ADVANCED` |
| requirements | Text? | דרישות / תנאי קבלה |
| gmushHours | Int? | שעות גמו"ש |
| location | String(256)? | מיקום |
| isPublished | Boolean | default false |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

**Course Types:**
- `FOUNDATION` — קורס יסוד. מיונים לפיקוד, גאנט
- `ADVANCED` — קורס מתקדם. רישום עצמי + שרשרת אישורים

#### `CourseInstance` — מחזור קורס
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| courseId | Int FK | → Course.id |
| name | String(128) | e.g. "מחזור 42" |
| startDate | DateTime | תאריך התחלה |
| endDate | DateTime | תאריך סיום |
| status | Enum | `DRAFT`, `OPEN`, `IN_PROGRESS`, `COMPLETED` |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

#### `CoursePhase` — שלב בגאנט
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| courseInstanceId | Int FK | → CourseInstance.id (cascade delete) |
| name | String(128) | שם השלב |
| phaseType | Enum | `CANDIDACY_SUBMISSION`, `TRYOUTS`, `COMMANDER_COURSE`, `STAFF_PREP`, `COURSE`, `SUMMARY_WEEK`, `OTHER` |
| startDate | DateTime | תחילת השלב |
| endDate | DateTime | סוף השלב |
| description | Text? | הסבר נוסף |
| sortOrder | Int | סדר תצוגה |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

#### `CommandCandidacy` — הגשת מועמדות לפיקוד (קורסי יסוד)
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| courseInstanceId | Int FK | → CourseInstance.id |
| candidateId | Int FK | → User.id (החניך) |
| submittedById | Int FK | → User.id (הרש"צ המגיש) |
| status | Enum | `PENDING`, `COORD_REVIEWED`, `APPROVED`, `REJECTED` |
| motivation | Text? | מכתב מוטיבציה |
| commanderNotes | Text? | הערות הרש"צ |
| formData | JSON? | נתוני טפסים |
| reviewedById | Int FK? | → User.id (מפקד ביס שבדק) |
| reviewNotes | Text? | הערות הבודק |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

> `@@unique([courseInstanceId, candidateId])` — חניך יכול להיות מועמד פעם אחת למחזור.
> רק `TEAM_LEADER` ומעלה מגישים. חניך לא מגיש על עצמו.

**Candidacy Flow:**
```
PENDING → רש"צ הגיש, ממתין לבדיקת קה"ד
COORD_REVIEWED → קה"ד עבר ותיעדף, ממתין לאישור מפקד ביס
APPROVED → מפקד ביס אישר
REJECTED → נדחה (בכל שלב)
```

#### `CourseRegistration` — רישום לקורס מתקדם
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| courseInstanceId | Int FK | → CourseInstance.id |
| userId | Int FK | → User.id (הנרשם) |
| status | Enum | `PENDING_COORD`, `PENDING_BIS`, `APPROVED`, `REJECTED` |
| formData | JSON? | נתוני טפסים |
| coordApprovedById | Int FK? | → User.id (קה"ד שאישר) |
| coordApprovedAt | DateTime? | |
| coordNotes | Text? | |
| coordPriority | Int? | תיעדוף ענפי (1 = הכי גבוה) |
| bisApprovedById | Int FK? | → User.id (מפקד ביס) |
| bisApprovedAt | DateTime? | |
| bisNotes | Text? | |
| rejectionReason | Text? | |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

> `@@unique([courseInstanceId, userId])` — חניך נרשם פעם אחת למחזור.

**Registration Flow (2 שלבים):**
```
PENDING_COORD → חניך הגיש, ממתין לתיעדוף קה"ד ענפי
PENDING_BIS   → קה"ד תיעדף ואישר, ממתין לאישור מפקד ביס
APPROVED      → אושר סופית
REJECTED      → נדחה (בכל שלב)
```

#### `FormTemplate` — תבנית טופס
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| courseId | Int FK | → Course.id |
| name | String(128) | שם הטופס |
| fields | JSON | הגדרת שדות |
| isRequired | Boolean | default true |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

#### `InfoPage` — דף מידע
| Column | Type | Notes |
|--------|------|-------|
| id | Int PK | auto increment |
| slug | String(128) | unique, URL identifier |
| title | String(256) | כותרת |
| content | Text | תוכן (Markdown) |
| sortOrder | Int | default 0 |
| isPublished | Boolean | default false |
| createdAt | DateTime | default now |
| updatedAt | DateTime | auto |

---

## 3. API Endpoints

### 3.1 Auth
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | All | התחברות |
| POST | `/api/auth/logout` | All | התנתקות |
| GET | `/api/auth/me` | All | פרטי המשתמש המחובר |

### 3.2 Users
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/users` | BIS_CDR | כל המשתמשים |
| POST | `/api/users` | BIS_CDR | יצירת משתמש |
| PATCH | `/api/users/:id` | BIS_CDR | עדכון משתמש |

### 3.3 Branches & Teams
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/branches` | All | רשימת ענפים |
| POST | `/api/branches` | BIS_CDR | יצירת ענף |
| GET | `/api/branches/:id/teams` | All | צוותות בענף |
| POST | `/api/teams` | BIS_CDR | יצירת צוות |

### 3.4 Courses (קטלוג)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/courses` | All | קטלוג (published only for non-BIS_CDR) |
| GET | `/api/courses/:id` | All | פרטי קורס |
| POST | `/api/courses` | BIS_CDR | יצירת קורס |
| PATCH | `/api/courses/:id` | BIS_CDR | עדכון קורס |

### 3.5 Course Instances
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/courses/:id/instances` | All | מחזורים |
| POST | `/api/courses/:id/instances` | BIS_CDR | יצירת מחזור |
| PATCH | `/api/instances/:id` | BIS_CDR | עדכון מחזור |

### 3.6 Gantt
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/gantt` | All | כל השלבים (מחזורים פעילים) |
| GET | `/api/instances/:id/phases` | All | שלבי מחזור ספציפי |
| POST | `/api/instances/:id/phases` | BIS_CDR | הוספת שלב |
| PATCH | `/api/phases/:id` | BIS_CDR | עדכון שלב |
| DELETE | `/api/phases/:id` | BIS_CDR | מחיקת שלב |

### 3.7 Command Candidacy (מועמדות לפיקוד)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/candidacy/submit` | TEAM_LEADER | הגשת מועמדות לפיקוד |
| GET | `/api/candidacy/my-submissions` | TEAM_LEADER | המועמדויות שהגשתי |
| GET | `/api/candidacy/branch` | BRANCH_COORD | מועמדויות הענף (לתיעדוף) |
| PATCH | `/api/candidacy/:id/coord-review` | BRANCH_COORD | סימון כנבדק + תיעדוף |
| GET | `/api/candidacy/all` | BIS_CDR | כלל המועמדויות מכל הענפים |
| PATCH | `/api/candidacy/:id/approve` | BIS_CDR | אישור סופי |
| PATCH | `/api/candidacy/:id/reject` | BIS_CDR | דחייה |

### 3.8 Course Registration (רישום מתקדמים)
| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/register/advanced` | TRAINEE | הגשת בקשת רישום |
| GET | `/api/registrations/mine` | TRAINEE | הרישומים שלי + סטטוס |
| GET | `/api/branch/registrations` | BRANCH_COORD | בקשות ענפיות לתיעדוף |
| PATCH | `/api/registrations/:id/prioritize` | BRANCH_COORD | תיעדוף + אישור ענפי |
| GET | `/api/registrations/all` | BIS_CDR | כל הבקשות (מתועדפות) |
| PATCH | `/api/registrations/:id/approve-final` | BIS_CDR | אישור סופי |
| PATCH | `/api/registrations/:id/reject` | BRANCH_COORD, BIS_CDR | דחייה |

### 3.9 Info Pages
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/info` | All | דפי מידע |
| GET | `/api/info/:slug` | All | דף ספציפי |
| POST | `/api/info` | BIS_CDR | יצירת דף |
| PATCH | `/api/info/:id` | BIS_CDR | עדכון דף |

### 3.10 Form Templates
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/courses/:id/forms` | All | טפסי קורס |
| POST | `/api/courses/:id/forms` | BIS_CDR | יצירת טופס |
| PATCH | `/api/forms/:id` | BIS_CDR | עדכון טופס |

---

## 4. תהליכי עבודה (App Flows)

### 4.1 צפייה בגאנט (כלל המשתמשים)
```
משתמש → סיידבר: "גאנט קורסים"
  → GET /api/gantt
  → תצוגת Timeline:

     קורס מ"פים מחזור 42
     ├── הגשת מועמדות    [1.3 - 15.3]  🟡
     ├── מיונים לפיקוד    [20.3 - 25.3] 🔵
     ├── קורס פיקוד       [1.4 - 15.4]  🟢
     ├── הכנת סגל         [16.4 - 20.4] 🟠
     ├── הקורס            [1.5 - 30.6]  🔴
     └── שבוע סיכומים     [1.7 - 7.7]   🟣
```

### 4.2 הגשת מועמדות לפיקוד — קורס יסוד

```
               ┌──────────────┐
               │  רש"צ מגיש   │
               │  מועמדות     │
               └──────┬───────┘
                      │ POST /api/candidacy/submit
                      ▼
              ┌───────────────┐
              │   PENDING     │  ← ממתין לבדיקת קה"ד
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  קה"ד ענפי    │  GET /api/candidacy/branch
              │  עובר, מתעדף  │  PATCH /api/candidacy/:id/coord-review
              └───────┬───────┘
                      │
              ┌───────▼────────────┐
              │  COORD_REVIEWED    │  ← ממתין לאישור מפקד ביס
              └───────┬────────────┘
                      │
              ┌───────▼───────┐
              │  מפקד ביס     │  GET /api/candidacy/all
              │  אישור סופי   │  PATCH /api/candidacy/:id/approve
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │   APPROVED    │
              └───────────────┘
```

### 4.3 רישום לקורס מתקדם — חניך

```
               ┌──────────────┐
               │  חניך נרשם   │
               │  לקורס       │
               └──────┬───────┘
                      │ POST /api/register/advanced
                      ▼
              ┌────────────────┐
              │ PENDING_COORD  │  ← ממתין לתיעדוף קה"ד
              └───────┬────────┘
                      │
              ┌───────▼───────┐
              │  קה"ד ענפי    │  GET /api/branch/registrations
              │  מתעדף, מאשר  │  PATCH /api/registrations/:id/prioritize
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  PENDING_BIS  │  ← ממתין לאישור מפקד ביס
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │  מפקד ביס     │  GET /api/registrations/all
              │  אישור סופי   │  PATCH /api/registrations/:id/approve-final
              └───────┬───────┘
                      │
              ┌───────▼───────┐
              │   APPROVED    │  ← החניך מקובל!
              └───────────────┘

** בכל שלב: דחייה → REJECTED + סיבה **
** אינדיקציה: חניך רואה סטטוס ב"הרישומים שלי" **
```

### 4.4 ניהול (מפקד ביס)

```
ממשק ניהול (BIS_CDR):
  ├── ניהול גאנט
  │    → CRUD שלבים לכל מחזור
  │
  ├── ניהול קטלוג קורסים
  │    → CRUD קורסים (יסוד / מתקדם)
  │    → ניהול תבניות טפסים
  │    → פתיחת/סגירת מחזורים
  │
  ├── מועמדויות לפיקוד
  │    → צפייה בכל המועמדויות (כל הענפים)
  │    → אישור / דחייה סופי
  │
  ├── אישור רישומים סופי
  │    → צפייה בבקשות PENDING_BIS
  │    → אישור / דחייה
  │
  ├── ניהול דפי מידע
  │    → CRUD (Markdown)
  │
  └── ניהול ארגוני
       → ענפים, צוותות, משתמשים
```

---

## 5. Sidebar Navigation (per role)

### מפקד ביס (`BIS_CDR`)
```
📊  לוח בקרה
📅  גאנט קורסים
📚  קטלוג קורסים
👥  מועמדויות לפיקוד
✅  אישור רישומים
📖  דפי מידע
⚙️  ניהול (ענפים, צוותות, משתמשים, טפסים)
```

### קה"ד ענפי (`BRANCH_COORD`)
```
📊  לוח בקרה
📅  גאנט קורסים
📚  קטלוג קורסים
✅  רישומים ענפיים (תיעדוף + אישור)
👥  מועמדויות הענף (צפייה + תיעדוף)
```

### ראש צוות (`TEAM_LEADER`)
```
📊  לוח בקרה
📅  גאנט קורסים
📚  קטלוג קורסים
👥  הגשת מועמדות לפיקוד
```

### חניך (`TRAINEE`)
```
📊  לוח בקרה
📅  גאנט קורסים
📚  קטלוג קורסים מתקדמים
📋  הרישומים שלי
ℹ️  מידע (הכנה למיונים וכו')
```

---

## 6. כללי עסקיים

1. **מועמדות לפיקוד** — רק `TEAM_LEADER` ומעלה מגישים. חניך לא מגיש על עצמו.
2. **רישום מתקדם** — חניך נרשם → קה"ד מתעדף → מפקד ביס מאשר (2 שלבים).
3. **גאנט** — גלוי לכולם. רק `BIS_CDR` עורך.
4. **סינון נתונים** — GET endpoints מחזירים נתונים לפי `branchId`/`teamId` של המשתמש, למעט `BIS_CDR`.
5. **Middleware** — בדיקת `role` לפני כל פעולה. Fastify preHandler hook.
6. **אינדיקציה** — חניך רואה סטטוס בזמן אמת (ממתין/אושר/נדחה) ב"הרישומים שלי".

---

## 7. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TypeScript + Vite + Tailwind v4 |
| Backend | Fastify + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Auth | Mock OAuth (dev) |
| Container | Docker Compose |
| CI | GitHub Actions |
