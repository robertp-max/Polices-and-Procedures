import { EmployeePortalShell } from "../_components/EmployeePortalShell";

export default function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <EmployeePortalShell>{children}</EmployeePortalShell>;
}

