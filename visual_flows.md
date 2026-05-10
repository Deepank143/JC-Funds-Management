# 📊 Visual Journey Flows: Apex Buildcon Management System

These diagrams represent the core user experiences for **Harsh Jani** and his team.

---

## 1. The Morning Pulse (Admin Review)
Harsh checks the high-level financial health of Apex Buildcon.

```mermaid
graph TD
    A[Start: Harsh Opens App] --> B{Admin Mode ON?}
    B -- No --> C[Toggle Admin Mode]
    B -- Yes --> D[View Net Position Card]
    C --> D
    D --> E[Check Overdue Milestones Badge]
    E --> F[Drill Down into Specific Project P&L]
    F --> G[End: Informed Strategic Decision]
    
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#fdd,stroke:#f00,stroke-width:2px
```

---

## 2. The Privacy Shield (Site Visit)
Harsh visits a construction site and shows milestone progress to a client without revealing margins.

```mermaid
graph LR
    A[Public Setting] --> B[Harsh Toggles Admin OFF]
    B --> C[Global KPIs Masked: ₹ ••••••]
    C --> D[Open Project View]
    D --> E[Show Milestone Progress to Client]
    E --> F[Show Payments Received]
    F --> G[Privacy Maintained]
    
    style B fill:#bfb,stroke:#080,stroke-width:2px
    style C fill:#eee,stroke:#999,stroke-dasharray: 5 5
```

---

## 3. The Maker-Checker (Payment Cycle)
Ensuring that staff can enter bills, but only Harsh can authorize the actual cash outflow.

```mermaid
sequenceDiagram
    participant S as Site Staff
    participant DB as System DB
    participant H as Harsh (Owner)
    
    S->>DB: Logs Expense (₹50k - Unpaid)
    DB-->>H: Notification/Badge Update
    H->>DB: Toggles Admin Mode ON
    H->>DB: Reviews Expense Attachment
    H->>DB: Marks as PAID & Selects Bank
    DB-->>S: Status Updated to "Paid"
    Note over H: Final Authority on Outflow
```

---

## 4. The Milestone Safety-Net (Revenue Tracking)
Tracking money from work completion to bank deposit.

```mermaid
stateDiagram-v2
    [*] --> Pending: Work in Progress
    Pending --> Billed: Milestone Marked Finished
    Billed --> Overdue: 7 Days No Payment
    Billed --> Paid: Income Recorded
    Overdue --> Paid: Late Payment Received
    Paid --> [*]: Cash in Bank
    
    state Billed {
        direction LR
        [*] --> Invoiced
    }
```

---

## 5. Technical Architecture
The engine powering Apex Buildcon.

```mermaid
graph TD
    User((User)) --> NextJS[Next.js App Router]
    NextJS --> Auth[Supabase Auth]
    NextJS --> Store[Zustand State: Admin Mode]
    NextJS --> DB[(Supabase PostgreSQL)]
    DB --> RLS[Row Level Security]
    RLS --> MakerChecker[Maker-Checker Logic]
    
    subgraph "Vercel Cloud"
        NextJS
        Store
    end
    
    subgraph "Supabase Cloud"
        DB
        RLS
    end
```

---
*Created for Apex Buildcon | Visualizing Operational Excellence*
