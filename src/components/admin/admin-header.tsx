import {
  Bell,
  Search,
  UserRound,
} from "lucide-react";

type AdminHeaderProps = {
  fullName: string;
};

export default function AdminHeader({
  fullName,
}: AdminHeaderProps) {
  const currentDate =
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());

  const initials = fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-red-200 bg-[#fbfbff]/95 backdrop-blur">
      <div className="flex min-h-[82px] items-center gap-8 px-7 xl:px-10">
        {/* Welcome */}

        <div className="min-w-[190px]">
          <p className="text-[16px] font-bold leading-tight text-slate-900">
            Welcome back, {fullName}
          </p>

          <p className="mt-1 text-[11px] text-slate-500">
            {currentDate}
          </p>
        </div>

        {/* Search */}

        <div className="hidden flex-1 md:block">
          <div className="relative max-w-[420px]">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500" />

            <input
              type="search"
              placeholder="Search members, events, or files..."
              className="h-[44px] w-full rounded-lg border-0 bg-[#eef1fb] pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-red-200"
            />
          </div>
        </div>

        {/* Admin profile */}

        <div className="ml-auto flex items-center gap-5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center text-slate-600"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-slate-700">
              {fullName}
            </p>

            <p className="mt-1 text-[9px] font-medium uppercase text-slate-500">
              Administrator
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-red-600 bg-slate-100 text-xs font-bold text-slate-800">
            {initials || (
              <UserRound className="h-5 w-5" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}