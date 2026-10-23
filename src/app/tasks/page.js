import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import TasksView from "./TasksView";

export const metadata = {
  title: "Tasks & Follow-ups | Nurturely CRM",
};

export default function TasksPage() {
  return (
    <ProtectedRoutes>
      <SidebarNav>
        <TasksView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
