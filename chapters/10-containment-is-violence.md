# 10 — Containment Is Violence

Containment is an ugly word for a necessary thing. It is violence in the sense that it interrupts. It cuts a device off from the network. It disables a user’s account. It stops business. It is always a trade, and the trade is made by someone who is awake at 3 a.m. and does not want to be blamed for either choice.

The alert tonight is not new, but it is confirmed: **Persistence via Scheduled Task**. One of the isolated devices shows a task named “Updater Service Monitor” created by the suspicious binary. The task runs every hour. That is persistence. That is intent.

Here is the rule I hate: **Once you confirm persistence, you no longer have the luxury of debate.** If it’s real, you contain; if you contain, you break things. You break them anyway.

**Investigative pivot:** From scheduled task → registry run keys → additional persistence. I check the device for other persistence mechanisms. MDE shows a run key added under the same user context. The same hash is involved. This isn’t a one-off; it’s a foothold.

I isolate the device again (it was previously isolated but was briefly released for a critical patch). That was a mistake. We shouldn’t have released it. But operations needed it. We made a compromise. The adversary noticed. This is the cost of compromise.

I coordinate with Sofia to disable additional accounts associated with the device. We also block the hash and the IP in Sentinel. We add a Microsoft Defender indicator for the file hash and the external IP observed in the process tree.

KQL to identify scheduled tasks created around the time of compromise:

```kql
DeviceEvents
| where ActionType == "ScheduledTaskCreated"
| project TimeGenerated, DeviceName, AdditionalFields
| order by TimeGenerated desc
```

Watch-out: **Containment is not remediation.** Isolating the device doesn’t clean it. Disabling accounts doesn’t undo access. You must hand off to IR for eradication. My job is to stop the bleeding, not to stitch.

Documentation best practice: **Record containment actions with time and justification.** “Isolated device at 03:14 due to confirmed persistence.” “Disabled account at 03:21 after verifying business impact.” This is less about covering myself and more about giving the day shift a map of the damage.

I want to tell you I did it with confidence. I did it with fear. The only difference between courage and fear is whether you write it down.

We isolate devices with a checkbox, which makes it feel too clean. But behind that checkbox is a person who can’t open their email, a server that can’t serve a file, a department that will complain in the morning. The checkbox is a moral weight.

I ask Sofia if we can allow “limited isolation” so the device can still talk to the management plane for remediation. She agrees. That’s a compromise between safety and feasibility. We use the MDE feature that allows specific network traffic while cutting the rest. It’s a small technical detail, but it keeps the IT team from hating us.

**Investigative pivot:** After containment, I check for similar persistence on neighboring hosts. I use a query for scheduled tasks created in the last 48 hours across the subnet. I’m looking for the same task name. No hits. That is a temporary relief.

Watch-out: **Over-containment can break trust.** If we isolate too broadly, business owners push back and security loses authority. That’s why I document approvals and who signed off. It’s not bureaucracy; it’s a safety rail.

Documentation best practice: **Include business impact notes.** “Device isolated; owner notified; exception granted for management traffic.” These notes matter in the post-incident review when people ask why operations slowed.

The violence of containment is that it always harms someone who didn’t attack you. It’s a pre-emptive strike against your own systems. The only thing that makes it acceptable is the clarity of the evidence. I make sure the evidence is clear.

There is also the question of **account containment**. We disabled the service account. But for user accounts that touched the infected hosts, I choose a softer approach: force password reset and revoke sessions. That is less disruptive and still effective. It also keeps the business from pushing back too hard. The work is compromise, not purity.

**Investigative pivot:** I check for persistence on other hosts via registry run keys and scheduled tasks. I run a query across the subnet, looking for tasks created in the last 48 hours by the suspicious hash or the service account. No hits. That’s good, but I note that absence is not proof.

Watch-out: **Indicators can be over-broad.** Blocking an IP without confirming ownership can disrupt legitimate services. So I double-check the IP’s ownership and the destination before blocking. It belongs to a hosting provider, not a corporate asset. That makes it safer to block.

Documentation best practice: **Note approvals for containment actions.** Sofia approved isolation and account disabling. I include her name and the time in the ticket. It’s not about deflecting blame; it’s about creating a chain of custody for decisions.

Containment feels like violence because it is a forced constraint, a breaking of normal life. But it is not cruelty. It is boundary-setting for a system that can’t protect itself otherwise. That’s the story I tell myself so I can sleep.

I keep a **containment checklist** taped to the monitor:

- Is the alert confirmed? If yes, proceed.
- Is the device critical? If yes, inform owner first unless active destruction.
- Can we isolate with management exception? If yes, do that.
- Are there indicators to block? Hash, IP, domain.
- Are there accounts to disable or reset?

This list is not official, but it keeps me from improvising under pressure.

I also send a brief status update to the operations channel. “We isolated three devices for confirmed persistence; expect temporary access issues.” It’s the kind of message that avoids confusion. Confusion is the second adversary.

Watch-out: **Do not destroy evidence.** It’s tempting to wipe or reimage. That’s not containment; that’s erasure. The IR team needs the artifacts. So I include a line in the ticket: “Do not reimage until IR approves.” It’s small, but it protects the investigation.

Containment is violence, but it’s also consent. It is consent granted by the policies we agreed to when we decided security mattered. I remind myself of that when I click the isolate button.

I also note the time I informed the business owner. Silence is a containment risk; communication is a mitigation.

---

CASE FILE: Persistence via Scheduled Task
- Signal:
  - Scheduled task created by suspicious binary on previously isolated device.
- Context:
  - Task name “Updater Service Monitor,” runs hourly; linked to known malicious hash.
- Hypotheses (benign vs malicious):
  - Benign: none plausible given prior compromise.
  - Malicious: persistence mechanism.
- Validation steps (first 10 minutes):
  - Review scheduled task creation event in MDE.
  - Check for other persistence mechanisms (run keys).
  - Confirm hash matches previously blocked indicator.
- Evidence captured:
  - Scheduled task details and timestamps.
  - Registry run key notes.
  - Hash and related indicators.
- Decision:
  - Re-isolate device; expand containment to associated accounts and indicators.
- Ticket write-up (concise):
  - “Confirmed persistence via scheduled task ‘Updater Service Monitor’ on device previously involved in lateral movement. Hash matches known indicator; additional run key present. Re-isolated device at 03:14; blocked hash/IP; disabled associated accounts after coordination. Escalated to IR for eradication.”
- Follow-ups / tuning ideas:
  - Improve change control for releasing isolated devices.
  - Add alerting for scheduled tasks on critical endpoints.
