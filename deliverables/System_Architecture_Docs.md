# System Architecture & Academic Design Documentation
**Online Complaint Registration and Management System**
*SmartBridge College Project & System Architecture Thesis*

---

## 1. Entity-Relationship (ER) Diagram
The Entity-Relationship Diagram represents the logical relational schema of the MySQL database. It outlines structural tables, primary keys, foreign keys, cardinality ratios, and relational constraints.

### Mermaid representation of ER Diagram:
```mermaid
erDiagram
    USERS {
        int id PK
        string name
        string email UK
        string password
        string phone
        text address
        string profile_pic
        enum status
        timestamp created_at
    }
    ADMINS {
        int id PK
        string name
        string email UK
        string password
        enum role
        timestamp created_at
    }
    COMPLAINT_CATEGORIES {
        int id PK
        string name UK
        text description
        timestamp created_at
    }
    COMPLAINTS {
        string id PK "CMP-YYYY-XXXX"
        int user_id FK
        int category_id FK
        string title
        text description
        enum priority
        enum status
        string image_url
        int assigned_to FK
        int rating
        text feedback
        timestamp created_at
    }
    COMPLAINT_TIMELINE {
        int id PK
        string complaint_id FK
        string status
        text description
        int updated_by_admin FK
        timestamp created_at
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        text message
        boolean is_read
        timestamp created_at
    }
    ADMIN_ACTIVITY_LOGS {
        int id PK
        int admin_id FK
        string action
        string target
        timestamp created_at
    }

    USERS ||--o{ COMPLAINTS : "files"
    USERS ||--o{ NOTIFICATIONS : "receives"
    COMPLAINT_CATEGORIES ||--o{ COMPLAINTS : "classifies"
    COMPLAINTS ||--o{ COMPLAINT_TIMELINE : "logs history"
    ADMINS ||--o{ COMPLAINTS : "is assigned to"
    ADMINS ||--o{ COMPLAINT_TIMELINE : "updates"
    ADMINS ||--o{ ADMIN_ACTIVITY_LOGS : "performs"
```

---

## 2. Data Flow Diagram (DFD)
The Data Flow Diagram charts the system's input processing, data routing, file updates, and database storage layers across levels.

### Level 0: Context Data Flow Diagram
The high-level boundary of the platform showing external actors (User, Admin) and the central system process.

```mermaid
graph TD
    User([Citizen/User])
    Admin([System Administrator])
    System[("Complaint Registration & Management System (Process 0.0)")]

    User -- "1. Reg Credentials / Sign In" --> System
    User -- "2. Submit Complaint Form (details, priority, attachment)" --> System
    User -- "3. Submit Satisfactory Feedback & Rating" --> System
    System -- "4. Response status, Ticket ID" --> User
    System -- "5. Status Change Alerts / Real-time Notifications" --> User

    Admin -- "1. Admin Credentials" --> System
    Admin -- "2. Re-route / Assign Specialist" --> System
    Admin -- "3. Trigger Status Transition (resolved, etc) + Remarks" --> System
    Admin -- "4. Set up New Complaint Categories" --> System
    System -- "5. Visual Intake Graphs, Priority Metrics, Export PDF Reports" --> Admin
```

### Level 1: Sub-Process Flow Diagram
Explodes Process 0.0 into major functional modules and the database tables.

```mermaid
graph TD
    User([User])
    Admin([Admin])
    
    DB_U[(users Table)]
    DB_C[(complaints Table)]
    DB_T[(complaint_timeline Table)]
    DB_N[(notifications Table)]

    subgraph Process_Modules ["Central Processes (Level 1)"]
        P1["1.0 Auth & Profile Engine"]
        P2["2.0 Ticket Filing Controller"]
        P3["3.0 Admin Routing Handler"]
        P4["4.0 Real-time Notifications Engine"]
        P5["5.0 Reports & Chart Generator"]
    end

    User -->|Credentials| P1
    P1 <-->|Read/Write Profile| DB_U
    
    User -->|New Ticket Form| P2
    P2 -->|Generate Ticket ID & Save| DB_C
    P2 -->|Create Initial Step| DB_T

    Admin -->|Assign & Change Status| P3
    P3 -->|Update Assignee/Status| DB_C
    P3 -->|Write Timeline Record| DB_T
    P3 -->|Trigger Status Alert| P4

    P4 -->|Insert Notification| DB_N
    DB_N -->|Poll Alert Data| User

    Admin -->|Request Reports| P5
    P5 -->|Aggregate Metrics / Group counts| DB_C
```

