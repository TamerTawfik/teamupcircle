import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getUsers } from "@/app/actions/admin";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Users Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}
