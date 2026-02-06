# 06 — The Login That Wasn’t

The alert says **MFA Fatigue**. I hate the name because it sounds like an excuse for someone else’s harassment. But the point is clear: repeated push approvals, a user who finally taps “Approve” just to make the noise stop. It’s not brute force, it’s persuasion. The attacker doesn’t kick the door; they ring the bell until you open it.

This time the user is not Alex. It’s an engineer, Jordan, whose account gets a flurry of MFA prompts at 1:50 a.m. They report it as a problem. That’s good. But then there is a successful sign-in at 1:54 a.m. That’s bad. You can’t tell if it’s Jordan logging in for real or Jordan surrendering to the prompts. Either way, the login is suspect.

Here is the rule I hate: **Identity incidents spread faster than you can type.** If it’s a token, it moves without a network trace. If it’s a password, it moves into every system attached to that identity. You must act fast but not stupid.

**Investigative pivot:** From sign-in alert → user contact → session revocation. I check Entra ID sign-in logs. The successful sign-in is from a new IP, new device. The authentication method shows MFA approved. That could be Jordan. That could be the fatigue attack working.

KQL again, simple and cold:

```kql
SigninLogs
| where UserPrincipalName == "jordan.lee@company"
| project TimeGenerated, IPAddress, Location, AuthenticationDetails, DeviceDetail
| order by TimeGenerated desc
```

I call Jordan. They are awake. They say they got a lot of prompts. They say they hit “approve” because they thought it was their VPN reconnecting. That sentence is a crime scene. It tells me the login is compromised.

Containment is the next step. I go to Entra ID and revoke sessions. I reset the password. I disable the account temporarily. This is a forceful thing to do to a person at night, and I do it anyway. I notify the IR lead with a concise summary. Sofia responds with a single word: “Proceed.” That’s the closest thing we get to comfort.

Watch-out: **Don’t forget downstream systems.** A compromised identity means potential access in Exchange and cloud apps. I check the mailbox for new forwarding rules and for sign-in activity after containment. I check app consent grants. No suspicious consents. The scope feels limited, but I don’t trust the feeling.

I document every action: time of session revoke, password reset, and account disable. This is the documentation best practice the manager wants: “Actions taken.” It’s also the only defense if someone asks why Jordan couldn’t log in during an overnight deploy.

I keep thinking about the word “fatigue.” I am tired of us blaming the human who was dragged into the attack. The system should not keep asking. We should design it to fail safe. But I’m a night analyst, not a philosopher. I get to feel guilty and then move on.

The difference between MFA fatigue and token replay is subtle in the logs and enormous in the impact. Fatigue means someone pressured a human. Token replay means the attacker bypassed the human entirely. In the first case, the fix is education and policy. In the second, the fix is revocation and hunting.

So I check the sign-in details for “token type” and “user agent.” If the user agent is a normal browser string, it could still be malicious, but it’s less likely to be a bot. If the user agent is empty or generic, that’s a red flag. Tonight, the user agent looks like a normal browser. That doesn’t save us, but it gives us a clue.

I also check if the authentication method shows “MFA satisfied by token.” That line is a tell. If it does, it suggests a session was reused. It doesn’t, so I lean toward fatigue rather than replay. But I do not write “fatigue” as a conclusion. I write “suspected MFA fatigue based on user confirmation.” That’s the difference between evidence and assumption.

**Investigative pivot:** I check the sign-in IP against known corporate VPN ranges. It’s not in the list. I check the geolocation. It’s a different city than Jordan’s usual. That is another point for compromise. I check the risk detections list. There is a “unfamiliar sign-in properties” detection. That is enough to justify containment.

Watch-out: **Don’t forget to revoke refresh tokens.** Password resets are not enough if a refresh token is already stolen. I make sure to revoke sessions in Entra. I write it down. I also note the time so we can correlate any later sign-ins to whether they occurred before or after revocation.

Documentation best practice: **Record user statements.** “User reported repeated prompts and approved once.” That is evidence, not gossip. It helps the day shift understand why we acted aggressively.

I send a message to Jordan with a brief explanation and a link to training on MFA number matching. It’s not a lecture, it’s a lifeline. If we can reduce fatigue, we reduce the success of this attack pattern.

I still feel like I’m punishing someone who was already harassed. But I’ve learned that containment is not a moral verdict. It’s a technical boundary. I say that to myself like a prayer.

Identity incidents are about speed and sequence. If you revoke sessions after a password reset, the attacker might still have a token. If you revoke before the reset, the attacker may just reauthenticate with the stolen password. So the order matters. I reset the password, then revoke sessions, then disable the account if necessary. I write the order down.

**Investigative pivot:** I check for app passwords or legacy protocols. If the account had an app password, it can bypass MFA. I check the user’s legacy auth settings. There are none. That’s a relief, but I note it.

Watch-out: **Do not ignore “successful” sign-ins after containment.** They might be cached token activity. I monitor the sign-in logs for an hour after containment to ensure no new sessions appear. It’s a small vigil.

Documentation best practice: **Include containment rationale.** I note that containment was triggered by user confirmation of MFA fatigue and new IP/device. This is the reasoning someone will want to see when Jordan complains about an overnight lockout.

There is a small ritual I do after containment: I check the user’s recent sign-out activity and device registrations. If a new device appeared in Entra within the last 24 hours, it could be the attacker registering a device to maintain access. Tonight there are no new device registrations. I note it anyway.

I also review the “last sign-in” timestamp for critical apps: Exchange Online, SharePoint, and any finance systems tied to the user’s role. If I see access to those apps from the suspicious IP, the severity increases. I don’t see it. That gives me a sliver of peace.

Watch-out: **Users can be embarrassed and under-report.** I ask Jordan twice, in different words, whether they entered credentials into any prompt or website. They say no, then pause, then say they might have. I record the uncertainty. It matters more than a clean answer.

Documentation best practice: **Use neutral language when describing user actions.** “User reported approving prompts due to VPN assumption” is better than “User mistakenly approved.” The tone keeps the focus on the event, not the person.

---

CASE FILE: MFA Fatigue / Repeated Push Approvals
- Signal:
  - Multiple MFA push notifications followed by successful sign-in.
- Context:
  - User reported prompts; sign-in from new IP and device.
- Hypotheses (benign vs malicious):
  - Benign: user re-authenticated for VPN.
  - Malicious: attacker using stolen password + MFA fatigue.
- Validation steps (first 10 minutes):
  - Review sign-in logs for IP/device changes.
  - Contact user to confirm MFA prompts.
  - Check for risky sign-in flags and user risk.
  - Search for mailbox rule changes or OAuth consents.
- Evidence captured:
  - Sign-in log entry showing new IP and MFA approval.
  - User confirmation of repeated prompts.
- Decision:
  - Contain identity: revoke sessions, reset password, temporarily disable account.
- Ticket write-up (concise):
  - “User reported MFA spam; successful sign-in from new IP/device after repeated prompts. User admitted approving due to VPN assumption. Revoked sessions, reset password, temporarily disabled account. No suspicious mailbox rules or OAuth consents found.”
- Follow-ups / tuning ideas:
  - Recommend number-matching MFA or prompt throttling.
  - Monitor for repeat attempts from same IP.
