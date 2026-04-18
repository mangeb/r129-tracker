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
import { Plus, Trash2, ExternalLink, Package } from "lucide-react";
import type { Part } from "@shared/schema";

const CATEGORIES = ["engine", "suspension", "brakes", "electrical", "interior", "exterior", "transmission", "cooling", "misc"];
const PART_STATUSES = ["needed", "ordered", "shipped", "received", "installed"];

function partStatusColor(s: string) {
  switch (s) {
    case "installed": return "bg-green-500/10 text-green-400 border-green-500/20";
    case "received": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "shipped": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "ordered": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default: return "bg-muted text-muted-foreground";
  }
}

export default function PartsPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeStatus, setActiveStatus] = useState("needed");

  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [category, setCategory] = useState("engine");
  const [vendor, setVendor] = useState("");
  const [vendorUrl, setVendorUrl] = useState("");
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isOem, setIsOem] = useState(false);

  const { data: parts = [], isLoading } = useQuery<Part[]>({ queryKey: ["/api/parts"] });

  const createPart = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await apiRequest("POST", "/api/parts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setDialogOpen(false);
      resetForm();
      toast({ title: "Part added to list" });
    },
  });

  const updatePart = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Record<string, unknown>) => {
      const res = await apiRequest("PATCH", `/api/parts/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const deletePart = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/parts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({ title: "Part removed" });
    },
  });

  function resetForm() {
    setName(""); setPartNumber(""); setCategory("engine"); setVendor("");
    setVendorUrl(""); setEstimatedPrice(""); setNotes(""); setIsOem(false);
  }

  function handleCreate() {
    if (!name) {
      toast({ title: "Part name is required", variant: "destructive" });
      return;
    }
    createPart.mutate({
      name,
      partNumber: partNumber || null,
      category,
      vendor: vendor || null,
      vendorUrl: vendorUrl || null,
      estimatedPrice: estimatedPrice ? Number(estimatedPrice) : null,
      notes: notes || null,
      isOem,
      status: "needed",
    });
  }

  const filtered = parts.filter((p) => {
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    return true;
  });

  const grouped: Record<string, Part[]> = {};
  for (const part of filtered) {
    const s = part.status;
    if (!grouped[s]) grouped[s] = [];
    grouped[s].push(part);
  }

  const totalEstimated = parts.reduce((sum, p) => sum + (p.estimatedPrice || 0), 0);
  const totalActual = parts.reduce((sum, p) => sum + (p.actualPrice || 0), 0);

  const activeStatusParts = grouped[activeStatus] || [];

  return (
    <div className="space-y-4 md:space-y-6" data-testid="parts-page">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight" data-testid="text-page-title">Parts List</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            {parts.length} parts · Est. ${totalEstimated.toLocaleString()}
            {totalActual > 0 && ` · Actual: $${totalActual.toLocaleString()}`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-add-part">
              <Plus className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Add Part</span><span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Part</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Part name" value={name} onChange={(e) => setName(e.target.value)} data-testid="input-part-name" />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Part number (optional)" value={partNumber} onChange={(e) => setPartNumber(e.target.value)} data-testid="input-part-number" />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger data-testid="select-part-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} data-testid="input-part-vendor" />
                <Input placeholder="Vendor URL" value={vendorUrl} onChange={(e) => setVendorUrl(e.target.value)} data-testid="input-part-url" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Est. price ($)" value={estimatedPrice} onChange={(e) => setEstimatedPrice(e.target.value)} data-testid="input-part-price" />
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOem}
                    onChange={(e) => setIsOem(e.target.checked)}
                    className="rounded"
                    data-testid="checkbox-oem"
                  />
                  OEM Part
                </label>
              </div>
              <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-part-notes" />
              <Button onClick={handleCreate} disabled={createPart.isPending} className="w-full" data-testid="button-submit-part">
                {createPart.isPending ? "Adding..." : "Add Part"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter by category */}
      <div className="flex gap-2 md:gap-3">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px] md:w-[160px] text-xs md:text-sm" data-testid="filter-part-category"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status pills — scrollable on mobile instead of TabsList */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" data-testid="parts-status-pills">
        {PART_STATUSES.map((s) => {
          const count = (grouped[s] || []).length;
          const isActive = activeStatus === s;
          return (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`pill-${s}`}
            >
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Parts list for active status */}
      {activeStatusParts.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No parts with status "{activeStatus}"</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {activeStatusParts.map((part) => (
            <Card key={part.id} className="group" data-testid={`part-card-${part.id}`}>
              <CardContent className="py-3 px-3 md:px-4">
                <div className="flex items-start gap-2 md:gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">{part.name}</span>
                      {part.isOem && <Badge variant="outline" className="text-[10px] h-4 px-1">OEM</Badge>}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-[10px] capitalize h-4 px-1">{part.category}</Badge>
                      {part.vendor && (
                        <span className="text-[11px] text-muted-foreground">{part.vendor}</span>
                      )}
                      {part.partNumber && (
                        <span className="text-[11px] text-muted-foreground font-mono hidden sm:inline">#{part.partNumber}</span>
                      )}
                      {part.estimatedPrice != null && (
                        <span className="text-[11px] text-muted-foreground md:hidden">${part.estimatedPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {part.estimatedPrice != null && (
                      <span className="text-xs text-muted-foreground hidden md:inline">${part.estimatedPrice.toLocaleString()}</span>
                    )}

                    {/* Status cycler */}
                    <Select
                      value={part.status}
                      onValueChange={(val) => updatePart.mutate({ id: part.id, status: val })}
                    >
                      <SelectTrigger className={`h-6 text-[10px] md:text-xs px-1.5 md:px-2 w-auto border ${partStatusColor(part.status)}`} data-testid={`select-status-${part.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PART_STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {part.vendorUrl && (
                      <a href={part.vendorUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                      </a>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:opacity-0 md:group-hover:opacity-100 h-7 w-7 p-0 shrink-0"
                      onClick={() => deletePart.mutate(part.id)}
                      data-testid={`button-delete-part-${part.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
