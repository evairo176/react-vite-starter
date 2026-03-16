import { useEffect, useState } from "react";
import { Save } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import useSetRolePermissionModal from "./useSetRolePermissionModal";

const PERMISSIONS = ["CREATE", "READ", "UPDATE", "DELETE"] as const;

interface MenuItem {
  code: string;
  name: string;
}

interface RolePermission {
  menuCode: string;
  permissions: string[];
}

interface SelectedData {
  code: string;
  name: string;
  rolePermissions: RolePermission[];
  dataMenu: MenuItem[];
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  selected: SelectedData | null;
  refetch: () => void;
}

export default function SetRolePermissionModal({
  open,
  setOpen,
  selected,
  refetch,
}: Props) {
  const [menuPermissions, setMenuPermissions] = useState<
    Record<string, string[]>
  >({});
  const { handleSave: saveRolePermission, isPendingSave } =
    useSetRolePermissionModal({
      close: () => {
        setOpen(false);
        refetch();
      },
    });
  /**
   * Initialize permissions from backend
   */

  useEffect(() => {
    if (!selected) return;

    const initial: Record<string, string[]> = {};

    selected?.rolePermissions?.forEach((rp) => {
      initial[rp.menuCode] = rp.permissions;
    });

    setMenuPermissions(initial);
  }, [selected]);

  /**
   * Get permissions per menu
   */

  const getPermissions = (menuCode: string) => {
    return menuPermissions[menuCode] || [];
  };

  /**
   * Toggle permission
   */

  const togglePermission = (menuCode: string, permission: string) => {
    setMenuPermissions((prev) => {
      const current = prev[menuCode] || [];

      const updated = current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission];

      return {
        ...prev,
        [menuCode]: updated,
      };
    });
  };

  /**
   * Save all
   */

  const handleSave = () => {
    const rolePermissions = Object.entries(menuPermissions)
      .filter(([_, permissions]) => permissions.length > 0)
      .map(([menuCode, permissions]) => ({
        menuCode,
        permissions,
      }));

    const payload = {
      roleCode: selected?.code as string,
      rolePermissions,
    };

    saveRolePermission(payload);
  };

  if (!selected) return null;
  // console.log({ selected });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="min-w-5xl">
        <DialogHeader>
          <DialogTitle>Set Permission</DialogTitle>
          <DialogDescription>{selected.name}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <table className="w-full border rounded-lg">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3 text-sm font-medium w-1/4">
                  Menu
                </th>

                {PERMISSIONS.map((perm) => (
                  <th
                    key={perm}
                    className="text-center p-3 text-sm font-medium"
                  >
                    {perm}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {selected.dataMenu.map((menu) => {
                const perms = getPermissions(menu.code);

                return (
                  <tr key={menu.code} className="border-t">
                    <td className="p-3 text-sm">{menu.name}</td>

                    {PERMISSIONS.map((perm) => (
                      <td key={perm} className="text-center p-3">
                        <Checkbox
                          checked={perms.includes(perm)}
                          onCheckedChange={() =>
                            togglePermission(menu.code, perm)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isPendingSave}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isPendingSave ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
