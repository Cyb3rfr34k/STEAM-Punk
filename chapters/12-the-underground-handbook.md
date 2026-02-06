# 12 — The Underground Handbook

There is a part of me that wants to quit after a big incident. I want to walk away while I can still tell the story. The other part wants to write it down so I don’t have to carry it. That’s why I make a handbook for the next person, for you, for the kid who will take my night shift and inherit my insomnia.

You want a clean story. I can’t give you that. I can give you a runbook, a ladder, a set of rules I wish someone handed me when I was too new to know what I was missing. It is an underground handbook because it’s personal, not official. It is not doctrine. It’s survival.

## The Personal Runbook (What I Do When the Queue Opens)
1. **Read the alert title and breathe.** If you can’t breathe, you can’t think.
2. **Triage fast, write slower.** First ten minutes are for direction; the ticket is for the person you will never meet.
3. **Pivot, then pivot again.** SIEM to EDR to identity, then back. Circular logic keeps you from tunnel vision.
4. **Assume the user is tired, not malicious.** Their fatigue is not your enemy.
5. **Containment is a conversation.** If you can’t justify it, you can’t do it.

## The 30/60/90 Ladder (SOC → IR → Hunting)
- **30 Days:** Learn the tools by repetition. Know where sign-in logs live. Learn three KQL queries cold. Close tickets with evidence.
- **60 Days:** Learn the patterns. Know what a real macro attack looks like. Start documenting tuning ideas.
- **90 Days:** Learn to hunt. Build queries that find what alerts miss. Participate in post-incident review, not just tickets.

## The Checklist I Hate (Because It’s True)
- Did I check the user baseline?
- Did I identify the device and the account?
- Did I look for additional affected assets?
- Did I document the decision with evidence?
- Did I avoid contempt in the ticket?

Here is the rule I hate: **Your tone is part of your containment.** If you write like a judge, people stop trusting you. If you write like a coward, no one will follow you in an incident. Write like a witness.

The night shift is a confessional because it is quiet enough to hear yourself think. It is also a factory because the queue does not care about your inner life. You learn to exist in both. You learn to be the analyst who can close a ticket and the human who can sit with uncertainty.

If you read this, then the work is already moving through you. That’s the only inheritance I have to offer: a set of habits and a voice that says, “I know how this sounds, but do it anyway.”

I decide to include a “night shift heuristics” section because I know you’ll ask for it. These are the small, ugly rules that keep you alive when the queue is breathing down your neck:

- **If an alert scares you, slow down.** Fear makes you skip evidence.
- **If an alert bores you, check for patterns.** Boredom makes you miss the one real signal.
- **If a user is angry, write shorter.** Long notes invite conflict.
- **If you can’t explain it, mark it as low confidence.** Pretending otherwise is how incidents grow.

I also write down the **three queries** I think every new analyst should know:

```kql
SigninLogs | where ResultType != 0 | summarize count() by UserPrincipalName
```

```kql
DeviceProcessEvents | where FileName == "powershell.exe" | project TimeGenerated, DeviceName, ProcessCommandLine
```

```kql
EmailEvents | summarize count() by SenderFromAddress
```

These are not magical. They are a starting point. The point is to give you a shovel.

I add a section on **hand-off discipline**: always include the last action taken, the next expected action, and any open questions. If you leave a question, label it. If you leave an assumption, label it. The day shift will forgive uncertainty more than they will forgive silence.

Finally, I write the line I wish someone had told me: **You are not the hero. You are the witness.** Heroes need applause; witnesses need accuracy. In the night shift, accuracy is a form of mercy.

If you take this handbook and add your own rules, you will be doing the only honest thing: admitting that the work changes you and that you must write the changes down before you forget.

I also include a **skill ladder map** for those who want to grow beyond the queue:

- **SOC Analyst:** Learn triage speed, evidence capture, and clean ticket writing.
- **Incident Responder:** Learn containment strategy, communication under pressure, and root cause analysis.
- **Threat Hunter:** Learn hypothesis-driven queries, long-tail detection, and the patience to find quiet signals.

I write a small section on **self-care**, even though it embarrasses me: “Drink water. Eat real food. Take a five-minute walk between storms.” The job pretends you are a machine. You’re not. Machines don’t feel the moral injury of closing a ticket without certainty.

**Documentation best practice:** Don’t just close tickets; close loops. If you suggested a tuning change, follow up until it is implemented or rejected. The work that isn’t followed up is just theater.

The last line of the handbook is for you, and for me: “If you are still here, it’s because the work matters. The rest is noise.” It’s not a slogan. It’s a boundary.

I add a final page called **“Rules I Hate, Rewritten.”**

- **Rule I hate:** “Trust the alert.”
  - **Rewrite:** “Trust the evidence, then trust your note.”
- **Rule I hate:** “Close fast.”
  - **Rewrite:** “Close clearly.”
- **Rule I hate:** “Never wake anyone.”
  - **Rewrite:** “Wake them for impact, not for noise.”

These are not official rules. They are my survival notes.

The handbook ends with a checklist for the last hour of shift: verify hand-off notes, confirm containment status, check for any alerts that need day shift escalation. It’s the ritual that keeps the night from bleeding into the morning.

If I leave, I want the next analyst to know this: you can be bitter and still be useful. You can doubt yourself and still be accurate. The work doesn’t ask you to be pure, just consistent.

---

CASE FILE: The Underground Handbook (Personal Runbook)
- Signal:
  - Need for a durable, personal runbook after repeated night incidents.
- Context:
  - Hand-off gaps and training gaps identified across shifts.
- Hypotheses (benign vs malicious):
  - Benign: documentation drift from shift to shift.
  - Malicious: missed signals due to inconsistent process.
- Validation steps (first 10 minutes):
  - Review recent tickets for missing evidence.
  - Identify recurring decision points that lack guidance.
  - Draft checklist and ladder for skill progression.
- Evidence captured:
  - Notes from incidents and post-incident review.
  - Common pitfalls observed.
- Decision:
  - Publish personal runbook as training artifact.
- Ticket write-up (concise):
  - “Created personal runbook outlining triage rituals, containment justification, and 30/60/90 skill ladder. Intended to reduce hand-off gaps and improve consistency in night-shift decision-making.”
- Follow-ups / tuning ideas:
  - Share with mentor for review.
  - Convert best practices into formal SOP where appropriate.
