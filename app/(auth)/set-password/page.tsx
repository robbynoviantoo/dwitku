import { SetPasswordForm } from "@/components/auth/set-password-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function SetPasswordPage() {
    const session = await auth();

    // Pastikan user sudah login lewat OAuth
    if (!session?.user) {
        redirect("/login");
    }

    // Jika sudah punya password, tidak perlu ke sini
    if (session.user.hasPassword) {
        redirect("/workspaces");
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <SetPasswordForm />
        </div>
    );
}
