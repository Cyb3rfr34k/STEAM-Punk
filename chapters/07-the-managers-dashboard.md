# 07 — The Manager’s Dashboard

Devin Knox calls it the “health view.” It’s a dashboard with a heartbeat line and a list of alerts, green and red squares like a small, cruel game. He stands in front of it during day shift meetings, pointing at closure times. The night shift is not a team to him; it is a line on a chart.

The alert storm hits at 11:58 p.m., just as the office empties. A misconfigured rule turns every failed login into a “high” severity. Twenty-five alerts in fifteen minutes. The queue is a flood. The dashboard is a siren.

You want a clean story. I can’t give you that. Here’s the mess: high volume and low quality. The storm is real, but the weather is not. If I chase each alert individually, I’ll drown. If I close them in bulk, I’ll be accused of gaming metrics. The manager’s dashboard watches the numbers more than the truth.

Here is the rule I hate: **Batching is survival, but it looks like cheating.** You must document why you batch or you will be accused of laziness.

**Investigative pivot:** From volume → root cause → sample analysis. I take a sample of five alerts and compare them. Same source IP, same result codes, same application. The IP is the corporate VPN gateway. People are mistyping passwords, or the gateway is retrying with stale credentials. It’s noise. Still, noise can hide a signal.

KQL I use to find the pattern:

```kql
SigninLogs
| where ResultType != 0
| summarize count() by IPAddress, AppDisplayName
| order by count_ desc
```

The IP with the highest count is the VPN. There is no evidence of spray across many users, just repeated retries. I confirm by checking a handful of users. All have similar patterns, all with eventual success, all in the same time range.

This is where I pivot into tuning. I can’t change the analytic rule tonight, but I can document the cause and suggest a change: suppress alerts for the VPN gateway when the failures are followed by a success within five minutes. That’s not perfect, but it’s a start.

Watch-out: **Metrics can make you hostile to the truth.** If you close too fast, you train the system to expect speed, not accuracy. I fight this by writing a “storm summary” ticket, linking the related alerts, and then closing them with consistent notes. The note is what saves me later when Devin asks why we closed twenty-five “high” alerts in fifteen minutes.

I keep one alert open and investigate deeper, just to prove I’m not sleeping. It turns out to be another false positive. The point isn’t that I found something. The point is that I tried.

The meeting the next day is brief. Devin is satisfied with the closure rate. He does not ask about the tuning recommendation. I email it anyway. I don’t know if he reads it. The dashboard doesn’t care about my sleep, but it might care about my small acts of rebellion.

The alert storm is also an opportunity to be lazy, which is why it’s dangerous. You can close everything and claim victory. Or you can try to see the shape of the storm. The shape tells you whether it’s noise or the cover for something real.

I build a quick grouping view: by IP, by user, by failure reason. I use the results to convince myself that the VPN gateway is the culprit. But I also look for the outlier: a single user with failures from an external IP. That outlier is the one you keep open. The storm is the background; the outlier is the signal.

```kql
SigninLogs
| where ResultType != 0
| summarize count(), dcount(UserPrincipalName) by IPAddress, ResultDescription
| order by count_ desc
```

The top result is the VPN gateway with “invalid password.” There is no outlier. That’s a relief and a trap. The trap is complacency. So I choose one alert and investigate it anyway, like a ritual offering. It’s benign, but the act keeps me honest.

Watch-out: **Batching without narrative creates distrust.** If you close 25 alerts with the same one-line note, the day shift will assume you didn’t look. So I write a summary ticket that links all alert IDs and includes a sentence explaining the analysis. It’s the paperwork that makes batching legitimate.

Documentation best practice: **Use consistent tags.** I tag the alerts with “storm-vpn” so we can filter later. It helps with reporting and with tuning. The manager’s dashboard loves tags. I exploit that love for truth.

During the day shift meeting, Devin praises the closure times and asks if we can sustain them. I say, “Only if we tune the rule.” He nods like he agrees, but his eyes are on the chart. I email the tuning recommendation again. I feel like I am sending messages into a storm.

The night shift is where metrics are made. If you don’t defend your methods, the metrics become your master. I’m not good at defiance, but I am good at documentation. So I write as if someone will ask me why, because they will.

I use a technique Mara taught me: **triage batching with accountability.** You don’t just close in bulk; you prove the bulk is a single phenomenon. I create a parent ticket called “VPN failure storm,” and then I link each child alert. The parent includes the KQL, the analysis, and the tuning recommendation. The child tickets each include a one-line reference to the parent. It feels ceremonial, but it keeps the chain of evidence intact.

I also document the false-positive pattern in a small internal wiki entry. It’s not official, but it helps the next analyst understand why the storm happened. The wiki is where I put the patterns that are too trivial for a post-incident review but too common to ignore.

Watch-out: **When you batch, you risk missing a parallel incident.** To counter this, I pick a random outlier and investigate it independently. I don’t pick the biggest or the easiest. I pick the weird one. That’s the only way to stay honest.

I add a note about “queue hygiene.” If a storm is expected (e.g., scheduled maintenance), the day shift should pause the rule or lower severity. If they don’t, the night shift should file a request. I put that in the ticket because, frankly, it’s the only place anyone reads.

The manager’s dashboard is not evil. It’s blind. It measures what is easy: closure time, count, severity. It doesn’t measure clarity. So I do. I add a “clarity score” to my notes: a short statement of how confident I am and why. It’s a small rebellion. It reminds me that I am not just a metric.

---

CASE FILE: High-Volume Failed Logins (Alert Storm)
- Signal:
  - Surge of failed login alerts across multiple users.
- Context:
  - Spike correlated with corporate VPN gateway retries.
- Hypotheses (benign vs malicious):
  - Benign: VPN retry loop / mistyped passwords.
  - Malicious: password spray targeting multiple users.
- Validation steps (first 10 minutes):
  - Sample alerts for common IP and app.
  - Check for spray pattern across users.
  - Look for success after failures.
  - Verify IP ownership (VPN gateway).
- Evidence captured:
  - KQL summary showing top IP and app.
  - Notes on sampling results.
- Decision:
  - Close as benign noise; create storm summary ticket.
- Ticket write-up (concise):
  - “Alert storm due to failed logins from VPN gateway. Sampled 5 users; failures followed by success within minutes; no spray pattern from external IPs. Closed with storm summary; recommend tuning rule for VPN retries.”
- Follow-ups / tuning ideas:
  - Add suppression for VPN gateway with quick success.
  - Implement alert grouping to reduce noise.
