## 2026-11-08T13:45:12Z
You are teamwork_reviewer_r1_2.
Your working directory is: c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_reviewer_r1_2
Your parent is orchestrator: d7847ee1-8027-4cb5-b1ca-7aa7a2e95f75

MANDATORY FIRST STEP:
Read the authoritative user request at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\ORIGINAL_REQUEST.md

TARGET DELIVERABLE TO REVIEW:
Inspect and thoroughly audit the master optimization plan at:
c:\Users\aruko\OneDrive\Desktop\Documents\track\OPTIMISATION_PLAN.md

REVIEW CRITERIA & CHECKLIST:
1. Five Required Sections: Verify that `OPTIMISATION_PLAN.md` contains exactly the five required sections:
   - 1. Findings table
   - 2. Fix list in priority order
   - 3. Grouped tasks
   - 4. "Must not change" list
   - 5. Before/after manual test checklist
2. Systematic Coverage of R2 Causes:
   - Cross-check every investigated item from R2 likely causes in the findings table with verified `file:line` references or explicit "Not Found" status.
3. Concrete Numbers & Unmeasured Labels:
   - Ensure measured numbers (e.g. 3,290 ms server waterfall, 1,018 ms placement freeze, 520.6 KB client chunk, ~260 ms RTT) are backed by code/runtime traces, and any untraced metric is explicitly labeled "unmeasured".
4. Documentation Citations:
   - Verify every citation of outside performance advice points to a specific official documentation URL/page.
5. Grouped Tasks Formatting:
   - Verify each task has 1 to 3 related fixes, formatted as actionable standalone prompts ordered with highest-impact page turn and placement wins first.
6. L1 to L14 & L3 Compliance:
   - Verify that all fixes require ZERO packages outside L3 and preserve the physical notebook feel (no websites/dashboards/UI kits).

DELIVERABLE:
Write your structured review report and explicit verdict (APPROVE or REQUEST_CHANGES) in:
`c:\Users\aruko\OneDrive\Desktop\Documents\track\.agents\teamwork\teamwork_reviewer_r1_2\handoff.md`
When done, message your parent with send_message including your verdict and handoff path.
