import AppShell from "@/components/layout/AppShell";

export default function OpsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}