# 11 — Post-Incident, Post-Self

The morning after is a different universe: fluorescent lights, cold bagels, people who slept. The incident has a number now. The chaos has a slide deck. I sit in the post-incident meeting and take notes like a penitent. Sofia leads with calm. Devin watches the metrics. Mara watches me.

We walk through the timeline. We note the first alert, the delay, the containment. We circle the moment the device was released and the adversary returned. The incident becomes a story with a moral: don’t release without clearance, don’t trust a disabled account, don’t assume a single indicator is the end. The story is accurate; it’s also incomplete. There were a hundred micro-decisions that don’t fit on a slide.

Here is the rule I hate: **Lessons learned must be actionable, or they are just guilt.** The post-incident meeting is a laboratory for this.

I write down three controls we can improve:
1. Better alert grouping for account anomalies tied to service accounts.
2. Scheduled task creation detection tuned for temp directory execution.
3. Automated isolation for ransomware indicators on file servers.

These are not revolutionary. They are real. That’s the point. You don’t fix the world; you fix one rule at a time.

The training part happens in the hallway after. Mara tells me that the note I wrote was clear enough for the day shift to act. She says this like it matters. It does. Documentation is the only artifact we leave behind. It is the closest thing to forgiveness.

**Investigative pivot:** From incident timeline → detection tuning → control validation. I open Sentinel and review the analytic rule for remote service creation. The rule is too broad. It triggers on legitimate admin activity. We decide to add a condition for temp paths, and to require it to originate from non-admin hosts. That should reduce noise and keep the signal. I add it to a change request.

Watch-out: **Tuning without tests creates blind spots.** When you change a rule, you must test it on past data. We run the modified KQL on the last 30 days. It still captures the malicious event and reduces benign hits. This is the closest we get to proof.

Documentation best practice: **Write the “why” in the post-incident notes.** Not just what we did, but why we did it. This turns a ticket into a training artifact.

I leave the meeting with the same exhaustion, but a different kind of shame. It is the shame of knowing you could be better, and having a map of how. It’s a useful shame. It keeps you awake without making you cruel.

The post-incident review is where we turn pain into process. It’s also where we turn individuals into roles. I sit there and watch my own actions become bullet points. It’s unsettling, but it’s the only way to learn without re-living every moment.

We create a root cause statement: “Service account credentials exposed via unknown vector; ransomware executed on file server; lateral movement via remote service creation.” It’s accurate and incomplete. The vector is still unknown. That uncertainty is part of the story, but the slide wants a neat sentence. We compromise.

**Investigative pivot:** From root cause → control gaps → owner assignments. We assign a detection owner for each gap: MFA for service accounts, monitoring for scheduled task creation, monitoring for service account logons from unusual hosts. Each owner is a name and a date. Without a name and date, it is not a plan; it is a wish.

Watch-out: **Blame masquerades as root cause.** If we say “user error,” we stop learning. So we avoid that phrase. We say “policy gap” or “control gap.” It’s not kindness; it’s accuracy.

Documentation best practice: **Link detection changes to incident artifacts.** When we propose a rule change, we include the alert ID and the timestamp from the incident. This ensures future analysts can trace why a rule exists. Otherwise, it becomes another orphaned detection nobody trusts.

After the meeting, I write a short note to myself: “You did not ruin everything. You were part of a system that failed. You are part of a system that can improve.” I don’t know if I believe it. I write it anyway. The post-self is the one who can handle the next incident.

We create a section in the report called “What we almost missed.” It includes the moment we considered the ransomware alert a false positive, the moment we released the isolated device, the moment we assumed the service account anomaly was just maintenance. These are not confessions; they are training points.

**Investigative pivot:** From lessons learned → operational changes. We add an on-call escalation rubric: when a file server is involved, escalate immediately; when a service account shows anomalous sign-ins, treat as high. The rubric is the difference between a hunch and a policy.

Watch-out: **Do not let the post-incident report become a performance review.** When the report is used to punish, people stop being honest. We keep names out of the lessons section and focus on systems and controls.

Documentation best practice: **Include the queries used to validate rule changes.** I attach the tuned KQL and the before/after counts. It becomes a reference for future rule modifications. It also justifies the work when someone asks why we spent hours on “just a query.”

I leave the SOC in daylight and feel like a different person. The post-self is the one who can look at their own work without flinching. That’s the only growth I can measure.

We also update the SOC Bible. That’s my quiet contribution. I add a section about service account monitoring and note the new escalation criteria. It feels bureaucratic, but it’s how you make the learning stick.

**Investigative pivot:** From report → training. We schedule a short tabletop exercise for the night shift: a mock ransomware alert, a service account anomaly, a decision to isolate. The exercise isn’t about heroics; it’s about rehearsing calm.

Watch-out: **Metrics will try to swallow the narrative.** If the only change you make is a new metric, you haven’t learned. So we insist on one technical change and one procedural change. Technical: tuned rule. Procedural: hand-off checklist for isolation decisions.

Documentation best practice: **Close the feedback loop.** When a tuning change goes live, we record whether the noise decreased. That data becomes the proof that the lesson mattered.

I leave the meeting with a task list and a sense that the incident is still happening, just at a slower speed. The post-self learns to live with that.

---

CASE FILE: Post-Incident Review (Detection Tuning)
- Signal:
  - Post-incident review following ransomware and lateral movement.
- Context:
  - Control and detection improvements identified; change request raised.
- Hypotheses (benign vs malicious):
  - Benign: false positives from broad rules.
  - Malicious: true signals buried in noise.
- Validation steps (first 10 minutes):
  - Review incident timeline for key detection gaps.
  - Identify rules with high noise.
  - Test tuned KQL against historical data.
- Evidence captured:
  - Before/after rule hit counts.
  - Change request details.
- Decision:
  - Implement tuning with test validation; schedule review.
- Ticket write-up (concise):
  - “Post-incident review identified need for better grouping and tuning. Modified remote service creation rule to filter for temp paths and non-admin origins; tested against 30 days data with reduced noise and retained malicious hit. Change request submitted.”
- Follow-ups / tuning ideas:
  - Schedule follow-up review after 2 weeks.
  - Monitor false negative risk with targeted hunting.