---

## 3. Use Case Diagram
Maps the actions that each actor (User, Admin) can perform within the boundaries of the platform.

```mermaid
leftToRightDirection
graph TD
    subgraph Use_Cases ["System Boundary"]
        UC1(Register Account)
        UC2(Authenticate / Login)
        UC3(Edit Profile / Upload Avatar)
        UC4(Register New Complaint)
        UC5(Track Timeline Tracker)
        UC6(Submit Star Rating & Feedback)
        UC7(Assign Specialist)
        UC8(Resolve Complaint & Log Timeline)
        UC9(Create Complaint Category)
        UC10(Generate PDF Intake Reports)
        UC11(Audit Activity Logs)
    end

    User([Citizen / User]) --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6

    Admin([System Administrator]) --> UC2
    Admin --> UC3
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
```

---

## 4. Class Diagram
Represents the structural model of the application showing classes, fields, methods, and relationships.

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string phone
        +string address
        +string profile_pic
        +string status
        +timestamp created_at
        +register(name, email, password, phone, address)
        +login(email, password)
        +updateProfile(name, phone, address, pic)
        +changePassword(oldPass, newPass)
    }

    class Admin {
        +int id
        +string name
        +string email
        +string role
        +timestamp created_at
        +login(email, password)
        +updateProfile(name)
        +changePassword(oldPass, newPass)
    }

    class Complaint {
        +string id
        +int user_id
        +int category_id
        +string title
        +string description
        +string priority
        +string status
        +string image_url
        +int assigned_to
        +int rating
        +string feedback
        +timestamp created_at
        +timestamp updated_at
        +create(userId, categoryId, title, desc, priority, img)
        +updateStatus(status, adminId, remarks)
        +assignTo(adminId, updatedByAdmin)
        +submitFeedback(rating, comments)
    }

    class ComplaintCategory {
        +int id
        +string name
        +string description
        +timestamp created_at
        +static create(name, description, adminId)
        +static list()
    }

    class ComplaintTimeline {
        +int id
        +string complaint_id
        +string status
        +string description
        +int updated_by_admin
        +timestamp created_at
        +static log(complaintId, status, description, adminId)
    }

    class Notification {
        +int id
        +int user_id
        +string message
        +boolean is_read
        +timestamp created_at
        +static create(userId, message)
        +static markAsRead(id)
    }

    User "1" -- "0..*" Complaint : files
    User "1" -- "0..*" Notification : receives
    ComplaintCategory "1" -- "0..*" Complaint : categorizes
    Complaint "1" -- "0..*" ComplaintTimeline : triggers
    Admin "0..1" -- "0..*" Complaint : resolves
    Admin "1" -- "0..*" ComplaintTimeline : creates
