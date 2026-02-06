# SOC Bible

## Workflow (Story-World Standard)
1. **Triage** → classify alert, check queue context, note time sensitivity.
2. **Validate** → confirm signal quality and authenticity; avoid reacting to phantom noise.
3. **Scope** → identify affected user/device, related events, and lateral spread.
4. **Contain** → isolate devices, disable accounts, block indicators (with approvals as required).
5. **Document** → write succinct ticket notes, evidence lists, and decision reasoning.
6. **Escalate / Hand-off** → engage IR lead or day shift for ongoing containment or remediation.

## Severity Guidance (Story World)
- **Low:** single user, low-confidence signal, no evidence of impact, easy to dismiss.
- **Medium:** confirmed suspicious behavior on one asset, limited impact, needs containment or user action.
- **High:** clear compromise indicators, potential spread or data exposure, requires immediate coordination.
- **Critical:** active destructive activity (ransomware), multiple assets impacted, executive awareness required.

## Evidence Handling Rules
- Capture **timestamps**, **user/device identifiers**, and **source log tables**.
- Record **KQL snippets** or query names used to validate.
- Save **process tree screenshots** or timeline notes (if available).
- Note **who you contacted** and the time of contact.
- Never alter artifacts on a device during triage (no “just to see”).
- Don’t copy sensitive data into tickets; summarize and reference the source.

## Ticket Template (Consistent Structure)
**Fields**
- Alert name:
- Severity:
- Time detected (UTC/local):
- Affected user/device:
- Summary (2–4 sentences):
- Validation steps:
- Evidence captured:
- Decision & rationale:
- Containment actions:
- Escalation / hand-off:

**Example**
- Alert name: Multiple Failed Logins Followed by Success
- Severity: Medium
- Time detected: 02:13 local
- Affected user/device: userA / device-17
- Summary: User experienced 14 failed logins from a new IP followed by a successful login. IP geolocated to same city as user; sign-in pattern consistent with VPN reconnection. No risky sign-ins or device alerts.
- Validation steps: Checked Entra sign-in logs, reviewed risky sign-ins, searched for correlated MDE alerts, verified user VPN schedule.
- Evidence captured: KQL snippet for sign-ins, IP reputation snapshot, user baseline note.
- Decision & rationale: Closed as benign (VPN mismatch). Added note for follow-up if recurrence.
- Containment actions: None.
- Escalation / hand-off: None.

## Escalation Criteria to IR Lead
- Active ransomware indicators (mass renames + ransom notes).
- Confirmed credential theft with lateral movement.
- Any evidence of data exfiltration.
- Widespread phishing with multiple users executing payloads.
- Persistent access mechanisms (scheduled tasks, registry run keys) confirmed.
- Multiple alerts across different controls with matching IOCs/TTPs.

