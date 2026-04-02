#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const API = "https://api.cloudflare.com/client/v4";

if (!TOKEN || !ACCOUNT) {
  console.error(
    chalk.red("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID"),
  );
  process.exit(1);
}

async function cf(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  const data = await res.json();
  if (!data.success) {
    console.error(chalk.red(JSON.stringify(data.errors, null, 2)));
    process.exit(1);
  }
  return data.result;
}

const json = (d) => console.log(JSON.stringify(d, null, 2));

// ====== ZONES ======
program
  .command("zones:list")
  .description("List all zones")
  .action(async () => {
    json(await cf("/zones?per_page=50"));
  });

program
  .command("zones:get <zone_id>")
  .description("Get zone details")
  .action(async (id) => {
    json(await cf(`/zones/${id}`));
  });

program
  .command("zones:create <name>")
  .description("Create a zone")
  .action(async (name) => {
    json(
      await cf("/zones", {
        method: "POST",
        body: JSON.stringify({ name, account: { id: ACCOUNT } }),
      }),
    );
  });

program
  .command("zones:delete <zone_id>")
  .description("Delete a zone")
  .action(async (id) => {
    json(await cf(`/zones/${id}`, { method: "DELETE" }));
  });

program
  .command("zones:purge <zone_id>")
  .description("Purge all cache")
  .action(async (id) => {
    json(
      await cf(`/zones/${id}/purge_cache`, {
        method: "POST",
        body: JSON.stringify({ purge_everything: true }),
      }),
    );
  });

// ====== DNS ======
program
  .command("dns:list <zone_id>")
  .description("List DNS records")
  .action(async (zid) => {
    json(await cf(`/zones/${zid}/dns_records?per_page=100`));
  });

program
  .command("dns:create <zone_id> <type> <name> <content>")
  .option("--proxied", "Proxy through CF", false)
  .option("--ttl <ttl>", "TTL", "1")
  .description("Create DNS record")
  .action(async (zid, type, name, content, opts) => {
    json(
      await cf(`/zones/${zid}/dns_records`, {
        method: "POST",
        body: JSON.stringify({
          type,
          name,
          content,
          proxied: opts.proxied,
          ttl: parseInt(opts.ttl),
        }),
      }),
    );
  });

program
  .command("dns:update <zone_id> <record_id> <type> <name> <content>")
  .option("--proxied", "", false)
  .option("--ttl <ttl>", "", "1")
  .description("Update DNS record")
  .action(async (zid, rid, type, name, content, opts) => {
    json(
      await cf(`/zones/${zid}/dns_records/${rid}`, {
        method: "PUT",
        body: JSON.stringify({
          type,
          name,
          content,
          proxied: opts.proxied,
          ttl: parseInt(opts.ttl),
        }),
      }),
    );
  });

program
  .command("dns:delete <zone_id> <record_id>")
  .description("Delete DNS record")
  .action(async (zid, rid) => {
    json(await cf(`/zones/${zid}/dns_records/${rid}`, { method: "DELETE" }));
  });

// ====== WORKERS ======
program
  .command("workers:list")
  .description("List Workers scripts")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/workers/scripts`));
  });

program
  .command("workers:delete <name>")
  .description("Delete a Worker")
  .action(async (name) => {
    json(
      await cf(`/accounts/${ACCOUNT}/workers/scripts/${name}`, {
        method: "DELETE",
      }),
    );
  });

// ====== PAGES ======
program
  .command("pages:list")
  .description("List Pages projects")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/pages/projects`));
  });

program
  .command("pages:get <name>")
  .description("Get Pages project details")
  .action(async (name) => {
    json(await cf(`/accounts/${ACCOUNT}/pages/projects/${name}`));
  });

program
  .command("pages:delete <name>")
  .description("Delete Pages project")
  .action(async (name) => {
    json(
      await cf(`/accounts/${ACCOUNT}/pages/projects/${name}`, {
        method: "DELETE",
      }),
    );
  });

