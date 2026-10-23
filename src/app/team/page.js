import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import TeamView from "./TeamView";

export const metadata = {
  title: "Team Management | Nurturely CRM",
};

export default function TeamPage() {
  return (
    <ProtectedRoutes roles={["admin"]}>
      <SidebarNav>
        <TeamView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
