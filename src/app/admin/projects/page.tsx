import { prisma } from "@/lib/prisma";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      owner: {
        select: { name: true, email: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Projects Management</h1>
      <DataTable columns={columns} data={projects} searchKey="name" />
    </div>
  );
}
