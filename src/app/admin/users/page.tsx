import { DataTable } from "./data-table";
import { columns } from "./columns";
import { prisma } from "@/lib/prisma";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Users Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
