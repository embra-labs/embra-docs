---
title: MCP for AI agents
description: Connect Claude Code, Codex or Cursor to Embra with `embra mcp`. The agent deploys to dev, reads logs and creates production plans; it cannot approve, delete or read secrets.
sidebar:
  order: 9
---

`embra mcp` is an MCP server (stdio) built into the CLI. The agent calls Embra directly: it deploys the project directory to the `dev` environment, reads build logs, searches app logs and creates production plans that wait for your approval.

## Set up

1. Install the CLI: [Install the CLI](/en/cli/cai-dat/).
2. Run (you, not the agent):

   ```sh
   embra login --agent
   ```

   The browser opens **Đăng nhập CLI** (CLI sign-in). Type the 8-letter code shown in the terminal and approve `embra-mcp@<hostname>`. The `agent`-scope token is stored in `config.agent.json`, separate from your own token.
3. Add the server to your client:

   | Client | Command | Tested |
   |---|---|---|
   | Claude Code | `claude mcp add embra -- embra mcp` | Yes (04/11/2026, CLI 0.1.1) |
   | Codex | `codex mcp add embra -- embra mcp` | Not yet |
   | Cursor | `.cursor/mcp.json`: `{"mcpServers": {"embra": {"command": "embra", "args": ["mcp", "--root", "${workspaceFolder}"]}}}` | Not yet |

4. Check: ask the agent to "call the embra_workspace tool". The result has `token_scope` set to `agent` (or `viewer` with [read-only](#read-only-and-fewer-tools)).

There is no remote MCP yet (a URL to paste into Claude.ai or ChatGPT). Only clients running on your machine work today.

## Limits

| Embra guarantees | Embra does not guarantee |
|---|---|
| An `agent` token cannot approve, delete, export, roll back, restore, set secrets or read the database URL. The server refuses, whatever the prompt says. | That the agent is immune to prompt injection. App logs are text anyone can write into. |
| Production only gets a plan that stops at waiting for approval. An Owner or Admin approves in the console. | That the agent never deploys broken code to `dev`. `dev` is where you try things. |
| `embra_deploy_directory` uploads only the project directory and below, skipping `.env*`, `node_modules`, `.git` and files in `.gitignore`/`.embraignore`. | That your client asks you before every tool call. That depends on the client's settings. |
| App text (logs, build output) comes back with every line prefixed by `│`, kept apart in `untrusted_text`, `untrusted_excerpt` or `lines[].text`. | |

What an `agent` token may do in detail: [Permissions](/en/workspace/phan-quyen/).

## Tools

| Group | Tools |
|---|---|
| Deploy | `embra_deploy_directory` (to `dev`; `prod=true` only creates a plan), `embra_build` (from the connected GitHub repo), `embra_get_url` |
| Diagnose | `embra_get_build_log`, `embra_search_logs`, `embra_get_metrics` |
| Prepare safely | `embra_plan`, `embra_rehearse` (runs migrations on a copy of the database), `embra_estimate` |
| Read state | `embra_workspace`, `embra_projects`, `embra_environments`, `embra_environment`, `embra_operation`, `embra_wait` |
| Look up | `embra_explain_reason` (explains a `reason_code`: can a retry help, `next_action`, how to fix), `embra_docs_search`, `embra_docs_read` (read docs.embra.cloud only). From CLI 0.1.2 |
| Production fork | `embra_fork` (waits for an Owner or Admin to approve), `embra_fork_status`, `embra_fork_access` (the fork's access key; every read is recorded) |

- `environment_id` takes an ID (`env_…`) or `<project>/<env>`, such as `shop/dev`.
- Tools that create an operation take `idempotency_key`. Without one, an identical call within 10 minutes returns the earlier operation instead of creating a duplicate.
- A production plan returns `approval_url`: the console link where you approve it.
- Error results carry `docs_url`: a link to [Error codes and fixes](/en/loi/), the same link the CLI prints.

## Read-only and fewer tools

From CLI 0.1.3.

| You want | Do |
|---|---|
| The agent only looks: logs, metrics, state, docs | `embra login --agent --read-only`. A `viewer` token (7 days) replaces the agent token in `config.agent.json`. `embra mcp` then has only the 15 read tools, and the server refuses every build, deploy, plan or fork even if the client calls one. Any role can approve it, Viewer included. |
| Hide write tools but keep the agent token | `embra mcp --read-only`. Hides them in the client only; not a security boundary. |
| Fewer tools | `embra mcp --toolsets deploy,diagnose`. Groups: `deploy`, `diagnose`, `plan`, `fork`, `docs`; the `read` group (workspace, projects, environments, operations, URL) is always on. A wrong name stops the server. |
| One project | `embra mcp --project shop`. `environment_id` can be just `dev`; other projects are refused and `embra_projects` is hidden. Client-side pinning, not a security boundary. |

`embra_workspace` returns `read_only` and `pinned_project` so the agent knows which mode it is in.

Get write access back: run `embra login --agent` (without `--read-only`).

## Common errors

When `embra mcp` does not start, the client reports a server error; the reason is in the client's MCP log.

| Error | Fix |
|---|---|
| ``thiếu token agent. Chạy `embra login --agent` …`` (no agent token) | Run `embra login --agent`. |
| `token có quyền "…", không phải agent: …` (not an agent token) | `EMBRA_TOKEN` holds your own token. Remove it and run `embra login --agent`. |
| `toolset "…" không có; chọn trong: …` (unknown toolset) | Fix the name in `--toolsets`. |
| `--project "…": không có project này trong workspace` (no such project) | Fix the slug in `--project` (see `embra project list`). |
| `API không chấp nhận token (HTTP 401). …` (token rejected) | The token expired or was revoked. Run `embra login --agent` again. |
| The agent does not see `embra_deploy_directory` | The client started the server outside the project directory. Add `--root <project path>` to the args. |

<details>
<summary>Which directory is uploaded</summary>

- With `--root`: that directory and below.
- Without `--root`: the server's working directory, which must contain one of `embra.toml`, `.git`, `package.json`, `go.mod`, `pyproject.toml`, `requirements.txt`, `Dockerfile`.
- `/`, your home directory and any directory containing it are refused. `embra_deploy_directory` is then missing and the reason goes to stderr.
- Claude Code starts the server in the directory where you opened Claude Code.

</details>

## See also

- [Using Embra with an AI agent](/en/huong-dan/ai-agent/): preparing the repo, an `AGENTS.md` template.
- [Staging, production and approval](/en/huong-dan/staging-production-va-duyet/): approving a production plan.
- [Error codes and fixes](/en/loi/)
