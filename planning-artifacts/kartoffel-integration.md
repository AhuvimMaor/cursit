<div dir="rtl">

# אינטגרציית Kartoffel - תכנון

## מה זה Kartoffel?

API ארגוני לניהול מבנה ארגוני ואנשי צוות. מספק:
- עץ היררכי של קבוצות (ענפים, צוותות, מחלקות)
- חיפוש אנשים לפי שם / מספר אישי
- פרטי אדם: שם, דרגה, תפקיד, היררכיה, סוג שירות

## למה צריך ב-Bisli?

| צורך | מה Kartoffel פותר |
|------|-------------------|
| בחירת משתתף ברישום/מועמדות | חיפוש לפי שם במקום בחירה מרשימה סטטית |
| מבנה ארגוני (ענפים + צוותות) | סנכרון אוטומטי במקום הזנה ידנית |
| פרטי משתתף (דרגה, מספר אישי) | מילוי אוטומטי מ-Kartoffel |
| פרופיל משתתף | סוג שירות, יחידה |

## ארכיטקטורה (לפי airbnb)

```
Frontend                    Backend                     Kartoffel API
─────────                   ─────────                   ─────────────
HierarchyBrowser ──→  /api/kartoffel-tree/roots    ──→  GET /groups
PersonnelSearch  ──→  /api/kartoffel-tree/search   ──→  GET /entities
                      /api/kartoffel-tree/full-tree ──→  GET /groups (all)
                      
                      TreeCache (in-memory)
                      - Full tree cached at startup
                      - Manual refresh endpoint
```

## API Endpoints לממש

| Endpoint | מה עושה |
|----------|---------|
| `GET /api/kartoffel-tree/roots` | קבוצות שורש (ענפים ראשיים) |
| `GET /api/kartoffel-tree/group/:id/children` | ילדים של קבוצה (תת-ענפים + אנשים) |
| `GET /api/kartoffel-tree/full-tree` | עץ מלא (cached) |
| `GET /api/kartoffel-tree/search?fullName=X` | חיפוש אנשים לפי שם |
| `GET /api/kartoffel-tree/search-groups?name=X` | חיפוש קבוצות לפי שם |
| `POST /api/kartoffel-tree/refresh` | רענון cache |

## סכמות נתונים

### קבוצה (Group Node)
```typescript
{
  id: string;
  name: string;          // שם הקבוצה
  hierarchy: string;     // נתיב מלא
  isLeaf: boolean;       // האם קבוצה סופית
}
```

### אדם (Entity Node)
```typescript
{
  identityCard: string;    // ת.ז
  personalNumber: string;  // מספר אישי
  displayName: string;     // שם תצוגה
  fullName: string;        // שם מלא
  rank: string;            // דרגה
  akaUnit: string;         // יחידה
  hierarchy: string;       // היררכיה
  gender: string;          // מגדר
  serviceType: string;     // סוג שירות (keva/hova/miluim)
  phone: string;           // טלפון
}
```

## רכיבי Frontend

### 1. PersonnelSearch (חיפוש אנשים)
- Input חיפוש עם debounce
- תוצאות מוצגות כרשימה עם: שם, דרגה, יחידה
- בחירה מחזירה entity מלא
- **שימוש:** בטופס הגשת מועמדות, רישום ידני

### 2. HierarchyBrowser (דפדוף עץ ארגוני)
- תצוגת עץ עם breadcrumbs
- לחיצה על קבוצה → נכנס פנימה
- מציג אנשים בקבוצה הנוכחית
- **שימוש:** ניהול מערכת, בחירת קבוצה

## שלבי מימוש

| שלב | משימה | זמן |
|------|--------|------|
| 1 | הגדרת config (baseUrl, apiKey, rootGroupId) | 30 דקות |
| 2 | HTTP client + cache service (backend) | 2 שעות |
| 3 | API routes (5 endpoints) | 2 שעות |
| 4 | PersonnelSearch component (frontend) | 2 שעות |
| 5 | שילוב בטופס מועמדות (החלפת select) | 1 שעה |
| 6 | HierarchyBrowser (אופציונלי - ניהול) | 3 שעות |

**סה"כ הערכה: 7-10 שעות**

## Config נדרש

```env
# backend/.env
KARTOFFEL_BASE_URL=https://kartoffel.example.com
KARTOFFEL_API_KEY=xxx
KARTOFFEL_ROOT_GROUP_ID=xxx   # ID של הקבוצה הראשית של הארגון
```

## החלטות עיצוב (מ-airbnb)

1. **Cache in-memory** - עץ מלא נטען פעם אחת ונשמר בזיכרון. רענון ידני דרך endpoint
2. **axios + API key** - הזדהות מול Kartoffel עם header Authorization
3. **Frontend agnostic** - Components מקבלים onSelect callback, לא מכירים את הלוגיקה העסקית
4. **Fallback** - אם Kartoffel לא זמין, המערכת עובדת עם נתונים מקומיים (DB Users)

</div>
