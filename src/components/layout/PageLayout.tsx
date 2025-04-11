
import { ReactNode } from "react";
import { NavbarWithChat } from "@/components/layout/NavbarWithChat";
import { Footer } from "@/components/layout/Footer";

interface PageLayoutProps {
  children: ReactNode;
  transparent?: boolean;
}

export function PageLayout({ children, transparent = false }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavbarWithChat transparent={transparent} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
