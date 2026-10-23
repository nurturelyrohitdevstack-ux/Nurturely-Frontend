import ProtectedRoutes from "@/lib/ProtectedRoutes";
import SidebarNav from "@/app/Components/portal-ui/SidebarNav";
import ProfileView from "./ProfileView";

export const metadata = {
  title: "My Profile | Nurturely CRM",
};

export default function ProfilePage() {
  return (
    <ProtectedRoutes>
      <SidebarNav>
        <ProfileView />
      </SidebarNav>
    </ProtectedRoutes>
  );
}
