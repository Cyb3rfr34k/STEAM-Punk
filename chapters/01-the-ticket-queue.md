# 01 — The Ticket Queue

The queue is a mouth that never closes. It opens wide at 2:06 a.m., yawns in the blue light, and tells me that it is hungry again. I am not special enough to be the meal; I am the fork.

You want a clean story. I can’t give you that. The first thing I learned is that the queue does not care about a beginning or an ending. It wants a middle. It wants the part where you pretend to know what to do. It wants timestamps and confident verbs. When I drag the first alert into “In Progress,” I feel like I have lied to a machine.

Let me be unfair for a second: I love this job because it lets me be a coward in public. I hide behind tickets. I get to say “signal,” “artifact,” “baseline.” I get to be a person who speaks in careful nouns instead of feelings. It’s the only place where my lack of certainty is considered professional.

The alert that barks at me is the kind the system sends when it’s bored: **Multiple Failed Logins Followed by Success**. There’s a rhythm to it, like a child banging on a door before a parent finally opens it. Fourteen failures, one success, over a span of six minutes. The user is Alex Imani. They are a recurring phrase in my night shift, a name I can’t decide whether to resent or protect.

Here is the rule I hate the most: **The first ten minutes matter more than the next ten hours.** Write this down, even if you hate it. In those first ten minutes you can kill the whole thing in an instant or let it drag like a bad confession.

So I start with the ritual. Step one: open the Entra ID sign-in logs. Step two: mark the source IPs, the location, the client. Step three: look for the “risk” field. It’s all layout and posture, you know? A human can pretend to be calm; a log can’t. If the log is scared, it says so.

KQL that I keep in a sticky note, because otherwise I forget what I am looking for:

```kql
SigninLogs
| where UserPrincipalName == "alex.imani@company"
| where ResultType != 0
| project TimeGenerated, IPAddress, Location, AppDisplayName, ResultDescription
| order by TimeGenerated desc
```

There is a story in the results. Fourteen failures from an IP in the same city. A success right after. App display: “Office 365.” Client: “Browser.” No risky sign-in tags. The logs are dull, which is a kind of gift.

Now I have to be brave about the next step: I pivot to MDE. The queue wants me to believe the account did something after the success. So I search the device timeline for Alex’s primary device. I check recent alerts. I check sign-ins. I check because I do not want to be the kind of analyst who only looks where the alert points.

Nothing. That is also a story. It says, “You are not needed.” But I’m not convinced. I never am. The day shift will have a meeting tomorrow, with coffee and clarifying questions. I will have a ticket with a summary and a single line of reasoning. My words will be their memory.

This is where I am supposed to tell you about baselining, and how to do it without worshiping the average. The baseline is not what usually happens; the baseline is what usually happens **for this person**, on this night, in this season of their life. Alex is an operations coordinator. They often sign in from a home IP. The home IP is sometimes a VPN IP, sometimes not. The system tags the country as the same. The failures could be a tired password, a dog on the keyboard, a phone with a sticky screen. The success could be a reset. The logs are indifferent.

Watch-out: The metric trap. The dashboard wants “time-to-close.” It wants a little dopamine line on the chart. It wants me to call this a false positive and move on. But time-to-close is not the same thing as time-to-understand. Sometimes the best ticket is a slow one. Sometimes the worst ticket is a fast lie.

I can feel the night in my joints. I can feel my own bias leaning toward closure. So I force myself to do one more pivot. I check other sign-ins in the same time range for the same IP. I’m looking for spray behavior: multiple users, same address, same failures. If I see that, the story changes. It would become a password spray. It would become a scene.

The IP appears once. Just Alex. Just a bored, forgetful, living person.

I’m going to close it. I don’t want to. It makes me feel like a thief. You want a moral: if you can’t prove a crime, don’t invent one. There. That’s a clean line. It’s also a lie. The truth is that I close it because the night shift needs me to, because I need to sleep, because the queue is still hungry. I close it because the logs are silent and I am tired of interrogating the silence.

This is the small moral injury. Not the absence of certainty but the repetition of it. The quiet guilt of being right for the wrong reason.

I write the ticket note the way Mara taught me: tight and boring. She says the note is a bridge between shifts, a handrail for someone who doesn’t know your panic. I write it anyway.

You’ll ask if this makes me a good analyst. I won’t answer. There are no good analysts, just exhausted ones who leave enough evidence for the next person to disagree with them.

