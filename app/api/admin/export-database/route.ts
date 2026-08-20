import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function escapeSqlValue(value: any): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (value instanceof Date) return `'${value.toISOString()}'`;
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  
  // String escaping for SQL
  const str = String(value);
  return `'${str.replace(/'/g, "''")}'`;
}

function generateTableSql(tableName: string, rows: any[]): string {
  if (!rows || rows.length === 0) return `-- Table: "${tableName}" (0 rows)\n\n`;

  const columns = Object.keys(rows[0]);
  const columnsList = columns.map((col) => `"${col}"`).join(", ");

  let sql = `-- Table: "${tableName}" (${rows.length} rows)\n`;
  for (const row of rows) {
    const values = columns.map((col) => escapeSqlValue(row[col])).join(", ");
    sql += `INSERT INTO "${tableName}" (${columnsList}) VALUES (${values}) ON CONFLICT DO NOTHING;\n`;
  }
  sql += "\n";
  return sql;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, isAdmin: true },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") || "json").toLowerCase();

    // Fetch all database records in parallel
    const [
      users,
      accounts,
      sessions,
      verificationTokens,
      passwordResetTokens,
      workspaces,
      workspaceMembers,
      invites,
      categories,
      products,
      wallets,
      transactions,
      sales,
      saleExpenses,
      plans,
      subscriptions,
      payments,
      pushSubscriptions,
    ] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.account.findMany(),
      prisma.session.findMany(),
      prisma.verificationToken.findMany(),
      prisma.passwordResetToken.findMany(),
      prisma.workspace.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.workspaceMember.findMany(),
      prisma.invite.findMany(),
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.wallet.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.transaction.findMany({ orderBy: { date: "asc" } }),
      prisma.sale.findMany({ orderBy: { date: "asc" } }),
      prisma.saleExpense.findMany({ orderBy: { date: "asc" } }),
      prisma.plan.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.subscription.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.payment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.pushSubscription.findMany(),
    ]);

    const dateStr = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);

    if (format === "sql") {
      let sqlDump = `-- ==========================================================================\n`;
      sqlDump += `-- DWITKU DATABASE DUMP (PostgreSQL / Neon)\n`;
      sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
      sqlDump += `-- Exported by: ${adminUser.name || "Admin"} (${adminUser.email})\n`;
      sqlDump += `-- ==========================================================================\n\n`;
      sqlDump += `BEGIN;\n\n`;

      // Order tables to respect foreign keys
      sqlDump += generateTableSql("User", users);
      sqlDump += generateTableSql("Account", accounts);
      sqlDump += generateTableSql("Session", sessions);
      sqlDump += generateTableSql("VerificationToken", verificationTokens);
      sqlDump += generateTableSql("PasswordResetToken", passwordResetTokens);
      sqlDump += generateTableSql("Workspace", workspaces);
      sqlDump += generateTableSql("WorkspaceMember", workspaceMembers);
      sqlDump += generateTableSql("Invite", invites);
      sqlDump += generateTableSql("Category", categories);
      sqlDump += generateTableSql("Product", products);
      sqlDump += generateTableSql("Wallet", wallets);
      sqlDump += generateTableSql("Transaction", transactions);
      sqlDump += generateTableSql("Sale", sales);
      sqlDump += generateTableSql("SaleExpense", saleExpenses);
      sqlDump += generateTableSql("Plan", plans);
      sqlDump += generateTableSql("Subscription", subscriptions);
      sqlDump += generateTableSql("Payment", payments);
      sqlDump += generateTableSql("PushSubscription", pushSubscriptions);

      sqlDump += `COMMIT;\n`;

      const filename = `dwitku-backup-${dateStr}.sql`;
      return new NextResponse(sqlDump, {
        headers: {
          "Content-Type": "application/sql",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default JSON format
    const backupData = {
      metadata: {
        application: "Dwitku",
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        exportedBy: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
        },
        counts: {
          users: users.length,
          workspaces: workspaces.length,
          workspaceMembers: workspaceMembers.length,
          categories: categories.length,
          wallets: wallets.length,
          transactions: transactions.length,
          products: products.length,
          sales: sales.length,
          saleExpenses: saleExpenses.length,
          plans: plans.length,
          subscriptions: subscriptions.length,
          payments: payments.length,
        },
      },
      tables: {
        users,
        accounts,
        sessions,
        verificationTokens,
        passwordResetTokens,
        workspaces,
        workspaceMembers,
        invites,
        categories,
        products,
        wallets,
        transactions,
        sales,
        saleExpenses,
        plans,
        subscriptions,
        payments,
        pushSubscriptions,
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const filename = `dwitku-backup-${dateStr}.json`;

    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Export database error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to export database" },
      { status: 500 }
    );
  }
}
