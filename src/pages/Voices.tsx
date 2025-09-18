import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Volume2 } from "lucide-react";

interface GithubContentItem {
  name: string;
  path: string;
  download_url: string | null;
  type: "file" | "dir";
}

interface VoiceItem {
  name: string;
  url: string;
}

const REPO_API_URL = "https://api.github.com/repos/whisper2025-glit/Muzik/contents/voices?ref=main";

export default function Voices() {
  const [items, setItems] = useState<VoiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");

  const fetchVoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(REPO_API_URL, {
        headers: {
          Accept: "application/vnd.github+json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to load voices: ${res.status}`);
      }
      const data: GithubContentItem[] = await res.json();
      const wavs = (data || [])
        .filter((f) => f.type === "file" && f.name.toLowerCase().endsWith(".wav") && !!f.download_url)
        .map((f) => ({ name: f.name.replace(/\.wav$/i, ""), url: f.download_url as string }));
      // Sort by name consistently
      wavs.sort((a, b) => a.name.localeCompare(b.name));
      setItems(wavs);
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.name.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Layout headerPosition="fixed" contentUnderHeader>
      <div className="min-h-full px-4 pb-6 pt-20 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" /> Voices
          </h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search voices"
              className="w-full sm:w-64"
              aria-label="Search voices"
            />
            <Button variant="outline" size="icon" onClick={fetchVoices} aria-label="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <a
              href="https://github.com/whisper2025-glit/Muzik/tree/main/voices"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="icon" aria-label="Open voices on GitHub">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/50">
            <CardContent className="p-4 text-destructive text-sm">{error}</CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading && items.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <CardTitle className="text-sm bg-muted h-4 w-40 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="bg-muted h-10 w-full rounded" />
                </CardContent>
              </Card>
            ))
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground">No voices found.</CardContent>
            </Card>
          ) : (
            filtered.map((v) => (
              <Card key={v.url} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm break-words">{v.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <audio controls preload="none" className="w-full">
                    <source src={v.url} type="audio/wav" />
                  </audio>
                  <div className="flex items-center gap-2">
                    <a href={v.url} download>
                      <Button size="sm" variant="secondary">Download</Button>
                    </a>
                    <a href={v.url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">Open</Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground pt-2">Showing {filtered.length} voice{filtered.length === 1 ? "" : "s"}.</p>
        )}
      </div>
    </Layout>
  );
}
