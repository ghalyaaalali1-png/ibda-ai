import { StatusScreen } from "@/components/status/StatusScreen";

/** Shown for any address that doesn't exist, and for projects the visitor can't open. */
export default function NotFound() {
  return <StatusScreen kind="notFound" />;
}