// ====== KV ======
program
  .command("kv:list")
  .description("List KV namespaces")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/storage/kv/namespaces`));
  });

program
  .command("kv:create <title>")
  .description("Create KV namespace")
  .action(async (title) => {
    json(
      await cf(`/accounts/${ACCOUNT}/storage/kv/namespaces`, {
        method: "POST",
        body: JSON.stringify({ title }),
      }),
    );
  });

program
  .command("kv:delete <ns_id>")
  .description("Delete KV namespace")
  .action(async (id) => {
    json(
      await cf(`/accounts/${ACCOUNT}/storage/kv/namespaces/${id}`, {
        method: "DELETE",
      }),
    );
  });

program
  .command("kv:keys <ns_id>")
  .description("List keys in KV namespace")
  .action(async (id) => {
    json(await cf(`/accounts/${ACCOUNT}/storage/kv/namespaces/${id}/keys`));
  });

program
  .command("kv:get <ns_id> <key>")
  .description("Get KV value")
  .action(async (id, key) => {
    const res = await fetch(
      `${API}/accounts/${ACCOUNT}/storage/kv/namespaces/${id}/values/${key}`,
      { headers: { Authorization: `Bearer ${TOKEN}` } },
    );
    console.log(await res.text());
  });

program
  .command("kv:put <ns_id> <key> <value>")
  .description("Put KV value")
  .action(async (id, key, value) => {
    json(
      await cf(
        `/accounts/${ACCOUNT}/storage/kv/namespaces/${id}/values/${key}`,
        {
          method: "PUT",
          body: value,
          headers: { "Content-Type": "text/plain" },
        },
      ),
    );
  });

// ====== R2 ======
program
  .command("r2:list")
  .description("List R2 buckets")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/r2/buckets`));
  });

program
  .command("r2:create <name>")
  .description("Create R2 bucket")
  .action(async (name) => {
    json(
      await cf(`/accounts/${ACCOUNT}/r2/buckets`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    );
  });

program
  .command("r2:delete <name>")
  .description("Delete R2 bucket")
  .action(async (name) => {
    json(
      await cf(`/accounts/${ACCOUNT}/r2/buckets/${name}`, {
        method: "DELETE",
      }),
    );
  });

// ====== D1 ======
program
  .command("d1:list")
  .description("List D1 databases")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/d1/database`));
  });

program
  .command("d1:create <name>")
  .description("Create D1 database")
  .action(async (name) => {
    json(
      await cf(`/accounts/${ACCOUNT}/d1/database`, {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    );
  });

program
  .command("d1:query <db_id> <sql>")
  .description("Execute SQL on D1")
  .action(async (id, sql) => {
    json(
      await cf(`/accounts/${ACCOUNT}/d1/database/${id}/query`, {
        method: "POST",
        body: JSON.stringify({ sql }),
      }),
    );
  });

program
  .command("d1:delete <db_id>")
  .description("Delete D1 database")
  .action(async (id) => {
    json(
      await cf(`/accounts/${ACCOUNT}/d1/database/${id}`, {
        method: "DELETE",
      }),
    );
  });

// ====== TUNNELS ======
program
  .command("tunnels:list")
  .description("List tunnels")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/cfd_tunnel`));
  });

program
  .command("tunnels:get <tunnel_id>")
  .description("Get tunnel details")
  .action(async (id) => {
    json(await cf(`/accounts/${ACCOUNT}/cfd_tunnel/${id}`));
  });

program
  .command("tunnels:delete <tunnel_id>")
  .description("Delete tunnel")
  .action(async (id) => {
    json(
      await cf(`/accounts/${ACCOUNT}/cfd_tunnel/${id}`, { method: "DELETE" }),
    );
  });

// ====== TOKENS ======
program
  .command("tokens:list")
  .description("List API tokens")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}/tokens`));
  });

program
  .command("tokens:verify")
  .description("Verify current token")
  .action(async () => {
    json(await cf("/user/tokens/verify"));
  });

// ====== ACCOUNT ======
program
  .command("account:info")
  .description("Get account details")
  .action(async () => {
    json(await cf(`/accounts/${ACCOUNT}`));
  });

program.parse();
