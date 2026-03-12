import { auth } from "@/auth";
import { getInvitePreview } from "@/app/actions/invite";
import { InviteClient } from "@/components/workspace/invite-client";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const session = await auth();
    const invite = await getInvitePreview(token);

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                            D
                        </div>
                        <span className="font-bold text-lg text-zinc-800">Dwitku</span>
                    </div>
                    <h1 className="text-lg font-semibold text-zinc-700">Kamu mendapat undangan!</h1>
                </div>

                <InviteClient
                    invite={invite}
                    token={token}
                    isLoggedIn={!!session?.user}
                    currentUserEmail={session?.user?.email}
                />
            </div>
        </div>
    );
}
