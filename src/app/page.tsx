import AtaForm from "@/components/ata-form";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="max-w-lg w-full space-y-6 animate-in fade-in duration-1000">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Solana ATA Devtool</h1>
          <p className="text-lg text-muted-foreground">
            Seamlessly create or verify Associated Token Accounts on Solana
          </p>
        </div>
        <Separator className="bg-border/50" />
        <AtaForm />
      </div>
    </main>
  );
}