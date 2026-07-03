---
sidebar_position: 5
title: SharePoint
description: Store your documents' canonical .md files in a SharePoint document library, reached app-only through Microsoft Graph with Sites.Selected.
---

# SharePoint

Connect a SharePoint (Microsoft 365) document library so your workspace's documents live in storage your organization owns.

Muesli reaches SharePoint **app-only** through Microsoft Graph using the `Sites.Selected` permission (connection kind `"sharepoint"`): a tenant admin grants the app write access to exactly one site — no user delegation, no access to anything else in the tenant. This is the pattern corporate IT will approve. Connecting is a form-and-probe wizard like S3; there is no OAuth redirect.

## 1. Register the Entra app (once per deployment)

In the [Entra admin center](https://entra.microsoft.com) → **App registrations** → **New registration**:

1. Choose the supported account types:
   - **Multi-tenant** ("Accounts in any organizational directory") for a hosted instance serving many organizations — but read the warning at the bottom of this page first.
   - **Single-tenant** is enough when self-hosting inside one organization.
2. **No redirect URI** is needed — this is a daemon app.
3. Under **API permissions**, add **Microsoft Graph → Application permissions → `Sites.Selected`**.
4. Create a credential — a **client secret** (Certificates & secrets → New client secret), and/or a **certificate** (upload the public certificate; keep the private key).

## 2. Configure the server

```sh
MUESLI_MS_CLIENT_ID=...            # the app's Application (client) ID
MUESLI_MS_CLIENT_SECRET=...        # secret auth; OR:
MUESLI_MS_CLIENT_CERT_FILE=...     # PEM file containing certificate + unencrypted private key
                                   # (the certificate wins when both are set)

# sovereign clouds (US Gov / 21Vianet China) — defaults shown:
MUESLI_MS_LOGIN_BASE=https://login.microsoftonline.com    # .us / partner.microsoftonline.cn
MUESLI_MS_GRAPH_BASE=https://graph.microsoft.com/v1.0     # .us / microsoftgraph.chinacloudapi.cn
```

With neither credential set, the SharePoint wizard requires the bring-your-own-app route (see below).

## 3. The one-time tenant-admin grant

Before the app can touch anything, a tenant admin performs two steps. The connect wizard shows both snippets pre-filled with your client id and site.

1. **Admin consent** — admits the app to the tenant. Open, as an admin:

   ```
   https://login.microsoftonline.com/{tenant}/adminconsent?client_id={client_id}
   ```

2. **Site grant** — scopes the app to exactly one site. Run as an admin (for example in Graph Explorer):

   ```
   POST https://graph.microsoft.com/v1.0/sites/{site-id}/permissions
   Content-Type: application/json

   { "roles": ["write"],
     "grantedToIdentities": [
       { "application": { "id": "{client_id}", "displayName": "Muesli" } } ] }
   ```

   or, with PnP PowerShell (takes the site URL directly):

   ```
   Grant-PnPAzureADAppSitePermission -AppId {client_id} -DisplayName Muesli -Site {site_url} -Permissions Write
   ```

## 4. Connect a library (web app)

Open **Settings → Connections → Connected storage**, pick the workspace, and next to **SharePoint** click **Attach a library** (the same step also appears in the workspace-creation wizard). The wizard walks four stages:

1. **App identity** — use the server's configured app, or switch to "use your own Entra app" and paste a client id plus a secret or a certificate + private key pair.
2. **Grant** — the copyable admin-consent URL and both site-grant snippets, pre-filled.
3. **Site** — enter your tenant (GUID or domain) and the site URL, then find the site's libraries. The credentials are used for this lookup only and are not stored by it.
4. **Connect** — pick the document library (the site's default library is preselected), optionally set a path prefix inside it, and connect. The server probes the library before creating the connection, so a missing grant or wrong site fails here with a pointed error, not later during sync.

Documents are then attached to the connection individually, exactly like the other backends — see [S3-compatible storage](s3.md) for the attach call.

## Bring your own Entra app

A workspace may use its **own** Entra app instead of the server's: choose "use your own Entra app" in the wizard's identity stage. Those credentials are stored **encrypted per workspace** — the server must set `MUESLI_SECRET_KEY` (32 bytes, hex or base64) — and the connection shows a `workspace key` badge in Settings. The operator's app is never consented into your tenant on this path.

## How sync behaves

- Files are written at their normal `rel_path` inside the chosen library, optionally under the prefix. Writes and out-of-band polling behave exactly like S3: edits land ~500ms after a typing burst, external changes are ingested within one `MUESLI_STORAGE_POLL_SECS` interval (default 20 seconds), hash-guarded.
- Writes over 4 MB automatically use Graph upload sessions (chunked uploads).
- Graph 429 throttling surfaces on the workspace's storage-health line in Settings and retries on the next poll tick.
- Revoking the site grant does not break editing — the live document stays available; the health line turns unhealthy with the Graph error, and re-granting recovers sync on the next poll.

> **Warning: shared app on multi-customer deployments.** When the server's env-configured Entra app is multi-tenant and the deployment serves multiple unrelated customers, any workspace admin can attach any site that any tenant has granted to that app — the server cannot verify that the connecting admin belongs to the target tenant. On multi-customer (hosted) deployments, do not configure a shared `MUESLI_MS_*` env app; leave it unset so every workspace must bring its own Entra app through the wizard.

## See also

- [Storage backends](../concepts/storage-backends.md) — the model shared by all backends.
- [Self-hosting configuration](../self-hosting/configuration.md) — all server environment variables.
