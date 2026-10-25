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
| **Owner** | The business owner | Everything, including choosing a plan, paying and deleting the workspace. A workspace always has at least one owner. |
| **Admin** | The customer's technical lead | Approves production, manages members, deletes environments, exports. Doesn't pay, can't delete the workspace. |
| **Developer** (`dev`) | Developers, agencies | Builds, deploys staging, creates production plans for approval, manages secrets, domains, databases. Can't approve production. |
| **Viewer** | People who need to follow along | Only sees status, activity, logs and metrics. Can't see secrets or the database URL. |

Two kinds of machine token:

| Token | Used by | Summary |
|---|---|---|
| **Agent** (`agent`) | AI agents through `embra mcp` | Reads, builds, deploys staging, creates production plans. **Never** approves, deletes, exports or reads the database URL. |
| **CI** (`ci`) | CI pipelines | Reads and rehearses migrations. Doesn't build or deploy. |

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

- **Every deploy plan for production waits for an Owner or Admin to approve, even when it has no migration.** A pending plan expires (24 hours by default); after that, create a new plan.
- Deploys to staging and previews run straight away, unless a migration is classified as needing a person to look at it. Then the plan waits for approval too.
- Developers and AI agents can **create** a production plan, but can never **approve** one.
- A **point-in-time restore** has two steps. A developer or above proposes it. Embra restores into a new database. An Owner or Admin reviews and approves before Embra switches over.
- **Rolling code back needs no approval**, because it only reruns code that was already approved and run in that environment. Embra refuses a rollback that isn't safe, for example when migrations have moved on or a secret was revoked. A rollback that has to go back to an earlier database (after a restore) loses data written since the switch, so only Owners and Admins can do it.

## Actions that need a real person

The actions marked "Yes" in the Person column are only accepted when a real person has signed in recently:

- A **web session** signed in with GitHub or Google **within the last 12 hours**. A web session lasts 7 days, but once the sign-in is older than 12 hours, Embra asks you to sign in again before it lets you continue.
- Or a **CLI token from `embra login`**, used within 12 hours of the moment you approved it in the browser. After 12 hours that token still works for everyday actions. For the critical ones, run `embra login` again.

**A machine token can never do these actions, whatever its scope.** Machine tokens are tokens from `embra token create`, `embra login --agent`, and the initial setup token. So a token leaked in a file, a CI log or an AI agent's machine can't approve production, delete production or export data.

Actions marked "Web only" (choosing a plan, paying, managing members, approving a CLI login) can only be done in the browser.

## Tokens

| How it's made | Kind | Role | Lifetime |
|---|---|---|---|
| `embra login` | Person token | Your role | 30 days by default |
| `embra login --agent` | Machine token | `agent`, for `embra mcp` | 7 days by default |
| `embra token create --scope … --name … --ttl …` | Machine token | `dev`, `viewer`, `agent` or `ci` | **Required**, 1 minute to 90 days |

- **Every token expires.** Owner and admin tokens can't be created through the API or CLI.
- **A token is never stronger than its creator.** On every use, Embra recomputes its rights from the creator's *current* role:
  - Demote an admin to developer: from the next request, their tokens only have developer rights.
  - Demote to viewer: the `agent` and `ci` tokens they created **stop working**.
  - Remove from the workspace: **all** their sessions and tokens are revoked at once, including CI tokens a pipeline is using.
- Creating a token needs a real person too. A CI pipeline can't mint more tokens.
- `embra token list` shows each token's kind, creator, last use and expiry. `embra token revoke <id>` revokes one.

## Inviting members

Invite people on the web, under **Settings → Members**. `embra members list` only lists them.

- Owners invite Admins, Developers and Viewers. Admins invite Developers and Viewers.
- **Nobody is invited straight in as owner.** For a second owner, invite them as Admin, then an owner promotes them.
- An invite lasts **14 days**. Inviting the same email again refreshes it.
- **Accepting with GitHub:** the GitHub account's **primary** verified email must match the invited email. A secondary email doesn't count.
- **Accepting with Google:** the Google account needs a verified email, and that email must not already belong to another Embra account.
- **The invitee must not already have an Embra workspace of their own**, such as a trial workspace. For now, each person belongs to one workspace. If they already have one, they sign in to it and the invite stays pending without an error. In that case, contact the Embra team.
- A workspace always keeps at least one owner. Removing or demoting the last owner is refused (`LAST_OWNER`).
- Someone who was removed from a workspace can't start a new trial workspace on their own. An owner has to invite them again.

## Agencies working for a business

The recommended split: **the business owner is Owner, the agency is Developer.** The agency deploys staging and prepares production plans. The business owner (or an Admin on their side) approves production.

If the agency created the workspace, hand it over like this:

1. The agency invites the business owner as **Admin**.
2. The business owner signs in. The agency, still an owner, promotes them to **Owner**.
3. The business owner demotes the agency to **Developer**, or removes them when the contract ends.

Before step 3, check CI and agent tokens. Tokens belong to whoever created them: removing the agency stops every token the agency created, immediately. Demoting the agency to Viewer stops their `agent` and `ci` tokens too. If a pipeline must keep running, have someone who is staying create a new token first.

## Activity history

Activity shows the **person's name** and role (for example "lan (Developer)"), not just the role. Invites, accepted invites, revoked invites, role changes, removals, and token creation and revocation are all recorded.

## The Embra team

- Tokens the Embra team creates always expire and always carry a reason. You see "Đội Embra đã tạo token để truy cập workspace. Lý do: …" (the Embra team created a token to access the workspace; reason: …) in Activity.
- When the Embra team views your logs, metrics, build logs, database URL or an export, Activity records it with the reason. Repeated views in a short window are grouped into one entry.
- When supporting you at your request, the Embra team can create a short-lived person token to **approve on your behalf**, for example a production plan. That token also shows in Activity with its reason.
- An owner can revoke an Embra team token at any time with `embra token revoke`. A token with owner scope is tied to the owner, so an Admin can't revoke that kind.

## Not yet available

What Embra **can't** do yet, so you know up front:

- **No per-environment permissions.** A developer can still set secrets and domains, see the database URL, pause, and roll back code on production. Only approving deploys is locked.
- **No tokens limited to one project or environment.** A token works across the whole workspace.
- **No two-person approval.** An admin who creates a production plan can approve it themselves.
- **No "Guest: view and approve" role.**
- **No token page on the web.** Use `embra token list` and `embra token revoke`.
- **Each person belongs to one workspace.**
- No SSO.

## Related error codes

| Code | Meaning | What to do |
|---|---|---|
| `FORBIDDEN_SCOPE` | Your role or token isn't allowed to do this | Ask an Owner or Admin |
| `HUMAN_REQUIRED` | This needs a real person, and you're using a machine token | Do it on the web, or run `embra login` and retry |
| `REAUTH_REQUIRED` | Your sign-in is older than 12 hours | Sign in again on the web, or run `embra login` again |
| `LAST_OWNER` | This change would leave the workspace with no owner | Promote someone else to owner first |
