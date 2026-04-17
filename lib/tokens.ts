import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/lib/prisma";

/** generate token verifikasi email */
export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000 * 24); // 24 jam

    const existingToken = await prisma.verificationToken.findFirst({
        where: { identifier: email }
    });

    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                token: existingToken.token,
            }
        });
    }

    const verificationToken = await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        }
    });

    return verificationToken;
};

/** generate token reset password */
export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 jam

    const existingToken = await prisma.passwordResetToken.findFirst({
        where: { email }
    });

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: {
                id: existingToken.id,
            }
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return passwordResetToken;
};
