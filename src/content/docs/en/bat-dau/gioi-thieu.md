---
title: Introduction
description: What Embra does and the basic concepts.
sidebar:
  order: 1
---

Embra is a hosting platform for Vietnam: connect a GitHub repo → Embra builds it in a microVM → deploys the app with its own Postgres, always with a way back for your data.

## What Embra does

| Feature | Detail |
|---|---|
| Build + deploy from git | The GitHub App receives pushes, builds with Railpack or your Dockerfile in a microVM, produces an image pinned by digest, then makes a plan with an estimated price. Production deploys always need an Owner or Admin to approve |
| Migrations behind a gate | Migrations are classified and rehearsed on a clone before they run for real. If the outcome is unclear, Embra stops and waits for a person instead of retrying |
| Dedicated Postgres per environment | Continuous backup (WAL) + a full backup every 7 days on a separate disk, with an automatic test restore after each full backup. Off-server copies are not on yet. Point-in-time restore (PITR) goes into a new database; an Owner or Admin approves before the switch |
| Other resources | Workers, cron, an object storage bucket, custom domains with automatic HTTPS, preview environments per PR, pause / resume, full export of the app and data |

## Concepts

| Concept | Meaning |
|---|---|
| Workspace | The account of a team or business. The plan and members belong here. See [Members and permissions](/en/workspace/phan-quyen/) |
| Project | One app, usually one repo |
| Environment | One running copy of a project (`production`, `staging`, a preview per PR), with its own Postgres and secrets |
| Operation | Every action with side effects (deploy, restore, delete…) is an operation with a status you can look back at |
| Plan | What will be done, with an estimated price. Important actions need their plan approved before they run |

## Ways to use Embra

- **Web console**: the main interface.
- **CLI `embra`**: see the [command list](/en/cli/lenh/).
- **HTTP API** `/v1`: the reference is not published yet.
- **MCP** (`embra mcp`): for AI agents. An agent can never approve, delete or export.

Get going: [Quick start](/en/bat-dau/bat-dau-nhanh/).
