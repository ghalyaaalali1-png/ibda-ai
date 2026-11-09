import { FolderOpen, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { routes } from "@/config/site";
import { logOut } from "@/features/auth/actions";
import { getServerDictionary } from "@/i18n/server";

const itemClass =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-mist/60 transition-colors hover:bg-white/5 hover:text-white";

/** Header controls for a signed-in founder: the other account page, and log out. */
export async function SignedInActions({
  page,
}: {
  page: "projects" | "account";
}) {
  const t = await getServerDictionary();
  return (
    <>
      {page === "projects" ? (
        <Link
          href={routes.account}
          className={itemClass}
          aria-label={t.auth.account.link}
        >
          <UserRound aria-hidden className="size-3.5" />
          <span className="hidden sm:inline">{t.auth.account.link}</span>
        </Link>
      ) : (
        <Link
          href={routes.projects}
          className={itemClass}
          aria-label={t.auth.myProjects}
        >
          <FolderOpen aria-hidden className="size-3.5" />
          <span className="hidden sm:inline">{t.auth.myProjects}</span>
        </Link>
      )}
      <form action={logOut}>
        <button type="submit" className={itemClass} aria-label={t.auth.logOut}>
          <LogOut aria-hidden className="size-3.5 rtl:-scale-x-100" />
          <span className="hidden sm:inline">{t.auth.logOut}</span>
        </button>
      </form>
    </>
  );
}