```

---

## 5. Sequence Diagram (Complaint Lifecycle)
This diagram illustrates the chronological steps and message transfers across layers when registering, updating, and closing a complaint.

```mermaid
sequenceDiagram
    autonumber
    actor Citizen as User (John)
    participant Client as Frontend (React/UI)
    participant Server as Backend Server (Express/PHP)
    participant DB as Database (SQL/JSON)
    actor Operator as Admin (Support)

    Citizen->>Client: Clicks 'File New Complaint'
    Client->>Citizen: Renders Form (title, details, image)
    Citizen->>Client: Enters details, attaches screenshot, submits
    Client->>Server: POST /api/complaints (payload + Base64 image)
    Note over Server: Generates Complaint ID (e.g., CMP-2200-001)<br/>Sanitizes input & SQL-safe query
    Server->>DB: INSERT INTO complaints & initial timeline record
    DB-->>Server: Confirm write success
    Server-->>Client: Returns 201 Created (Ticket ID)
    Client-->>Citizen: Renders success toast & detail timeline

    Note over Operator: Logged into Admin console
    Operator->>Client: Inspects Complaint Inbox
    Client->>Server: GET /api/complaints?status=pending
    Server->>DB: SELECT * FROM complaints WHERE status='pending'
    DB-->>Server: Return list
    Server-->>Client: Renders Inbox with total statistics
    Operator->>Client: Assigns to self, updates status to In_Progress
    Client->>Server: PUT /api/complaints/ID/action (status, assigned_to, note)
    Server->>DB: UPDATE complaints & INSERT INTO timeline & notifications
    DB-->>Server: Success confirmation
    Server-->>Client: Action complete
    Client-->>Operator: Shows success dialog

    Note over Citizen: Automatic periodic API polling runs
    Server->>Client: Real-time update check response
    Client-->>Citizen: Visual Toast: "Your complaint status updated to In Progress"

    Note over Operator: Resolves issue at location
    Operator->>Client: Updates Status to 'Resolved' with site photos/notes
    Client->>Server: PUT /api/complaints/ID/action (status: resolved, note: "Welded mains")
    Server->>DB: Write database updates & logs
    DB-->>Server: Confirmed
    Server-->>Client: Saved
    Client-->>Operator: Saved
    Server->>Client: Poll alerts success
    Client-->>Citizen: Show alert "Your complaint is resolved! Leave rating."
    
    Citizen->>Client: Selects 5 Stars & writes feedback "Fixed, thanks!"
    Client->>Server: PUT /api/complaints/ID/feedback (rating, comments, userId)
    Server->>DB: UPDATE rating, feedback, set status='closed' & timeline
    DB-->>Server: Success
    Server-->>Client: Confirmed closed
    Client-->>Citizen: Folder Archived (Closed)
```

---

## 6. Activity Diagram
Represents the system-wide procedural workflows and branch conditions for both citizens and managers.

```mermaid
graph TD
    Start([User enters application]) --> Login{Authenticate Credentials}
    Login -->|Invalid| Error[Show Error Alert] --> Start
    Login -->|Valid Citizen| UserDash[Load User Dashboard]
    Login -->|Valid Admin| AdminDash[Load Admin Dashboard]

    UserDash --> UserChoice{Action Selection}
    UserChoice -->|Profile| EditProfile[Edit Contact / Profile Pic] --> SaveProfile[Save & Update DB] --> UserDash
    UserChoice -->|File Complaint| NewComp[Fill Complaint Form] --> UploadEvidence[Upload Screenshot Base64] --> SubmitComp[Auto-Generate ID & Create Folder] --> UserDash
    UserChoice -->|History| ListComp[View Paginated Filing History] --> SelectComp[Select Folder] --> TimelineView[View Tracking Timeline]
    TimelineView --> FeedbackCheck{Status is 'Resolved'? }
    FeedbackCheck -->|No| UserDash
    FeedbackCheck -->|Yes| FeedForm[Fill Stars Rating & Feedback] --> CloseFolder[Set Status to Closed] --> UserDash

    AdminDash --> AdminChoice{Operations Selection}
    AdminChoice -->|Categories| ViewCat[View Operational Categories] --> AddCat[Add New Category] --> AdminDash
    AdminChoice -->|Users| ViewUsers[View Directory] --> ToggleStatus[Active vs Suspend User] --> AdminDash
    AdminChoice -->|Inbox| ViewInbox[View Complaint Inbox] --> FilterInbox[Search by ID / Category / Status] --> AssignComp[Assign Specialist] --> StatusComp[Change Status & Log remarks] --> AdminDash
    AdminChoice -->|Logs| ViewLogs[Audit System Activity Logs] --> AdminDash
    AdminChoice -->|Reports| ViewReports[Compile Bento Performance Stats] --> PrintReports[Generate & Export PDF Report] --> AdminDash
```

---

## 7. REST API Documentation
This section details the primary backend API routes deployed to communicate data between the React client and the server database.

### 7.1 Authentication Endpoints
#### • `POST /api/auth/register`
Creates a secure citizen account. Performs password hashing using SHA-256.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@gmail.com",
    "password": "user123",
    "phone": "9876543210",
    "address": "123 Sector 4, Metro City"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "Registration successful",
    "user": { "id": 1, "name": "John Doe", "email": "john@gmail.com", "phone": "9876543210", "address": "123 Sector 4, Metro City", "status": "active", "created_at": "2026-07-15T10:00:00Z" },
    "role": "user"
  }
  ```

