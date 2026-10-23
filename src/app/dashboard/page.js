import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import DashboardView from "./DashboardView";

export const metadata = {
  title: "Dashboard | Nurturely CRM",
};

export default function DashboardPage() {
  return (
    <ProtectedRoutes>
      <SidebarNav>
        <DashboardView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
