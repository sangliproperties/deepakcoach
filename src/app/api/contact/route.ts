import { z } from "zod";
import { createEnquiry } from "@/lib/demo-store";
import { jsonError } from "@/lib/http";

const enquirySchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    message: z.string().trim().min(2).max(5000)
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const parsed = enquirySchema.safeParse(body);

        if (!parsed.success) {
            return jsonError("Please provide valid enquiry details.", 400);
        }

        const enquiry = createEnquiry(parsed.data);

        return Response.json(
            {
                success: true,
                message: "Your enquiry has been submitted successfully.",
                enquiry: {
                    id: enquiry.id
                }
            },
            { status: 201 }
        );
    } catch {
        return jsonError(
            "Your enquiry could not be submitted. Please try again.",
            500
        );
    }
}