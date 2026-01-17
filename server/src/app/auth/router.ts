import type { Router } from "@/web/router/router";
import z from "zod";

export function authRouter(router: Router<"/auth">) {
	router.get(
		() => {
			return Promise.resolve({
				token: "1234567890",
			});
		},
		{
			response: z.object({
				token: z.string(),
			}),
		},
	);
}
