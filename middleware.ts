import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    // Hanya jalankan middleware di rute tertentu (kecuali static files, image, API dll)
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
