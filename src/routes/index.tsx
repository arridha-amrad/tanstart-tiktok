import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/lib/auth-client";
import { authMiddleware } from "@/middleware/auth";
import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  server: {
    middleware: [authMiddleware],
  },
});

function RouteComponent() {
  const session = useSession();
  const router = useRouter();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    router.invalidate().finally(() => navigate({ to: "/auth/signin" }));
  };

  return (
    <div>
      <h1>Home</h1>
      <p>{JSON.stringify(session.data?.user)}</p>
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}
