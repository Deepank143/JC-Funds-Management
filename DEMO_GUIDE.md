# Apex Buildcon — v3.0 Demonstration & Feature Walkthrough

This guide provides a step-by-step manual for demonstrating the **Funds Management System v3.0**. By using the `dummy_data_v3.sql` dataset, you can showcase high-precision financial tracking, the Intelligence Engine, and audit-ready correction workflows.

---

## 🏗️ Setup
1.  **Execute SQL**: Run `dummy_data_v3.sql` in your Supabase SQL Editor.
2.  **Login**: Access the app as an **Owner** (to see Admin Mode features).
3.  **Dashboard**: Ensure the Dashboard loads and the KPIs reflect the new data.

---

## 🔍 Step 1: Showcase the Intelligence Engine (Module H)
*The system now "thinks" ahead by analyzing upcoming milestones and current cash position.*

1.  **Navigate to Dashboard**: 
    *   Point out the **Smart Alert Feed**.
    *   **Alert 1**: Observe the "1st Floor Slab" alert for *Skyline Tower A*. It should be flagged as **High Priority** because it's due in 5 days but has no recorded income/billing yet.
    *   **Alert 2**: Observe the **Vendor Overdue Alert** for *Ramesh & Co.* showing a 40-day-old unpaid bill.
2.  **Milestone Fund Flow**:
    *   Go to **Projects > Skyline Tower A > Milestones**.
    *   Show how the "Plinth Level" milestone is marked as **Billed** but not yet **Paid**, allowing the user to track the "Gap" between physical work and bank credit.

---

## 💰 Step 2: Showcase Financial Integrity & Back-Entry (Module I)
*Demonstrate how the app handles historical corrections and "Admin Mode".*

1.  **Toggle Admin Mode**:
    *   In the top navigation, click **Admin Mode** (available only for Owners).
    *   Explain that this enables "Lock Override" for historical data.
2.  **Correction Flow**:
    *   Navigate to **Income > Recent Transactions**.
    *   Find the entry for *Apex Office HQ* (Site survey fee). 
    *   Explain: "This was added as a back-entry to correct a 90-day-old missing record. The system maintains the original transaction date (90 days ago) while tracking that it was corrected today."
3.  **Financial Amendments**:
    *   Open an existing Expense for *Mehta Residency*.
    *   Show how the system allows correcting the `payment_status` or `amount_paid` with an audit trail note.

---

## 🏁 Step 3: Showcase the Settlement Reconciliation Wizard
*The final "Gate" for project closure, ensuring no rupee is left uncounted.*

1.  **Navigate to Projects > Mehta Residency**:
    *   Point out that this project is at 80% margin and is nearing completion.
2.  **Trigger Settlement**:
    *   Click the **Settle Project** button.
    *   **Stage 1 (Gap Analysis)**: Show the wizard identifying "Unpaid Vendor Dues" (1.5L pending for Tiles) and "Unbilled Client Amount".
    *   **Stage 2 (Final Lock)**: Demonstrate how the owner can decide to "Write-off" small gaps or "Force Finalize".
    *   **Result**: Once settled, show that the project status changes to **Completed** and the records are locked from further standard accounting edits.

---

## 📊 Step 4: High-Precision Reporting
*Visualizing the data for board-level decisions.*

1.  **Reports > Project P&L**:
    *   Generate a PDF for *Skyline Tower A*.
    *   Show the high-precision INR formatting (e.g., `₹5,00,00,000.00`).
2.  **Net Position KPI**:
    *   Go back to the Dashboard.
    *   Explain: "The Net Position isn't just Cash in Bank. It's `(Confirmed Receivables - Immediate Payables)`. v3.0 calculates this across all 11+ static pages dynamically."

---

## 📝 Key Use Case Scenarios to Highlight
*   **The "Cash Crunch" Warning**: Use *Skyline Tower A* to show how high expenses + pending milestones = immediate need to call the client.
*   **The "Vendor Trust" Check**: Use the Vendor Ledger for *UltraTech Cement* to show every bag of cement linked to a specific milestone.
*   **The "Audit Trail" Verification**: Demonstrate that every entry has a `created_by` and `updated_at` timestamp for accountability.

---
*Created with ❤️ for the Apex Buildcon v3.0 Release Handover.*
