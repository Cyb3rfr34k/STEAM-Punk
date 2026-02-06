# 04 — EDR as an Intimate Violation

I don’t like looking at people’s devices. It feels like reading their diary with the excuse that I’m keeping them safe. The device timeline is a perfect memory, a shame archive. I’m the archivist. You want a clean story. I can’t give you that.

The alert says: **Office app spawning child process**. A document opened in Word, a child process launched: `cmd.exe`. It could be a macro. It could be a legitimate add-in. It could be a user clicking “Enable Content” because the banner told them to and they wanted to go home.

Alex Imani again. Their device is my mirror. The queue pushes the alert to me like a dare.

Here is the rule I hate: **Process trees are guilt by association.** Parent and child doesn’t mean intent. It means chronology.

I open MDE and follow the process tree. Word spawns `cmd.exe`, which spawns `powershell.exe`, which reaches out to a web URL. That smells like a macro. But it might be a template that fetches a company logo. It might be a legitimate script that pulls a document revision. It might be a known tool. The chain is suspicious, which is an adjective, not a verdict.

**Investigative pivot:** From process chain → network connections → file writes. I check the network connection and see a domain that looks internal. That’s good. Then I check file write events for new executables or scripts in temp folders. None. Then I check if the process tree ended quickly (it did). The event is a spark, not a flame.

KQL, just to organize the confession:

```kql
DeviceProcessEvents
| where DeviceName == "device-17"
| where InitiatingProcessFileName == "WINWORD.EXE"
| project TimeGenerated, InitiatingProcessCommandLine, FileName, ProcessCommandLine
| order by TimeGenerated desc
```

I find the document name in the command line: `Q3-Operations-Checklist.docm`. Macro-enabled. I can pretend to be surprised, but I’m not. The business still loves macros. It’s the old magic. It’s also the old infection vector.

I call Alex. It’s 2:40 a.m., which is the hour when apologies are honest. Alex answers, bleary but polite. They say the doc came from an internal share. It was “the usual.” That phrase is a sedative and a threat. I ask if they clicked “Enable Content.” They did. They do that because the banner is always there and the doc never works otherwise.

Watch-out: **User statements are evidence, not exoneration.** If the user tells you it’s normal, you still need to verify the file’s origin. So I check the file hash against known internal templates. I check if the file was downloaded from external email. It wasn’t. It came from a shared drive. That’s a softer place to be.

I’m still unsettled, because benign isn’t a posture, it’s an argument. I check other devices that opened the same file in the last 24 hours. I use MDE to search for the file hash and name. Two hits, both in the same department, both same process tree, both with no additional alerts. The system is consistent. That is the only kind of peace we get.

I write the ticket. I am careful. I do not shame Alex for enabling macros; I note the behavior as a risk and suggest a remediation action to the day shift. I document the process tree and the network connection. I write the parts I wish I didn’t know.

This is the intimate violation: I can see what file you opened and when. I can see your hesitation, in the time between parent and child. I promise myself I will only look when necessary. I promise myself that promise is a lie.

Process trees are ugly when you stare at them long enough. They are a family with secrets. There are benign chains that look malicious and malicious chains that look like nothing at all. So you learn a few anchors: Word spawning `cmd.exe` is suspicious; Word spawning `splwow64.exe` is normal. Excel spawning `rundll32` is a warning. Outlook spawning `powershell` is a siren.

I make a small list in my notebook. It’s not official. It’s the kind of cheat sheet you hide under your keyboard:

- **Suspicious:** `WINWORD.EXE → cmd.exe → powershell.exe`
- **Suspicious:** `EXCEL.EXE → regsvr32.exe`
- **Suspicious:** `OUTLOOK.EXE → mshta.exe`
- **Usually benign:** `WINWORD.EXE → splwow64.exe`

This list is not a verdict. It is a prompt. It tells me to look closer.

I also check the “initiating process command line.” If Word was opened with a file from the temp directory or the browser cache, that’s a stronger signal. If it came from a trusted share, that’s softer. In this case, it was opened from a department share. That doesn’t mean safe, but it does mean less likely to be a drive-by.

**Investigative pivot:** I search for the file hash in the email logs anyway. The file wasn’t in email. That’s a relief. I check if the file has the Mark-of-the-Web metadata; it doesn’t. That means it didn’t come from the internet, at least not directly.

Watch-out: **Macro fatigue is real.** Users have been trained to click “Enable Content.” This is not their fault alone. It’s ours for letting macros persist without guardrails. I note in the ticket that the macro should be reviewed by the business owner. It’s not an action item for the night shift, but it’s a breadcrumb.

Documentation best practice: **Record the process chain in plain language.** Not just “Word spawned PowerShell,” but the full chain and the command line. It matters when you revisit the case in a week and you can’t remember the shape of it.

I could be more compassionate about the intimacy of device data if I didn’t feel so responsible for it. Every click is a footprint. Every footprint is a potential accusation. I handle it like evidence, because it is.

I check for command-line obfuscation. Some macros call PowerShell with a long string of random characters or with the `-w hidden` flag. That doesn’t automatically mean malicious, but it increases the suspicion score. Tonight the command line is short and direct. That’s a relief.

**Investigative pivot:** I inspect the device timeline for user behavior around the alert. Did the user open an email attachment at the same time? Did they download something from the web? The timeline shows the file was opened from a share, and there was no browser activity. That’s another piece of the benign argument.

Watch-out: **False negatives hide in familiar tools.** Attackers love “living off the land.” If `powershell.exe` is the child process, you can’t assume it’s safe because it’s Microsoft-signed. Signed doesn’t mean benign; it means common.

Documentation best practice: **Capture the file path and share location.** If the same file appears in a future incident, those details let us connect the dots.

---

CASE FILE: Office App Spawning Child Process
- Signal:
  - MDE alert for Word spawning cmd/powershell.
- Context:
  - User opened macro-enabled document from internal share.
- Hypotheses (benign vs malicious):
  - Benign: approved macro-enabled template.
  - Malicious: macro delivering payload or LOLBin abuse.
- Validation steps (first 10 minutes):
  - Review process tree (Word → cmd → PowerShell).
  - Check network connections for external domains.
  - Check file write events for new executables.
  - Validate file origin (share vs email) and hash reputation.
- Evidence captured:
  - Process tree screenshot/note.
  - File hash and file path.
  - MDE search results for same hash on other devices.
- Decision:
  - Close as benign; note macro risk and monitor for recurrence.
- Ticket write-up (concise):
  - “MDE flagged Word spawning cmd/powershell on device-17. File Q3-Operations-Checklist.docm opened from internal share; same hash observed on 2 devices with identical behavior; no external connections or suspicious writes. Closed as benign; recommend review of macro policy.”
- Follow-ups / tuning ideas:
  - Assess macro policy for internal templates.
  - Consider alert suppression for known hash/path with caution.
