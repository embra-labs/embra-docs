---
title: Introduction
description: What Embra does and the basic concepts.
sidebar:
  order: 1
---

Embra is a hosting platform for Vietnam. You connect a GitHub repo; Embra builds it in a microVM, deploys the app with its own Postgres and keeps a way back for your data.

## What Embra does

- **Build and deploy from git.** The GitHub App receives pushes, builds with Railpack or your Dockerfile in a microVM, produces an image pinned by digest, then prepares a plan with an estimated price. Deploying to production always needs an Owner or Admin to approve.
- **Migrations behind an approval gate.** Every deploy that has migrations gets them classified and rehearsed on a clone before they run for real. If the outcome is unclear, Embra stops and waits for a person instead of retrying on its own.
- **A dedicated Postgres per environment.** Continuous backup (WAL) plus a full backup every 7 days on a separate disk, with an automatic test restore after each full backup. Off-server copies are not on yet. You can restore to a point in time (PITR) into a new database; an Owner or Admin approves before the switch.
- **Other resources.** Workers and cron, an object storage bucket, custom domains with automatic HTTPS, preview environments per PR, pause / resume, and a full export of the app and its data.

## Concepts

| Concept | Meaning |
|---|---|
| Workspace | The account of a team or a business. The plan and members belong here. See [Members and permissions](/en/workspace/phan-quyen/). |
| Project | One app, usually matching one repo. |
| Environment | One running copy of a project (for example `production`, `staging`, a preview per PR), with its own Postgres and secrets. |
| Operation | Every action with side effects (deploy, restore, delete…) is an operation with a status you can look back at. |
| Plan | A description of what will be done, with an estimated price. Important actions need their plan approved before they run. |

To get going, see [Quick start](/en/bat-dau/bat-dau-nhanh/).

## Ways to use Embra

- **Web console**: the main interface.
- **CLI `embra`**: see the [command list](/en/cli/lenh/).
- **HTTP API** `/v1`: the reference is not published yet.
- **MCP** (`embra mcp`): for AI agents. An agent can never approve, delete or export.
