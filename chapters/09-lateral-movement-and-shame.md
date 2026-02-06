# 09 — Lateral Movement and Shame

After the ransomware alert, I can’t pretend the night is normal. Every log looks like a confession. Every failed login looks like a footprint. I am ashamed of how quickly I want to see patterns, because patterns can be inventions as much as evidence.

The new alert is **Remote Service Creation** on a workstation in the engineering subnet. It’s a lateral movement signal, the kind attackers use to move quietly: create a service remotely, run it, disappear. The device was not part of the ransomware event, but it is adjacent in time. That adjacency makes me suspicious. It might be coincidence. Coincidence is how attacks survive.

Here is the rule I hate: **Correlation is not causation, but it’s all we have at 3 a.m.**

**Investigative pivot:** From service creation → account used → origin host. I open MDE and pull the service creation event. The initiating account is the same service account involved in the ransomware server. That’s not coincidence. The origin host is a system I don’t recognize. I pivot to that host’s timeline. It shows a new process using `sc.exe` to create the service. That tool is legitimate; the behavior is not.

KQL for the service creation:

```kql
DeviceProcessEvents
| where FileName == "sc.exe"
| where ProcessCommandLine has "create"
| project TimeGenerated, DeviceName, AccountName, ProcessCommandLine
```

The command line indicates the service is named “Updater” and points to a temp directory executable. That’s a red flag. I check if the executable exists on disk; it does. I check if the hash is known; it is unknown. I check for other devices with the same hash. Two more devices. The attack is moving.

Watch-out: **Do not assume the first affected host is patient zero.** Lateral movement is a ladder. I need a timeline. I build a timeline: earliest service creation, earliest sign-in of the service account, first appearance of the hash. I document the order. This is how we prevent chasing the wrong beginning.

Containment is tricky. The service account is already disabled. Now we isolate the origin host and the two other devices. We also block the hash as an indicator in MDE. Each action is a choice that affects people who are asleep. I do it anyway, and I feel the weight of it.

I call Sofia with the new scope. She confirms: “Treat as active lateral movement. Continue isolation.” Her calmness is a boundary. It keeps me from declaring apocalypse.

Documentation best practice: **Write a timeline.** Write a chronology of actions and events with timestamps. It’s the only way the day shift will see the shape of the incident.

I write the ticket with the timeline, the devices, the hash, the account. I know this is the center of the incident now. The shame is this: I should have caught the service account anomaly sooner. But I didn’t. Now I can only document and contain.

Lateral movement is not glamorous. It looks like the tools we use every day. `sc.exe`, `wmic`, `psexec`—these are how administrators move around. The attacker uses the same doors and calls it stealth.

I check logon events for the service account on the origin host. I’m looking for logon type 3 (network) and type 10 (remote interactive). If I see type 10 from an unusual device, that’s a clue. It’s there: a type 3 logon from a host outside the usual server cluster. That is the fingerprint.

```kql
SecurityEvent
| where EventID in (4624, 4625)
| where Account has "svc-"
| project TimeGenerated, Computer, LogonType, IpAddress
```

Watch-out: **Service accounts are noisy.** They log in everywhere. The trick is to baseline them just like users. I look at the last week for that service account and identify usual hosts. The origin host tonight is not on the list. That’s another data point.

Documentation best practice: **Include the logon type and host in the timeline.** This is how IR correlates movement. A logon type with a host can tell you whether it was a remote session or a service connection.

I feel shame because I want to blame the service account, as if an account can be negligent. But the real failure is that we let a high-privilege account live without enough guardrails. That’s not a night shift fix, but it is a note for the post-incident list.

I also check for new local admin group additions on the affected hosts. Sometimes lateral movement includes adding an account to local admins to persist. There are no additions. That’s good. But I still add a note to monitor for it.

The incident is widening. The shape is clearer now: a compromised service account, lateral movement, persistence. It’s not a mystery anymore. It’s a problem with a known name. That should make me feel better. It doesn’t.

I also check network events for SMB and remote execution. The attacker’s footsteps are loud in the right logs. If I see a burst of SMB connections to admin shares from the origin host, that’s another piece of the ladder.

```kql
DeviceNetworkEvents
| where InitiatingProcessFileName in ("wmic.exe", "psexec.exe", "sc.exe")
| project TimeGenerated, DeviceName, RemoteIP, RemotePort, InitiatingProcessCommandLine
```

The remote IPs map to the two other devices where the hash was found. That is the chain. It isn’t glamorous, but it is a story with direction.

Watch-out: **Do not assume the attacker used only one tool.** Lateral movement often mixes techniques. I check for scheduled task creation on those hosts, and for remote registry access events. None so far. That’s good, but it doesn’t end the search.

Documentation best practice: **Create a pivot map.** I write a simple list: Host A → Host B via sc.exe; Host B → Host C via SMB. It’s crude, but it keeps the narrative from falling apart in the morning.

The shame here is personal: I’m learning how to tell a story about an intruder, but I still don’t know their name or their face. I only have their patterns. It’s enough to act, but it’s not enough to satisfy the part of me that wants a villain. There is no villain, only behavior.

I add a tiny “confidence note” in the ticket: “Confidence: medium-high due to linked service account and matching hash.” It seems trivial, but it helps the next shift decide whether to expand scope or to pause. Confidence is a currency; you should declare how much you have.

---

CASE FILE: Remote Service Creation
- Signal:
  - MDE alert for remote service creation on engineering workstation.
- Context:
  - Initiating account matches compromised service account; suspicious service binary in temp.
- Hypotheses (benign vs malicious):
  - Benign: remote admin tool (unlikely given temp binary).
  - Malicious: lateral movement via service creation.
- Validation steps (first 10 minutes):
  - Review service creation command line and binary path.
  - Identify initiating account and origin host.
  - Check hash reputation and prevalence.
  - Build quick timeline of first occurrences.
- Evidence captured:
  - Command line and service name.
  - Hash and affected device list.
  - Timeline of events.
- Decision:
  - Isolate affected devices; block hash; escalate as active lateral movement.
- Ticket write-up (concise):
  - “Remote service creation detected using sc.exe with service name ‘Updater’ pointing to temp binary. Initiating account matches compromised service account. Hash unknown; found on 3 devices. Isolated devices and blocked hash; escalated to IR.”
- Follow-ups / tuning ideas:
  - Add detection for service creation from non-admin hosts.
  - Enhance monitoring for temp-directory service binaries.
