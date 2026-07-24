import { PreviewProvider } from "./_components/PreviewContext";

export default function JourneyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <PreviewProvider>{children}</PreviewProvider>;
}

