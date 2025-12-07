import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { prisma } from "@/db";
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Trash } from "lucide-react";
import { useCallback, useState } from "react";
import z from "zod";

const fetchTodos = createServerFn({ method: "GET" }).handler(async () =>
  prisma.todo.findMany({ orderBy: { createdAt: "desc" } })
);

const deleteTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.number(),
    })
  )
  .handler(async ({ data: { id } }) => {
    return prisma.todo.delete({ where: { id } });
  });

const addTodo = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      title: z.string().min(1),
    })
  )
  .handler(async ({ data: { title } }) => {
    await new Promise((res) => setTimeout(res, 3000));
    return prisma.todo.create({
      data: { title },
    });
  });

const options = queryOptions({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

export const Route = createFileRoute("/demo/tanstack-query")({
  component: TanStackQueryDemo,
  loader: async ({ context }) => {
    context.queryClient.ensureQueryData(options);
  },
  head: (ctx) => ({
    ...ctx,
    meta: [{ title: "Tanstack-Query" }],
  }),
});

function TanStackQueryDemo() {
  const { data } = useSuspenseQuery(options);
  const qc = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (todo: string) => {
      return addTodo({ data: { title: todo } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const { mutate: delTodo } = useMutation({
    mutationFn: async (id: number) => deleteTodo({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const [todo, setTodo] = useState("");

  const submitTodo = useCallback(async () => {
    await mutateAsync(todo);
    setTodo("");
  }, [addTodo, todo]);

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 80% 20%, #3B021F 0%, #7B1028 60%, #1A000A 100%)",
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">TanStack Query Todos list</h1>
        <ul className="mb-4 space-y-2">
          {data?.map((t) => (
            <li
              key={t.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <Button
                onClick={() => delTodo(t.id)}
                className="mr-4"
                size={"icon"}
                variant={"destructive"}
              >
                <Trash />
              </Button>
              <span className="text-lg text-white">{t.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            disabled={isPending}
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                submitTodo();
              }
            }}
            placeholder="Enter a new todo..."
            className="w-full px-4 py-3 disabled:text-white/50 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <Button
            disabled={todo.trim().length === 0 || isPending}
            onClick={submitTodo}
            size={"lg"}
            variant={"default"}
          >
            {isPending && <Spinner />}
            Add todo
          </Button>
        </div>
      </div>
    </div>
  );
}
