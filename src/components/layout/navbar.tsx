import NavbarClient from "@/components/layout/navbar-client";

import {
  getCurrentUser,
} from "@/lib/current-user";

export default async function Navbar() {
  const user =
    await getCurrentUser();

  return (
    <NavbarClient
      user={
        user
          ? {
              role: user.role,
            }
          : null
      }
    />
  );
}