I keep a paper notebook even though the queue is digital. It’s a superstition. The notebook is where I write my “first ten minutes” checklist, the one I pretend not to need:

1. **Confirm the alert name and the time.** A misread timestamp will ruin your night.
2. **Check identity context.** User, device, location, authentication method.
3. **Look for friends.** Are other users hit in the same window?
4. **Check endpoint health.** Any related MDE alerts, any suspicious processes.
5. **Write a single sentence summary before you do anything else.** If you can’t summarize, you don’t understand it yet.

I read the steps out loud sometimes, a whisper into the empty room. I know how this sounds. But the room doesn’t judge me; the ticket will.

The queue is not just a list; it’s a shaping force. It makes you think in categories. It makes you believe you can sort events into “malicious” and “benign” the way you sort laundry. That belief is convenient and false. Most of what we do is re-label ambiguity.

For this alert, I check the **authentication method** field. Was it password-only, MFA, or something else? If MFA wasn’t required when it should have been, that’s a different kind of investigation: a policy gap, not just a failed login. I check conditional access results in the log. It passed. That’s a data point.

Another small pivot: I check whether the IP is a known VPN range. We keep a list. It’s messy and out of date. I still check. I run a quick query against the watchlist:

```kql
let vpnIps = _GetWatchlist('KnownVPNRanges') | project IPAddress;
SigninLogs
| where UserPrincipalName == "alex.imani@company"
| where IPAddress in (vpnIps)
| project TimeGenerated, IPAddress, ResultType
```

It returns one hit in the previous week. It’s not conclusive, but it’s a piece of context. Context is the only currency we have at 2 a.m.

I take another look at the failure reasons. Sometimes the failure tells you more than the success. “Invalid username” suggests spray; “user locked” suggests policy. Here the description is “invalid password,” which is the most boring, most human reason. Boring is a kind of evidence.

Documentation best practice: **Timestamp your own actions, not just the event.** I note the time I reviewed the logs, the time I checked MDE, the time I completed the ticket. This is not to satisfy a manager. It is to protect a timeline. If the incident grows later, my notes become a witness statement.

You can see how much of my job is about writing a story I don’t fully believe. The ticket is a narrative, a set of facts arranged to justify a decision. I’m not immune to the moral injury of closing something without certainty. I just keep the injury small by leaving evidence behind.

Mara once said: “If you close it, leave a breadcrumb for the next person to reopen it.” That’s what I do. I leave the query, the IP, the thought process. I leave my doubt, folded neatly into the summary.

I also keep a **micro-template** for ticket notes. It’s not the official template; it’s the skeleton I can write when my brain is foggy:

- What happened (one sentence).
- What I checked (two bullets).
- What I found (one sentence).
- What I decided (one sentence).
- What to watch (one sentence).

It reads like a confession, which is why it works. It keeps me from writing a novel when the next alert is already barking.

Sometimes I force myself to write the “what to watch” even when there’s nothing to watch. It makes me admit what I don’t know. The other shift appreciates that. They might not like me, but they will know where I left off.

This is the quiet truth: the queue teaches you to respect the next analyst more than the manager. The manager wants metrics; the next analyst wants clarity. I choose clarity, even when it costs me a few minutes on the dashboard.

---

CASE FILE: Multiple Failed Logins Followed by Success
- Signal:
  - Entra ID alert for repeated failures followed by a success on the same user.
- Context:
  - User is Alex Imani; sign-ins originate from local city IP; no risky sign-in flags.
- Hypotheses (benign vs malicious):
  - Benign: user mistyped password or VPN session mismatch.
  - Malicious: password spray or credential stuffing on a single account.
- Validation steps (first 10 minutes):
  - Review Entra ID sign-in logs for IP, location, client app.
  - Check risky sign-in indicators.
  - Pivot to MDE for device alerts/timeline after login.
  - Search for other failed logins from the same IP against other users.
- Evidence captured:
  - KQL sign-in query results with timestamps and IP.
  - Note of MDE timeline check (no related alerts).
- Decision:
  - Close as benign, no additional containment.
- Ticket write-up (concise):
  - “14 failed logins followed by success for alex.imani. IP geolocated to local area; no risky sign-ins. No correlated MDE alerts. No spray behavior from IP. Closed as likely password/VPN mismatch; monitor for recurrence.”
- Follow-ups / tuning ideas:
  - Add conditional logic to reduce alerts for known VPN IP ranges.
  - Track repeat patterns on the same user for future escalation.