#### • `POST /api/auth/login`
Checks credentials, auto-detects user or administrator account, and starts a session.
- **Request Body:**
  ```json
  { "email": "john@gmail.com", "password": "user123" }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Login successful",
    "user": { "id": 1, "name": "John Doe", "email": "john@gmail.com" },
    "role": "user"
  }
  ```

---

### 7.2 Complaint Endpoints
#### • `GET /api/complaints`
Retrieves registered complaints with support for advanced filtering, search terms, and user IDs.
- **Query Parameters:** `userId` (optional), `role` (optional), `search` (optional), `status` (optional), `categoryId` (optional), `priority` (optional).
- **Response (200 OK):**
  ```json
  [
    {
      "id": "CMP-2026-0001",
      "user_id": 1,
      "category_id": 1,
      "title": "Burst Water Pipeline",
      "description": "Pipe is leaking near B Block Gate",
      "priority": "high",
      "status": "resolved",
      "created_at": "2026-07-15T10:30:00Z"
    }
  ]
  ```

#### • `POST /api/complaints`
Registers a new complaint. Auto-generates high-integrity complaint numbers `CMP-YYYY-XXXX` and creates initial timeline notes.
- **Request Body:**
  ```json
  {
    "userId": 1,
    "categoryId": 1,
    "title": "Pipeline Burst",
    "description": "Leaking drinking water",
    "priority": "high",
    "image_url": "data:image/png;base64,..."
  }
  ```
- **Response (201 Created):**
  ```json
  { "message": "Complaint registered successfully", "complaint": { "id": "CMP-2026-0004", ... } }
  ```

---

## 8. Testing & QA Verification Report
System-wide black-box and integration verification matrix completed on the platform.

| Test Case ID | Module Under Test | Test Scenario Description | Input Parameters / Actions | Expected Output Outcome | Actual Outcome | Status |
|---|---|---|---|---|---|---|
| **TC-01** | Authentication | Validate User Registration with missing fields | Omit `phone` input on register form | Form validation highlights missing input | Highlighted & blocked submission | **PASSED** |
| **TC-02** | Authentication | Validate Email Uniqueness constraint | Input existing email `john@gmail.com` | Alert: "Email address is already registered" | Toast message displayed correctly | **PASSED** |
| **TC-03** | Authentication | Validate password security criteria | Register with password `123` | Alert: "Password must be at least 6 characters" | blocked registration and threw warning | **PASSED** |
| **TC-04** | Complaint Module | Auto-generate sequential ticket numbers | POST new complaint in current year | Generates `CMP-2026-0004` (sequentially) | Returned `CMP-2026-0004` correctly | **PASSED** |
| **TC-05** | Complaint Module | Attachments handling via Base64 | Upload 1.5MB PNG file on complaint form | Decodes and saves to backend JSON successfully | preview loaded & base64 saved to JSON DB | **PASSED** |
| **TC-06** | Admin console | Update status & trigger timelines | Transition ticket to 'In Progress' with note | Status updates; timeline gains record | DB updated, timeline logs admin remarks | **PASSED** |
| **TC-07** | Admin console | Restrict and Suspend user account | Set User John Doe status to suspended | John Doe cannot log in; displays block notice | Login blocked with correct notice | **PASSED** |
| **TC-08** | Notification Module| Real-time periodic status checks | Citizen page stays active; admin resolves ticket | Citizen receives status alert within 10s | Alert Toast displayed in citizen header | **PASSED** |
| **TC-09** | Reporting | Bento charts aggregate group metrics | Request `/api/reports/stats` | Counts correspond to DB states precisely | Re-calculated totals matching DB count | **PASSED** |
| **TC-10** | Security | XSS Injection protection | Input `<script>alert('xss')</script>` in title | Input is treated as text, escaping execution | Text loaded as literal, script did not run | **PASSED** |
