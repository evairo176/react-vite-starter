import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { themes } from "@/core/config/themes";
import { useTheme } from "@/core/providers/theme-provider";
import { Check, Moon, Paintbrush, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeCustomizer() {
    const { theme, setTheme, mode, setMode } = useTheme();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-md">
                    <Paintbrush className="h-4 w-4" />
                    <span className="sr-only">Customize Theme</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Theme Customizer</h4>
                        <p className="text-sm text-muted-foreground">
                            Customize the look and feel of your workspace.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                            Mode
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "flex-1 justify-start",
                                    mode === "light" && "border-2 border-primary"
                                )}
                                onClick={() => setMode("light")}
                            >
                                <Sun className="mr-2 h-4 w-4" />
                                Light
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "flex-1 justify-start",
                                    mode === "dark" && "border-2 border-primary"
                                )}
                                onClick={() => setMode("dark")}
                            >
                                <Moon className="mr-2 h-4 w-4" />
                                Dark
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                            Colors
                        </div>
                        <div className="flex flex-wrap justify-start gap-2">
                            {themes.map((t) => (
                                <Button
                                    key={t.name}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "justify-start",
                                        theme === t.name && "border-2 border-primary"
                                    )}
                                    onClick={() => setTheme(t.name)}
                                >
                                    <span
                                        className="mr-2 h-4 w-4 rounded-full border border-neutral-200"
                                        style={{ backgroundColor: t.activeColor }}
                                    />
                                    {t.label}
                                    {theme === t.name && <Check className="ml-auto h-3 w-3" />}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
