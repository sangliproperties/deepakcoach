import { z } from "zod";

import { getCurrentUser } from "@/lib/auth";

import {
    updateDatabaseUserProfile
} from "@/lib/auth-store";


const profileSchema = z.object({
    name:
        z.string()
            .trim()
            .min(
                2,
                "Full name is required."
            )
            .max(100),

    email:
        z.string()
            .trim()
            .email(
                "Enter a valid email address."
            ),

    phone:
        z.string()
            .trim()
            .min(
                10,
                "Enter a valid phone number."
            )
            .max(30)
});


export async function PATCH(
    request: Request
) {
    const currentUser =
        await getCurrentUser();

    if (!currentUser) {
        return Response.json(
            {
                error:
                    "Sign in required."
            },
            {
                status: 401
            }
        );
    }

    const parsed =
        profileSchema.safeParse(
            await request.json()
        );

    if (!parsed.success) {
        return Response.json(
            {
                error:
                    parsed.error
                        .issues[0]
                        ?.message ||
                    "Enter valid profile details."
            },
            {
                status: 400
            }
        );
    }

    const result =
        await updateDatabaseUserProfile(
            currentUser.id,
            parsed.data
        );

    if ("error" in result) {
        if (
            result.error ===
            "EMAIL_ALREADY_EXISTS"
        ) {
            return Response.json(
                {
                    error:
                        "This email address is already registered."
                },
                {
                    status: 409
                }
            );
        }

        return Response.json(
            {
                error:
                    "Profile could not be updated."
            },
            {
                status: 400
            }
        );
    }

    return Response.json({
        user: result.user
    });
}