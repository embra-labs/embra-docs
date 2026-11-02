---
title: Members and permissions
description: Workspace roles, who can do what, which actions need a real person, tokens and invites.
sidebar:
  order: 1
---

Every person in a workspace has a **role**. Besides people, there are **machine tokens** for AI agents and CI. Roles, invites and the activity history are on **every plan**, including Start.

Three principles:

- **Production always needs an Owner or Admin to approve.**
- **Anything that can't be undone needs a real person.** Machine tokens can't do it, not even a token with owner scope.
- **Every token expires, and no token is ever stronger than the person who created it.**

## Roles

| Role | For | Summary |
|---|---|---|
| **Owner** | The business owner | Everything, including choosing a plan, paying and deleting the workspace. A workspace always has at least one owner |
| **Admin** | The customer's technical lead | Approves production, manages members, deletes environments, exports. Doesn't pay, can't delete the workspace |
| **Developer** (`dev`) | Developers, agencies | Builds, deploys staging, creates production plans for approval, manages secrets, domains, databases. Can't approve production |
| **Viewer** | People who need to follow along | Only sees status, activity, logs and metrics. Can't see secrets or the database URL |

| Machine token | Used by | Summary |
|---|---|---|
| **Agent** (`agent`) | AI agents through `embra mcp` | Reads, builds, deploys staging, creates production plans. **Never** approves, deletes, exports or reads the database URL |
| **CI** (`ci`) | CI pipelines | Reads and rehearses migrations. Doesn't build or deploy |

In the CLI and the API, the Developer role is called `dev`.

## Permission matrix

