# 03 — The SIEM Confessional

I talk to the SIEM the way some people talk to a priest: not because I believe it can absolve me, but because I believe it will remember. Sentinel does not forgive; it correlates. It holds my confession and measures it against everyone else’s.

The alert is **Impossible Travel**, which is cruelly romantic for a log entry. It says the same user signed in from two places too far apart, too fast. It is a lie detector that doesn’t understand airports, VPNs, or tired people using a phone on one network and a laptop on another.

The user is not Alex this time. It’s a finance analyst, Dana, who logs in from “Chicago” and then “Berlin” within ten minutes. If I were a novelist I could make that mean something; I am a SOC analyst, which means I have to make it mean evidence.

Here is the rule I hate: **Anomalies are not incidents.** Anomaly is a smoke alarm; you still need to find the fire.

I open Entra ID sign-in logs and look at the fields most people skip: the app, the client, the device ID, the authentication details. I check the “Device” column. I check the “Conditional Access” status. I check if the sign-in was interactive or not. Every field is a confession; you just have to read it like a detective instead of a poet.

KQL, short and merciless:

```kql
SigninLogs
| where UserPrincipalName == "dana.kerr@company"
| project TimeGenerated, IPAddress, Location, AppDisplayName, ClientAppUsed, DeviceDetail
| order by TimeGenerated desc
```

The Berlin sign-in is a non-interactive token refresh. That matters. It means something was already logged in. It might be a mobile app talking to a service. It might be a device in a data center. It might be the kind of benign which is just another word for “not proven malicious.”

I look for the user’s baseline. This is the part of the job I pretend not to like because it feels invasive. But it’s our version of empathy. I check previous days, I check the usual countries, I check if Dana uses a corporate VPN that exits in Europe. There’s a hint of that: a cluster of similar sign-ins during a previous week, all with the same app.

Mara calls this “event anatomy.” You separate the bones: **Who** logged in, **Where** from, **What** app, **How** (client type), **When**. The rest is noise.

**Investigative pivot:** If the sign-in is suspicious, pivot to associated device activity. If the device is unknown or risky, pivot to account activity (mailbox rules, OAuth consent). I open MDE for the device ID. It’s a known corporate laptop. No alerts. I then check for risky sign-in or user risk in Entra. Nothing.

So why did the alert fire? Because the system is conservative. Because it would rather annoy me than miss a compromise. Because I am not allowed to forget that people can be in two places at once now, thanks to VPNs.

Watch-out: **Do not rationalize a sign-in you don’t understand.** If you can’t explain the app or the device, say so in the ticket. Mystery is not a failing; it’s a fact.

I write the ticket note and I am honest about the weakness: “No risky sign-in indicators; non-interactive token refresh from known app; user baseline shows similar VPN egress. No evidence of compromise. Closed as benign but monitor for recurrence.” It is a confession to my future self: I did not solve the universe, I only looked under the mat.

The night shift teaches you to live with incomplete stories. That might be its only true lesson. It’s not satisfying. It’s honest.

I look at the IP reputation, even though I tell myself not to. Reputation feeds are like gossip: useful, biased, and loud. The IP in Berlin has no reputation hits, no previous incidents. That is not exoneration; it is context. The lack of reputation is a hollow defense, but it’s what we have.

I add enrichment fields to the sign-in log query: risk state, MFA requirement, conditional access policy name. Those fields are the difference between a narrative and a conclusion. If conditional access says “Success,” it means the policy didn’t block it. If it says “Report-only,” it means we watched it happen and did nothing. That’s a different kind of guilt.

```kql
SigninLogs
| where UserPrincipalName == "dana.kerr@company"
| project TimeGenerated, IPAddress, Location, RiskState, ConditionalAccessStatus, AppDisplayName
| order by TimeGenerated desc
```

The data says “none” for risk state. The policy is in report-only. I make a note for the day shift: consider enforcing the policy. The enforcement is not my decision, but the recommendation is.

