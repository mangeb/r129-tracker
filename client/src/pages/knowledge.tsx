import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ExternalLink, AlertTriangle, Wrench, BookOpen, Lightbulb } from "lucide-react";
import type { KnowledgeBase } from "@shared/schema";

const KB_CATEGORIES = [
  { value: "known_issue", label: "Known Issues", shortLabel: "Issues", icon: AlertTriangle },
  { value: "mod_guide", label: "Mod Guides", shortLabel: "Mods", icon: Wrench },
  { value: "reference", label: "Reference", shortLabel: "Ref", icon: BookOpen },
  { value: "tip", label: "Tips", shortLabel: "Tips", icon: Lightbulb },
];

export default function KnowledgePage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("known_issue");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("known_issue");
  const [tags, setTags] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const { data: entries = [], isLoading } = useQuery<KnowledgeBase[]>({
    queryKey: ["/api/knowledge"],
  });

  const createEntry = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/knowledge", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Knowledge entry added" });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/knowledge/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/knowledge"] });
      toast({ title: "Entry removed" });
    },
  });

  function resetForm() {
    setTitle(""); setContent(""); setCategory("known_issue"); setTags(""); setSourceUrl("");
  }

  function handleCreate() {
    if (!title || !content) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    const tagList = tags ? JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean)) : null;
    createEntry.mutate({
      title,
      content,
      category,
      tags: tagList,
      sourceUrl: sourceUrl || null,
      createdAt: new Date().toISOString(),
    });
  }

  const filteredEntries = entries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.tags && e.tags.toLowerCase().includes(q))
    );
  });

  const activeCatEntries = filteredEntries.filter((e) => e.category === activeCategory);

  return (
    <div className="space-y-4 md:space-y-6" data-testid="knowledge-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight" data-testid="text-page-title">Knowledge Base</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            R129 SL500 reference and guides
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-knowledge">
              <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Add Entry</span><span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Knowledge Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-kb-title" />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger data-testid="select-kb-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KB_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Content (supports markdown-style formatting)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px]"
                data-testid="input-kb-content"
              />
              <Input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} data-testid="input-kb-tags" />
              <Input placeholder="Source URL (optional)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} data-testid="input-kb-source" />
              <Button onClick={handleCreate} disabled={createEntry.isPending} className="w-full" data-testid="button-submit-kb">
                {createEntry.isPending ? "Adding..." : "Add Entry"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Input
        type="search"
        placeholder="Search knowledge base..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-full md:max-w-sm text-sm"
        data-testid="input-kb-search"
      />

      {/* Category pills — scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" data-testid="kb-category-pills">
        {KB_CATEGORIES.map((cat) => {
          const count = filteredEntries.filter((e) => e.category === cat.value).length;
          const isActive = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`pill-${cat.value}`}
            >
              <cat.icon className="w-3 h-3" />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="sm:hidden">{cat.shortLabel}</span>
              <span>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Entries for active category */}
      {activeCatEntries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            {KB_CATEGORIES.map((c) => c.value === activeCategory ? (
              <div key={c.value}>
                <c.icon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No {c.label.toLowerCase()} entries yet.</p>
              </div>
            ) : null)}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {activeCatEntries.map((entry) => {
            const isExpanded = expandedId === entry.id;
            let parsedTags: string[] = [];
            try { parsedTags = entry.tags ? JSON.parse(entry.tags) : []; } catch { /* */ }

            return (
              <Card
                key={entry.id}
                className="cursor-pointer group"
                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                data-testid={`kb-card-${entry.id}`}
              >
                <CardContent className="py-3 px-3 md:px-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs md:text-sm font-semibold leading-tight">{entry.title}</h4>
                      {parsedTags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {parsedTags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] h-4 px-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.sourceUrl && (
                        <a
                          href={entry.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="md:opacity-0 md:group-hover:opacity-100 h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); deleteEntry.mutate(entry.id); }}
                        data-testid={`button-delete-kb-${entry.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="text-xs md:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {entry.content}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
