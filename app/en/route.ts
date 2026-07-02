import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    cookieStore.set("locale", "en", { path: "/", maxAge: 31536000 });
    
    const referer = request.headers.get("referer");
    const redirectUrl = referer || new URL("/dashboard", request.url).toString();
    return NextResponse.redirect(redirectUrl);
}
