import clsx from "clsx";
import "./menu-open.css";

interface MenuOpenProps {
  expandMenu: boolean;
  setExpandMenu: (expand: boolean) => void;
}

const MenuOpen = ({ expandMenu, setExpandMenu }: MenuOpenProps) => {
  const handleMenuToggle = () => {
    setExpandMenu(!expandMenu);
  };

  return (
    <div className="flex lg:hidden" onClick={handleMenuToggle}>
      <div className="menu-open">
        <span
          className={clsx(
            "menu-line bg-neutral-950 dark:bg-neutral-100",
            expandMenu && "active"
          )}
        />
        <span
          className={clsx(
            "menu-line bg-neutral-950 dark:bg-neutral-100",
            expandMenu && "active"
          )}
        />
        <span
          className={clsx(
            "menu-line bg-neutral-950 dark:bg-neutral-100",
            expandMenu && "active"
          )}
        />
      </div>
    </div>
  );
};

export default MenuOpen;
