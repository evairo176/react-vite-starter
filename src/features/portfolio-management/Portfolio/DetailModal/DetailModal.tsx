import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Type,
    Link,
    AlignLeft,
    Layers,
    Tags,
    Cpu,
    Star,
    Globe,
    FileText,
    X,
    ImageIcon
} from "lucide-react";
import useDetailModal from "./useDetailModal";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type DetailModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    id: string;
};

export default function DetailModal({
    open,
    setOpen,
    id,
}: DetailModalProps) {
    const { portfolio, isLoading } = useDetailModal({ id, open });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-7xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-2xl">
                <DialogHeader className="px-6 py-4 border-b border-border/40 bg-muted/20 shrink-0">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground/90">
                        Portfolio Details
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        View complete information about this project.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : portfolio ? (
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                                        <FileText className="w-4 h-4" />
                                        Basic Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid gap-1">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <Type className="w-3 h-3" /> Title
                                            </label>
                                            <div className="text-lg font-medium">{portfolio.title}</div>
                                        </div>

                                        <div className="grid gap-1">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <Link className="w-3 h-3" /> Slug
                                            </label>
                                            <div className="font-mono text-sm bg-muted/50 px-2 py-1 rounded w-fit">{portfolio.slug}</div>
                                        </div>

                                        <Separator className="my-2" />

                                        <div className="grid gap-1">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <AlignLeft className="w-3 h-3" /> Short Description
                                            </label>
                                            <p className="text-muted-foreground leading-relaxed">{portfolio.shortDesc}</p>
                                        </div>

                                        <div className="grid gap-1">
                                            <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
                                                <AlignLeft className="w-3 h-3" /> Full Description
                                            </label>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{portfolio.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                                        <ImageIcon className="w-4 h-4" />
                                        Project Gallery
                                    </h3>

                                    {portfolio.images && portfolio.images.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {portfolio.images.map((img: any) => (
                                                <div key={img.id} className="group relative aspect-video rounded-lg overflow-hidden border bg-muted/50">
                                                    <img
                                                        src={img.url}
                                                        alt={img.alt || "Portfolio image"}
                                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    />
                                                    {img.alt && (
                                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                                                            {img.alt}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground/50 text-sm italic">
                                            No images available for this project.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Meta & Settings */}
                            <div className="space-y-6">
                                {/* Categorization Card */}
                                <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-6">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-4">
                                        <Layers className="w-4 h-4" />
                                        Categorization
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Category</label>
                                            {portfolio.category ? (
                                                <Badge variant="outline" className="text-sm py-1 px-3 border-primary/20 bg-primary/5 text-primary">
                                                    {portfolio.category.name}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">-</span>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                                <Tags className="w-3 h-3" /> Tags
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {portfolio.tags && portfolio.tags.length > 0 ? (
                                                    portfolio.tags.map((t: any) => (
                                                        <Badge key={t.tagId} variant="secondary">
                                                            {t.tag.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center gap-1.5">
                                                <Cpu className="w-3 h-3" /> Tech Stack
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                {portfolio.techStacks && portfolio.techStacks.length > 0 ? (
                                                    portfolio.techStacks.map((t: any) => (
                                                        <Badge key={t.techId} variant="outline" className="bg-background">
                                                            {t.tech.name}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Visibility Card */}
                                <div className="bg-card/50 rounded-xl p-4 md:p-6 border shadow-sm space-y-4">
                                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                                        <Globe className="w-4 h-4" />
                                        Visibility & Links
                                    </h3>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                                            <div className="flex items-center gap-2">
                                                <Star className={`w-4 h-4 ${portfolio.featured ? "text-amber-500 fill-current" : "text-muted-foreground"}`} />
                                                <span className="text-sm font-medium">Featured</span>
                                            </div>
                                            <Badge variant={portfolio.featured ? "default" : "outline"}>
                                                {portfolio.featured ? "Yes" : "No"}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                                            <div className="flex items-center gap-2">
                                                <Globe className={`w-4 h-4 ${portfolio.isPublished ? "text-emerald-500" : "text-muted-foreground"}`} />
                                                <span className="text-sm font-medium">Published</span>
                                            </div>
                                            <Badge variant={portfolio.isPublished ? "default" : "secondary"} className={portfolio.isPublished ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                {portfolio.isPublished ? "Live" : "Draft"}
                                            </Badge>
                                        </div>

                                        {(portfolio.liveUrl || portfolio.repoUrl) && (
                                            <>
                                                <Separator className="my-1" />
                                                {portfolio.liveUrl && (
                                                    <a href={portfolio.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline p-1">
                                                        <Globe className="w-3.5 h-3.5" /> Live Preview
                                                    </a>
                                                )}
                                                {portfolio.repoUrl && (
                                                    <a href={portfolio.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline p-1">
                                                        <Link className="w-3.5 h-3.5" /> Source Code
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        Failed to load details.
                    </div>
                )}

                <DialogFooter className="px-6 py-4 border-t border-border/40 bg-muted/20 shrink-0">
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer gap-2"
                        >
                            <X className="w-4 h-4" />
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
