import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

// The only public HTTP surface: sign-in, sign-out and token refresh.
auth.addHttpRoutes(http);

export default http;