✓ = allowed. **Person** column: *Yes* = on the web or within 12 hours of `embra login`; *Web only* = only in the browser. See [Actions that need a real person](#actions-that-need-a-real-person).

<div class="matrix">

| Action | Owner | Admin | Dev | Viewer | Agent | CI | Person |
|---|:-:|:-:|:-:|:-:|:-:|:-:|---|
| See workspace, projects, environments, operations, activity | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| See logs and metrics | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | |
| See secret **names** (values are never shown) | ✓ | ✓ | ✓ | | ✓ | | |
| Set, revoke secrets | ✓ | ✓ | ✓ | | | | |
| See the database URL (includes the password) | ✓ | ✓ | ✓ | | | | |
| Create projects, environments, databases, buckets | ✓ | ✓ | ✓ | | | | |
| Connect a GitHub repo | ✓ | ✓ | ✓ | | | | |
| Build, upload a directory (`embra up`) | ✓ | ✓ | ✓ | | ✓ | | |
| Rehearse migrations | ✓ | ✓ | ✓ | | ✓ | ✓ | |
| Create a deploy plan | ✓ | ✓ | ✓ | | ✓ | | |
| **Approve a production deploy** | ✓ | ✓ | | | | | Yes |
| **Approve switching to a restored database** | ✓ | ✓ | | | | | Yes |
| Propose a point-in-time restore | ✓ | ✓ | ✓ | | | | |
| Verify backups | ✓ | ✓ | ✓ | | ✓ | | |
| Cancel an operation that hasn't started | ✓ | ✓ | ✓ | | | | |
| Roll code back to an earlier release | ✓ | ✓ | ✓ | | | | |
| Roll back onto an earlier database | ✓ | ✓ | | | | | |
| Pause, resume an environment | ✓ | ✓ | ✓ | | | | |
| Add, verify, remove domains | ✓ | ✓ | ✓ | | | | |
| Delete a staging or preview environment | ✓ | ✓ | | | | | |
| **Delete a production environment** | ✓ | ✓ | | | | | Yes |
| **Export app and data** | ✓ | ✓ | | | | | Yes |
| **Delete the workspace** | ✓ | | | | | | Yes |
| See billing | ✓ | ✓ | | | | | |
| **Choose a plan, pay** | ✓ | | | | | | Web only |
| See members and invites | ✓ | ✓ | | | | | |
| **Invite, change roles, remove members** | ✓ | ✓ ¹ | | | | | Web only |
| **Create tokens** | ✓ | ✓ | ✓ ² | | | | Yes |
| See, revoke tokens | ✓ all | ✓ ³ | own | | | | |
| **Approve a CLI login** (`embra login`) | ✓ | ✓ | ✓ | ✓ ⁴ | | | Web only |

</div>

1. An admin only invites or assigns Developer and Viewer. An admin can change the role of, or remove, Developers, Viewers and other admins, but can never touch an owner.
2. Nobody can create a token stronger than their own role. A developer can create `dev`, `viewer`, `agent` and `ci` tokens.
3. An admin sees and revokes every token except an owner's.
4. A viewer who approves `embra login` gets a viewer token. Viewers can't hand out agent tokens.

## Production always needs approval

| Action | Rule |
|---|---|
| Production deploy | **Every plan waits for an Owner or Admin to approve, even with no migration.** A pending plan expires (24 hours by default); after that, create a new plan |
| Staging, preview deploy | Runs straight away, unless a migration is classified as needing a person to look: then the plan waits for approval too |
| Developers, AI agents | Can **create** a production plan, never **approve** one |
| Point-in-time restore | Two steps: a developer or above proposes → Embra restores into a new database → an Owner or Admin reviews and approves before the switch |
| Code rollback | **No approval needed**, because it only reruns code that was already approved and run in that environment. Embra refuses an unsafe rollback (migrations moved on, a secret was revoked) |
| Rollback to an earlier database (after a restore) | Loses data written since the switch, so only Owners and Admins can do it |

## Actions that need a real person

Actions marked "Yes" in the Person column are only accepted when a real person signed in recently:

- A **web session** signed in with GitHub or Google **within the last 12 hours**. A web session lasts 7 days, but once the sign-in is older than 12 hours, Embra asks you to sign in again first.
- Or a **CLI token from `embra login`**, within 12 hours of approving it in the browser. After 12 hours the token still works for everyday actions; for critical ones, run `embra login` again.

**A machine token can never do these actions, whatever its scope.** Machine tokens: tokens from `embra token create`, `embra login --agent`, and the initial setup token. So a token leaked in a file, a CI log or an AI agent's machine can't approve production, delete production or export data.

Actions marked "Web only" (choosing a plan, paying, managing members, approving a CLI login) can only be done in the browser.

## Tokens

| How it's made | Kind | Role | Lifetime |
|---|---|---|---|
| `embra login` | Person token | Your role | 30 days by default |
| `embra login --agent` | Machine token | `agent`, for `embra mcp` | 7 days by default |
| `embra token create --scope … --name … --ttl …` | Machine token | `dev`, `viewer`, `agent` or `ci` | **Required**, 1 minute to 90 days |

- **Every token expires.** Owner and admin tokens can't be created through the API or CLI.
- **A token is never stronger than its creator.** On every request, Embra recomputes its rights from the creator's *current* role:

  | Creator is | Their tokens |
  |---|---|
  | Demoted from admin to developer | Only developer rights from the next request |
  | Demoted to viewer | The `agent` and `ci` tokens they created **stop working** |
  | Removed from the workspace | **All** their sessions and tokens are revoked at once, including CI tokens a pipeline is using |

- Creating a token needs a real person too: a CI pipeline can't mint more tokens.
- `embra token list`: each token's kind, creator, last use and expiry. `embra token revoke <id>`: revoke one.

## Inviting members

Invite on the web under **Cài đặt → Thành viên** (settings, members). `embra members list` only lists them.

| Rule | Detail |
|---|---|
| Who invites whom | Owners invite Admins, Developers and Viewers. Admins invite Developers and Viewers |
| Second owner | **Nobody is invited straight in as owner.** Invite as Admin, then an owner promotes them |
| Invite lifetime | **14 days**. Inviting the same email again refreshes it |
| Accepting with GitHub | The GitHub account's **primary** verified email must match the invited email. A secondary email doesn't count |
| Accepting with Google | The Google account needs a verified email, not already used by another Embra account |
| Last owner | A workspace always keeps at least one owner. Removing or demoting the last owner is refused (`LAST_OWNER`) |
| Removed people | Can't start a new trial workspace on their own; an owner has to invite them again |

**People who already have a workspace can still accept** (a trial workspace, or an agency member working for several clients). The invite is accepted on their **next sign-in**, with the invited email. Someone already signed in sees "Lời mời vào …: đăng xuất rồi đăng nhập lại để nhận" (invite to …: sign out and back in to accept) in the **Workspace** menu, and switches between workspaces from that menu afterwards.

## Agencies working for a business

Recommended split: **the business owner is Owner, the agency is Developer.** The agency deploys staging and prepares production plans; the business owner (or an Admin on their side) approves production.

If the agency created the workspace, hand it over like this:

1. The agency invites the business owner as **Admin**.
2. The business owner signs in. The agency (still an owner) promotes them to **Owner**.
3. The business owner demotes the agency to **Developer**, or removes them when the contract ends.

:::caution[Check CI and agent tokens before step 3]
Tokens belong to whoever created them: removing the agency stops every token the agency created, immediately; demoting the agency to Viewer stops their `agent` and `ci` tokens too. If a pipeline must keep running, someone who is staying creates a new token first.
:::

## Activity history

**Hoạt động** (activity) shows the **person's name** with their role (for example "lan (Developer)"). Recorded: invites, accepted invites, revoked invites, role changes, removals, token creation and revocation.

## The Embra team

- Tokens the Embra team creates always expire and always carry a reason. You see "Đội Embra đã tạo token để truy cập workspace. Lý do: …" (the Embra team created a token to access the workspace; reason: …) in Activity.
- When the Embra team views your logs, metrics, build logs, database URL or an export, Activity records it with the reason. Repeated views are grouped into one entry.
- When supporting you at your request, the Embra team can create a short-lived person token to **approve on your behalf** (for example a production plan). That token also shows in Activity with its reason.
- An owner can revoke an Embra team token at any time with `embra token revoke`. A token with owner scope is tied to the owner, so an Admin can't revoke that kind.

## Not yet available

- **No per-environment permissions.** A developer can still set secrets and domains, see the database URL, pause, and roll back code on production. Only approving deploys is locked.
- **No tokens limited to one project or environment.** A token works across the whole workspace.
- **No two-person approval.** An admin who creates a production plan can approve it themselves.
- **No "Guest: view and approve" role.**
- **No token page on the web.** Use `embra token list` and `embra token revoke`.
- No SSO.

## Related error codes

| Code | Meaning | What to do |
|---|---|---|
| `FORBIDDEN_SCOPE` | Your role or token isn't allowed to do this | Ask an Owner or Admin |
| `HUMAN_REQUIRED` | This needs a real person, and you're using a machine token | Do it on the web, or run `embra login` and retry |
| `REAUTH_REQUIRED` | Your sign-in is older than 12 hours | Sign in again on the web, or run `embra login` again |
| `LAST_OWNER` | This change would leave the workspace with no owner | Promote someone else to owner first |
