# 02 — False Positive Theology

I used to believe that false positives were a design flaw. That’s a childish view. False positives are the tax you pay for being awake. Every time we notice something, we also notice a hundred things we were never meant to see. The system isn’t wrong; it is too honest.

Tonight the alert reads **Suspicious PowerShell**, which is like accusing a wrench of looking too much like a wrench. I say that, and then I remember the time a broken wrench ended a shift. I know how this sounds. I am cynical because I am afraid of the night I will be wrong.

The script launches from a file share, from an IT admin account. It runs a line that includes `-EncodedCommand`. That single flag lights up dashboards and sets off a chime as if I have discovered a shark in a swimming pool. It might be a shark. It might be the chlorine pump.

Mara told me, on my first week: “Never let contempt leak into your notes.” It’s harder than it sounds. The impulse is to write, “IT did it again,” or “Known script.” The impulse is to roll my eyes so hard the system sees it in the logs.

Let me be unfair for a second: I do want to be above it. I want to be the analyst who recognizes false positives instantly, not by arrogance but by smell. But smell is not evidence, so we build rituals.

**Ritual 1: Validate the context, not the tool.**

I open Sentinel and pull the command line. It’s not pretty, but it’s consistent with a script I recognize from previous tickets: inventory, patch status, a sweep that enumerates OS versions. I cross-check with change tickets in the IT system and see a maintenance window in progress. The same account, same host range.

KQL I use to avoid feeling like an idiot:

```kql
SecurityEvent
| where Account == "IT-Admin-23"
| where Process == "powershell.exe"
| project TimeGenerated, Computer, CommandLine
| order by TimeGenerated desc
```

The command line has a base64 blob. I don’t decode it tonight; I do something better. I check for the pattern of execution across machines. If the same script runs on twenty devices in fifteen minutes, it is a schedule. If it runs on one, it is a story.

There are 19 machines. That number is the only sermon I need.

**Ritual 2: Look for collateral damage.**

I pivot into MDE. I check if the script spawned a child process I don’t recognize, or if it reached out to a domain that isn’t in our baseline. The device timeline is uneventful. I find no unusual network connections. I find no evidence that the script touched user data. The warning remains just a warning.

**Ritual 3: Speak about humans like humans.**

This is harder. I have to write the ticket note in a tone that doesn’t shame the IT admin. It’s a small act of decency. It’s also strategic: if I write contempt, people stop giving me context. If they stop giving me context, I get blind. So I write, “Observed PowerShell executed by IT-Admin-23 consistent with patch inventory script. No anomalous child processes or network connections in MDE. No action required.”

Watch-out: **Allowlisting is a trap if you don’t understand the script.** You can suppress the alert, but if the script changes tomorrow, the noise becomes silence. So I add a follow-up: request a signature or a known hash for the script, or a schedule to match. Allowlisting is a deal, not a dismissal.

I know you want a villain here. The villain is the part of me that wants to feel superior. Every time I close a false positive, I feel like I get to say, “I was right.” Every time I do that, I become less curious. Curiosity is the only thing keeping me from becoming a dashboard.

This is training, I guess. Learning to show up without showing off.

There’s a superstition that if you decode the base64 command, you will suddenly see the truth. Sometimes you will, and you’ll regret it. Sometimes you won’t, and you’ll feel foolish. The real truth is that decoding is a tool, not a ritual. If the context says “IT maintenance,” decoding might be unnecessary; if the context is unknown, decoding becomes required.

I decide not to decode tonight. That sounds lazy. It isn’t. I check the script’s parent process and the file share path. If the share is an official admin share, if the account is the known admin account, if the execution pattern matches a window, I can make a call without decoding. That is a rule I can defend.

Still, I don’t want to be the analyst who never looks. So I add a note to follow up with IT for a copy of the script and an expected hash. It’s a compromise between suspicion and trust.

**Ritual 4: Read the distribution pattern.** If one machine executes the encoded command and nothing else does, it’s suspicious. If a whole cluster does, it’s automation. Automation is boring and safe, most of the time.

**Ritual 5: Check for LOLBins in the chain.** If PowerShell spawns `bitsadmin`, `certutil`, or `mshta`, that tilts the weight toward malicious. In this case, it doesn’t. It dies quietly.

Watch-out: **Your tone in internal communication is part of the investigation.** If I write to IT with contempt, they won’t reply quickly. If they don’t reply quickly, I lose context. So I send a short message: “Saw encoded PowerShell activity during maintenance. Can you confirm script name and expected hash? Looking to tune rule to reduce noise.” It’s neutral. It invites cooperation.

In the ticket I include a small footnote—my hostile footnote, because I can’t help myself: “Encoded PowerShell is not inherently malicious; context indicates approved activity, but recommend script signing to reduce alert churn.” I want to be explicit about why the alert fired; otherwise the next analyst will assume it’s a mistake and suppress it without understanding.

I check the last time this rule fired. Two weeks ago, same account, same share. That means the rule is working as designed, but it is tuned too broadly. This is not a failure of detection; it’s a failure of alignment between teams. So I note it in the ticket and in a separate tuning list. Small bureaucracy is how we keep good detection from drowning in noise.

You’ll notice I keep sliding from tech to theology. That’s because false positives are religious. They are about faith. Faith in the system. Faith in the people. Faith in yourself. The line between false positive and missed incident is thin. I balance on it and try not to pretend I’m above it.

Another thing I do when I doubt myself: I check Script Block Logging if it’s enabled. It gives you a glimpse of what PowerShell actually executed without forcing you to decode anything. It’s not always available, but when it is, it’s a light in the tunnel.

```kql
SecurityEvent
| where EventID == 4104
| where Account == "IT-Admin-23"
| project TimeGenerated, ScriptBlockText
```

If the script block is readable and matches known inventory tasks, the case gets stronger. If it’s empty or obfuscated, the case gets weaker. Tonight it’s readable. That settles me a bit.

I also check whether the script is signed. It isn’t. That’s normal in many environments, but it’s also a weakness. I note it as a risk. Allowlisting unsigned scripts is a promise you can’t keep. If I had my way, nothing runs without a signature. I don’t have my way. So I document the gap.

Tone management is a weird kind of skill, but it’s part of the job. The notes you write become the story other teams tell about you. So I avoid sarcasm, even when I want it. I avoid blame, even when it’s easy. I focus on the behavior and the evidence. It’s a discipline. It’s also a survival tactic.

---

CASE FILE: Suspicious PowerShell
- Signal:
  - Sentinel analytic rule flagged PowerShell with encoded command from admin account.
- Context:
  - IT maintenance window active; activity sourced from file share; known admin account.
- Hypotheses (benign vs malicious):
  - Benign: scheduled inventory script for patch checks.
  - Malicious: attacker using admin creds for lateral scripting.
- Validation steps (first 10 minutes):
  - Review command line and initiating account.
  - Check for execution pattern across multiple hosts.
  - Pivot to MDE for child processes and network connections.
  - Verify change window or IT ticket.
- Evidence captured:
  - Command line snippet with base64 flag.
  - Host list showing execution across 19 devices.
  - MDE timeline note (no suspicious children or outbound). 
- Decision:
  - Close as benign; document as IT maintenance script.
- Ticket write-up (concise):
  - “PowerShell with encoded command executed by IT-Admin-23 across 19 hosts during scheduled maintenance. MDE shows no unusual child processes or outbound connections. No action required; recommend known script hash/schedule for future tuning.”
- Follow-ups / tuning ideas:
  - Work with IT to register script hash or signed script.
  - Tune alert to exclude maintenance window scope.
