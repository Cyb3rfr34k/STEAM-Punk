# 05 — Phishing Is a Mirror

If you want to understand a person, watch what they click when they are tired. If you want to understand a company, watch what it calls “urgent.” The phish alert comes in with a user report, which means it is already half true. Someone was scared enough to hit the “report phish” button. That fear is part of the evidence.

The user is Alex Imani again. You see why I can’t quite hate them. They are not careless; they are overwhelmed. The email says “Invoice correction” with a link. There is a mailbox rule created twenty minutes later that forwards messages with “invoice” in the subject to an external address. That is the mirror. We teach users to report phish, and then we punish them for being busy.

Let me be unfair for a second: I want to tell them to read. I want to blame the click. But the real failure is in the way we expect people to be vigilant forever. Humans are bad at forever.

**Alert pattern:** User-reported phish + new inbox rule. The pairing is a spine for a story. Either the user is cautious and we are safe, or the user clicked and the attacker created the rule to hide replies.

**Investigative pivot:** From the phish report → email headers and link → mailbox rules and recent logins. I open Exchange Online message trace. I look at the sender domain. It’s a lookalike, a letter off. I check the URL in a safe browser (no clicking). It’s a credential harvest page, bare bones, hosted on a suspicious domain.

I open the mailbox rules. There it is: “If subject contains ‘invoice,’ forward to external address, mark as read.” That’s not a rule a normal person makes. I know how this sounds. But I know how it smells.

KQL isn’t the star here; the mail system is. Still, I drop a query in Sentinel to see who else got the email:

```kql
EmailEvents
| where Subject has "Invoice correction"
| project TimeGenerated, RecipientEmailAddress, SenderFromAddress, NetworkMessageId
```

Four recipients. Two reported it. One clicked. One is still asleep. The night shift is a strange kind of mercy.

Watch-out: **Do not assume mailbox rules are the only persistence.** Attackers also use OAuth consent and forwarding addresses outside of rules. Check both. So I look for recent OAuth consent events for Alex. None. I check if the forward address is external; it is. I disable the rule and flag the account for a password reset.

Mara tells me to be careful here: disabling a rule is a containment action. We should note it. We should notify the user. We should notify the IR lead if we see evidence of compromise. The evidence is the rule itself and the click. This is enough for a medium, maybe a high if the forwarded mail is sensitive.

I call Alex. They are embarrassed. I tell them, “This happens. We’re fixing it.” I do not mention the rule. I do not want to make them feel like a criminal. I ask if they entered credentials. They pause. They say yes. That pause is an admission and a relief.

Here is the documentation best practice: **Write what you did, not what you wish you did.** I write down that I disabled the rule, forced a password reset, and initiated token revocation. I note the time. I note the external address. I note the number of recipients.

We contain the account and we watch the sign-ins for the next 24 hours. There is no exfiltration evidence, but I can’t prove there wasn’t. I close the ticket with a knot in my stomach. The knot is always there when the incident touches a human face.

I open the headers and pretend I don’t hate them. The truth is that I do; they’re a wall of technical bureaucracy. But you only need a few lines to tell a story: SPF, DKIM, DMARC. If all three pass, you still don’t trust the message. If all three fail, you trust your instincts more. Tonight, SPF fails and DKIM is missing. That’s enough to feel the heat.

The URL is shortened. Shortened URLs are a coin flip: sometimes harmless, sometimes malicious. I expand it in a safe environment and see the destination. It’s a fake login page with a company logo scraped from the web. The page is too clean. Phish pages are often overconfident in their simplicity.

**Investigative pivot:** I check for other recipients and then the click events. If the phish was targeted, it might be only Alex. If it was broad, we might have to do a wider search. The message trace shows four recipients. Only one clicked. That one is Alex. It is always Alex. (Yes, I know this sounds unfair.)

I check Exchange for auto-forward settings outside of explicit rules. There are “forwarding addresses” that can be set without a rule. That’s where attackers hide if they are clever. There are none.

Watch-out: **Phish reports can be delayed.** The message might have been sitting for hours. That means the attacker might already have the credentials. So I check the sign-in logs for unusual activity after the click. I also check for app consent grants. No anomalies. Good.

Documentation best practice: **Capture the network message ID and sender details.** This is the key for future searches. I include it in the ticket, along with the suspicious domain and the external forward address. I mark the time the rule was created. If IR wants to trace it later, they’ll need these exact values.

I send a message to the day shift with the details. I don’t want to wake them, but I don’t want this to disappear into the closed ticket abyss. The day shift has more resources to run deep searches, to hunt for similar domains, to update block lists. My note is the handoff.

Phishing is a mirror because it reflects our habits. It shows the words we think are urgent, the colors we think are official, the shortcuts we take. It also reflects our compassion. If we shame users, they stop reporting. If they stop reporting, we go blind. That is the real threat.

I also check for safe attachments or detonation results, when available. If the attachment was detonated and marked malicious, that’s a clean signal. If it was marked safe, I still don’t trust it. Sandboxes miss things. But they help me decide how hard to lean on the evidence.

**Investigative pivot:** I search for the sender domain in historical mail logs. If this sender has tried before, it’s a campaign. If it’s new, it might be a targeted attempt. I add the domain to a watchlist for the next 48 hours.

Watch-out: **User reports can be incomplete.** Sometimes they forward a screenshot, not the message. That’s why we ask them to use the report button. It preserves the headers. I note in the ticket whether the report included full headers. If it didn’t, I document the limitation.

Documentation best practice: **Note remediation actions clearly.** I record the rule deletion, password reset, session revocation, and user notification. These are not just actions; they’re commitments we may need to prove.

---

CASE FILE: User-Reported Phish with Suspicious Inbox Rule
- Signal:
  - User-reported phishing email; new mailbox rule created shortly after.
- Context:
  - Subject “Invoice correction”; external sender with lookalike domain.
- Hypotheses (benign vs malicious):
  - Benign: user-created rule (unlikely given pattern).
  - Malicious: credential harvest leading to malicious forwarding rule.
- Validation steps (first 10 minutes):
  - Review email headers and URL in safe preview.
  - Check Exchange mailbox rules for recent changes.
  - Search for other recipients using EmailEvents.
  - Review recent sign-ins for anomalous access.
- Evidence captured:
  - Message trace details and sender domain.
  - Screenshot/note of mailbox rule.
  - List of recipients and report status.
- Decision:
  - Contain: disable rule, reset password, revoke sessions.
- Ticket write-up (concise):
  - “User-reported phish with subject ‘Invoice correction.’ Lookalike sender domain; URL leads to credential harvest page. New mailbox rule forwards ‘invoice’ mail to external address; user confirmed entering credentials. Disabled rule, forced password reset, revoked sessions; monitored sign-ins.”
- Follow-ups / tuning ideas:
  - Add detection for forwarding rules to external domains.
  - Enhance user training on lookalike domains.
