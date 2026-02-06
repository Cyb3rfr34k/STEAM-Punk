# 08 — Ransomware as a Moral Lecture

There are nights when the alerts are a slow drip. Then there are nights when the system screams and you feel the adrenaline draw a line through your exhaustion. This is the second kind. The alert reads **Mass File Rename + Ransom Note Indicators**. The name is blunt; it is a moral lecture disguised as telemetry.

The device is a file server in accounting. The timeline shows a burst of file writes, renames, extensions changing. There is a file named `README_FOR_DECRYPT.txt`. There is an unsigned process touching hundreds of files in seconds. This is not a question.

I don’t believe in panic, but I do believe in speed. Here is the rule I hate: **Containment is a decision, not a reflex.** But in ransomware, the decision is almost always yes.

**Investigative pivot:** From initial device → user account → lateral scope. I look at the process tree. I identify the parent process. It is `svchost.exe` launching something it shouldn’t. The child process is unfamiliar. I check its hash. It is unknown. I check for network connections. It is reaching out to an external IP. That is enough to move.

I notify Sofia, the IR lead. My message is short: “Mass file rename + ransom note on accounting file server. Unknown process hash. Recommending immediate isolation.” She replies: “Isolate and preserve evidence.”

I isolate the device in MDE. It feels like cutting the phone line in a horror movie. I do it anyway. I trigger a memory capture. I save the process tree and the file list. I do not delete anything. I do not touch the files. The evidence matters more than my need to do something.

KQL to scope the blast radius:

```kql
DeviceFileEvents
| where FileName has "README_FOR_DECRYPT"
| summarize count() by DeviceName
```

Only the one server. That’s good, or it’s only the beginning. I check for similar renames across other devices. None. I check the account that accessed the server. It’s a service account. That means credentials might be compromised. I check sign-ins for that account. There are suspicious logins from a new IP within the last hour. This is now a high. Possibly critical. I escalate formally.

Watch-out: **Don’t widen the blast radius with bad containment.** If you disable the service account without planning, you might break business systems. But leaving it active could allow the attacker to keep moving. I coordinate with Sofia. We disable it after confirming dependency windows. We document the time. We prepare a message for the morning shift.

It doesn’t feel heroic. It feels like triage in a hospital hallway. You stop the bleeding and you hope you didn’t amputate the wrong limb.

I write the ticket with a shaking hand. Not because I’m afraid, but because I’m tired. The narrative is clear; the details matter. I list the affected server, the ransom note filename, the suspicious process, the isolation time. I attach the evidence. I tag the incident for critical escalation.

There is no moral here. Ransomware is a lecture about fragility. It teaches you how quickly the familiar becomes rubble. It teaches you that the dashboard’s green lights are a lie until proven otherwise.

Ransomware forces you to be both a clinician and a historian. You must stop the bleeding and also record the time of the first cut. The sooner you stop the bleeding, the less evidence you have. The more evidence you take, the longer the bleeding continues. There is no clean solution, only trade-offs.

I remember a rule from training: **Do not kill the process unless told.** Killing the process can destroy artifacts you need later. So I leave it running long enough to capture evidence, then isolate the device to stop the spread. It’s a balancing act that makes my hands shake.

**Investigative pivot:** From file server → share access logs → source device. I check who accessed the share at the time the renames started. The service account is the answer, but I still check the host that used it. I want to know if the service account was used from an unusual device. That can tell us where the attacker started.

Watch-out: **Avoid touching the share directly.** It’s tempting to open a file to “confirm.” Don’t. Opening a file can alter its timestamp and muddy evidence. The logs are enough.

Documentation best practice: **Record the evidence capture actions.** Memory capture started at 02:13, isolation at 02:12, process tree saved at 02:11. The order matters. It tells the day shift what the attacker could have done in that window.

I also start a mini-scope on other file servers. I run a quick query for the ransom note name across all devices. The results are clean. That’s comforting, but I don’t trust comfort. I set a watchlist rule for new ransom note creations and alert the day shift to monitor.

This is where the moral lecture comes in: the system does not tolerate uncertainty. It forces you to decide with half the data and own the consequences. You can be wrong. The only defense is to be transparent in the ticket, to show your reasoning, to show the constraints. Honesty is how you stay on the right side of the disaster.

After isolation, I notify the on-call infrastructure lead. The words are careful: “Isolated accounting file server due to active encryption. Please do not reconnect without IR approval.” The tone is not dramatic; it is surgical. I’ve learned that panic messages invite panic replies.

We discuss backups briefly. Backups are the seductive solution, but they are not immediate. You do not restore while the attacker might still have access. You do not reintroduce a server to the network while you are still unsure of the foothold. That’s the discipline that hurts. It’s easier to restore and hope. It’s harder to wait and verify.

**Investigative pivot:** I check for evidence of staging or exfiltration. Ransomware often comes after data theft. I look for large outbound transfers from the server in the hours before the encryption. The logs are limited, but I can see a spike in SMB activity and a small burst of outbound traffic. It’s not proof, but it’s enough to flag as a risk. I include it in the escalation.

Watch-out: **Ransomware alerts can be a decoy.** Sometimes the encryption is loud while the quieter theft happens elsewhere. I set a note for the day shift to review other critical servers for unusual access by the same service account.

Documentation best practice: **Separate facts from interpretations.** I label the outbound traffic as “observed” and the exfiltration hypothesis as “unconfirmed.” That line matters. It keeps the story honest.

I end the night with a message to myself: if you have to choose between speed and evidence, choose evidence once the bleeding is stopped. Containment first, evidence next. It is not elegant, but it is survivable.

---

CASE FILE: Mass File Rename + Ransom Note Indicators
- Signal:
  - MDE alert for rapid file renames and ransom note file creation.
- Context:
  - Accounting file server; ransom note `README_FOR_DECRYPT.txt` created.
- Hypotheses (benign vs malicious):
  - Benign: none plausible.
  - Malicious: active ransomware encryption.
- Validation steps (first 10 minutes):
  - Review process tree and file rename volume.
  - Check file hashes and unknown process reputation.
  - Isolate device and preserve evidence.
  - Scope for ransom note across other devices.
- Evidence captured:
  - Process tree, file rename logs, ransom note filename.
  - Device isolation time and memory capture reference.
- Decision:
  - Escalate to IR lead; isolate device; disable compromised service account.
- Ticket write-up (concise):
  - “Detected mass file renames and ransom note creation on accounting file server. Unknown process hash initiated activity; external connection observed. Isolated device via MDE at 02:12; memory capture initiated; service account disabled after coordination. Escalated to IR lead.”
- Follow-ups / tuning ideas:
  - Review service account monitoring and least privilege.
  - Enhance detection for rapid rename bursts across shares.
