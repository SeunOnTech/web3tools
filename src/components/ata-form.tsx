"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AtaResponse {
  token: string;
  tokenMint: string;
  ownerPublicKey: string;
  associatedToken: string;
  status: string;
  instruction: {
    programId: string;
    keys: { pubkey: string; isSigner: boolean; isWritable: boolean }[];
  } | null;
}

interface ErrorResponse {
  status: boolean | string;
  token: string;
  error: string;
}

const tokens = [
  { name: "USD Coin", symbol: "USDC", image: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png" },
  { name: "dogwifhat", symbol: "WIF", image: "https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg?1702499428" },
  { name: "Solana", symbol: "SOL", image: "https://assets.coingecko.com/coins/images/4128/standard/solana.png" },
  { name: "Ethereum", symbol: "ETH", image: "https://assets.coingecko.com/coins/images/279/standard/ethereum.png?1696501628" },
  { name: "Turbo ETH", symbol: "tETH", image: "https://assets.coingecko.com/coins/images/52492/standard/tETH.png?1733441914" },
  { name: "Orca", symbol: "ORCA", image: "https://assets.coingecko.com/coins/images/17547/standard/Orca_Logo.png?1696517083" },
  { name: "Tether USD", symbol: "USDT", image: "https://assets.coingecko.com/coins/images/325/standard/Tether.png?1696501661" },
  { name: "BITZ", symbol: "BITZ", image: "https://assets.coingecko.com/coins/images/55907/standard/download.png?1747672115" },
];

export default function AtaForm() {
  const [tokenInput, setTokenInput] = useState("");
  const [ownerPublicKey, setOwnerPublicKey] = useState("");
  const [result, setResult] = useState<AtaResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidPublicKey = (key: string) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(key);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    if (!isValidPublicKey(ownerPublicKey)) {
      toast.error("Invalid Public Key", {
        description: "Please enter a valid Solana public key (32-44 base58 characters).",
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/createAta?tokenInput=${encodeURIComponent(
          tokenInput
        )}&ownerPublicKey=${encodeURIComponent(ownerPublicKey)}&apiKey=${encodeURIComponent(
          process.env.NEXT_PUBLIC_API_KEY || ""
        )}`
      );

      const data: AtaResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        toast.error("Error", {
          description: (data as ErrorResponse).error || "Failed to create ATA",
          style: {
            background: "hsl(var(--destructive))",
            color: "hsl(var(--destructive-foreground))",
            border: "1px solid hsl(var(--border))",
          },
        });
        setIsLoading(false);
        return;
      }

      setResult(data as AtaResponse);
      toast.success("Success", {
        description: `ATA ${data.status === "Account Exists" ? "verified" : "created"} for ${data.token}.`,
        style: {
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    } catch (err) {
      toast.error("Network Error", {
        description: "Could not connect to the server. Please try again later.",
        style: {
          background: "hsl(var(--destructive))",
          color: "hsl(var(--destructive-foreground))",
          border: "1px solid hsl(var(--border))",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-lg shadow-black/20 bg-card/90 backdrop-blur-sm">
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="tokenInput" className="text-sm font-medium text-foreground">
              Token
            </Label>
            <Select value={tokenInput} onValueChange={setTokenInput} required>
              <SelectTrigger
                id="tokenInput"
                className="bg-secondary/80 border-border/50 focus:ring-ring hover:bg-secondary/90 transition-colors"
              >
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/50">
                {tokens.map((token) => (
                  <SelectItem
                    key={token.symbol}
                    value={token.symbol}
                    className="flex items-center gap-2 hover:bg-accent/90 focus:bg-accent/90"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={token.image}
                        alt={`${token.name} logo`}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/24?text=Token")}
                      />
                      <span>{token.name} ({token.symbol})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPublicKey" className="text-sm font-medium text-foreground">
              Public Key/Wallet Address
            </Label>
            <Input
              id="ownerPublicKey"
              value={ownerPublicKey}
              onChange={(e) => setOwnerPublicKey(e.target.value)}
              placeholder="Enter Solana public key"
              required
              className="bg-secondary/80 border-border/50 focus:ring-ring focus:border-ring placeholder:text-muted-foreground/50 transition-colors"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4 mt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-transform"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create/Verify ATA"
            )}
          </Button>
          {result && (
            <div className="text-sm text-muted-foreground space-y-2 py-4 rounded-md w-full">
              <p><strong>Token:</strong> {result.token}</p>
              <p><strong>Token Mint:</strong> {result.tokenMint}</p>
              <p><strong>Owner Public Key:</strong> {result.ownerPublicKey}</p>
              <p><strong>Associated Token Address:</strong> {result.associatedToken}</p>
              <p><strong>Status:</strong> {result.status}</p>
              {result.instruction && (
                <div>
                  <p><strong>Instruction:</strong></p>
                  <p>Program ID: {result.instruction.programId}</p>
                  <p>Keys:</p>
                  <ul className="list-disc pl-5">
                    {result.instruction.keys.map((key, index) => (
                      <li key={index}>
                        Pubkey: {key.pubkey}, Signer: {key.isSigner.toString()}, Writable: {key.isWritable.toString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}