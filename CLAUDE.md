# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`leaveeasy-spec.md` in this folder is the authoritative requirement doc — read it before making any change, and don't add anything outside what it specifies (see its section 9, "สิ่งที่ยังไม่ทำใน Module นี้").

## Firestore collections

- `users` — `name`, `email`, `role` (`employee` / `manager` / `hr`)
- `leaveTypes` — `name`
- `leaveRequests` — `title`, `reason`, `status`, `requesterId`, `requesterName`, `approverId`, `approverName`, `leaveTypeId`, `leaveTypeName`, `startDate`, `endDate`, `createdAt` (`attachmentUrl` added week 9)
  - `leaveRequests/{id}/approvals` (subcollection) — `authorId`, `authorName`, `message`, `createdAt`

Field names must match exactly (`status` ≠ `Status`) — Firestore has no schema to catch a typo'd field name.

## Leave request status

Exactly 3 values, one-way transition only:

```
รอพิจารณา → อนุมัติ
          └→ ไม่อนุมัติ
```

- New requests always start at `รอพิจารณา`, set automatically — never let the user pick it.
- Only `manager`/`hr` can change status (enforced by Security Rules starting week 8); `employee` never can.
- Once a request is `อนุมัติ` or `ไม่อนุมัติ`, status can't change again.
- A status change touches only the `status` field — never overwrite other fields on the same document.
- Setting status to `ไม่อนุมัติ` requires at least one `approvals` entry to already exist.

## Never commit secrets

Never put API keys, tokens, or service-account credentials in any file that gets pushed — this repo is public. This covers the OpenRouter key (week 8 AI feature) and any Firebase Admin/service-account JSON; keep them out of tracked files (gitignored config file or env var) and add the matching pattern to `.gitignore` before the key ever gets created. Before every push, list the files about to be committed and check by eye for anything named like `key`/`secret`/`config` that shouldn't be there. This does **not** apply to `js/firebase-config.js`'s `apiKey` — that's the public Firebase Web SDK config, safe to commit; it's protected by Security Rules, not secrecy.
