import { getProjects } from "@/app/actions/admin";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function AdminProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Projects Management</h1>
      <DataTable columns={columns} data={projects} searchKey="name" />
    </div>
  );
}