I also check for a pattern in device IDs. If the same device ID appears across the locations, it’s likely a VPN or a device check-in. If a different device appears, it might be an attacker. The device ID is the same. That’s a strong point in the benign argument.

Documentation best practice: **Explain your confidence level.** I add a line: “Confidence: medium, based on non-interactive refresh and known device ID.” It gives the next person a sense of how shaky the bridge is.

I wish I could tell you I always do this. I don’t. Sometimes I’m lazy. Sometimes I want the alert to disappear. But if I can’t be perfect, I can be consistent. Consistency is the only defense against night shift entropy.

The confession continues: I am not just checking logs, I am checking my own bias. I am always tempted to call it benign because that is easier. So I force myself to imagine the opposite. If it were malicious, what would I see? I would see a new device, a risky sign-in, an anomalous app consent. I see none of those. That is the only reason I close it.

You wanted a lesson? It’s this: **Baseline is a verb, not a noun.** You must keep baselining, you must update it, you must question it. The moment you think a baseline is permanent, you are already behind.

I also check the time zones, because time zones lie. An impossible travel alert can be triggered by the same location if the system interprets timestamps differently. It’s rare, but it happens. I compare the sign-in timestamps with the device’s last check-in. If the device check-in is at the same time, it’s another point for benign.

**Investigative pivot:** Look for companion alerts. If the user had an impossible travel and also triggered a “risky sign-in” or “anomalous token” alert, the combination changes the severity. I scan for those in Sentinel. There are none. That matters.

Watch-out: **Don’t ignore time gaps.** If the alert is stale—say, hours old—then the user may have already changed their password, or the attacker may already have moved. I note the alert age in the ticket. It tells the next analyst how urgent the follow-up is.

Documentation best practice: **Record the fields you rely on.** I write in the ticket: “Decision based on non-interactive refresh, same device ID, and prior VPN pattern.” This makes it possible to audit my reasoning later.

I also check the device risk level in MDE and compare it to the identity risk in Entra. If both are elevated, that’s a signal stronger than the impossible travel itself. If both are low, the alert feels like a training exercise. Tonight, both are low. That doesn’t mean safe, but it lowers the temperature.

**Investigative pivot:** I look for unusual OAuth app consents, because impossible travel sometimes pairs with a suspicious app registration. The logs show none. The absence is another small weight on the benign side.

Watch-out: **Travel anomalies can be caused by corporate proxies.** If the company uses a proxy that egresses in another region, the alert will fire. We keep a list of proxy IPs for that reason. I check the list. The IP isn’t there, which is why I stayed with the investigation.

Documentation best practice: **Note which baselines you used.** I include “baseline from last 7 days of sign-ins” in the ticket. The day shift will know the context window and can decide if it’s adequate.

---

CASE FILE: Impossible Travel
- Signal:
  - Entra ID alert for impossible travel sign-in.
- Context:
  - User logged in from Chicago then Berlin within 10 minutes; Berlin event non-interactive.
- Hypotheses (benign vs malicious):
  - Benign: VPN egress or token refresh from cloud service.
  - Malicious: session hijack or compromised credentials.
- Validation steps (first 10 minutes):
  - Review sign-in details (interactive vs non-interactive, app, device).
  - Check user risk/risky sign-ins.
  - Compare to user baseline for similar locations.
  - Pivot to MDE device timeline for alerts.
- Evidence captured:
  - Sign-in log entries with client and device details.
  - Baseline note showing prior VPN egress pattern.
- Decision:
  - Close as benign, with monitoring note.
- Ticket write-up (concise):
  - “Impossible travel alert for dana.kerr. Berlin sign-in is non-interactive token refresh from known app; similar VPN egress observed in prior week. No risky sign-in indicators or MDE alerts. Closed as benign; monitor if pattern changes.”
- Follow-ups / tuning ideas:
  - Review VPN egress location mapping.
  - Consider suppressing non-interactive sign-ins for known app.
