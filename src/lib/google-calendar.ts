import { google } from "googleapis";
import { randomUUID } from "crypto";

const CALENDAR_ID =
    process.env.GOOGLE_CALENDAR_ID!;

function getGoogleAuth() {
    const client =
        new google.auth.OAuth2(
            process.env.GOOGLE_CALENDAR_CLIENT_ID,
            process.env.GOOGLE_CALENDAR_CLIENT_SECRET
        );

    client.setCredentials({
        refresh_token:
            process.env.GOOGLE_CALENDAR_REFRESH_TOKEN
    });

    return client;
}

export async function createBookingCalendarEvent(
    input: {
        bookingId: string;
        reference: string;

        customerName: string;
        customerEmail: string;

        programTitle: string;

        startsAt: Date;
        endsAt: Date;
    }
) {
    const auth = getGoogleAuth();

    const calendar =
        google.calendar({
            version: "v3",
            auth
        });

    const response =
        await calendar.events.insert({
            calendarId: CALENDAR_ID,

            /*
             * Required when requesting
             * Google Meet conference data.
             */
            conferenceDataVersion: 1,

            /*
             * Send Calendar invitation/update
             * to attendees.
             */
            sendUpdates: "all",

            requestBody: {
                summary:
                    `${input.programTitle} - ${input.customerName}`,

                description:
                    [
                        `Booking reference: ${input.reference}`,
                        `Customer: ${input.customerName}`,
                        `Customer email: ${input.customerEmail}`,
                        "",
                        "Deepak Khot Coaching Session"
                    ].join("\n"),

                start: {
                    dateTime:
                        input.startsAt.toISOString(),
                    timeZone:
                        "Asia/Kolkata"
                },

                end: {
                    dateTime:
                        input.endsAt.toISOString(),
                    timeZone:
                        "Asia/Kolkata"
                },

                attendees: [
                    {
                        email:
                            input.customerEmail
                    }
                ],

                conferenceData: {
                    createRequest: {
                        requestId:
                            `booking-${input.bookingId}-${randomUUID()}`,

                        conferenceSolutionKey: {
                            type: "hangoutsMeet"
                        }
                    }
                },

                reminders: {
                    useDefault: true
                }
            }
        });

    const event =
        response.data;

    /*
     * Usually available as hangoutLink.
     * Fall back to video entry point.
     */
    const meetUrl =
        event.hangoutLink ||
        event.conferenceData
            ?.entryPoints
            ?.find(
                (entry) =>
                    entry.entryPointType ===
                    "video"
            )
            ?.uri ||
        null;

    return {
        eventId:
            event.id || null,

        eventUrl:
            event.htmlLink || null,

        meetUrl
    };
}

export async function cancelGoogleCalendarEvent(
    eventId: string
) {
    const auth = getGoogleAuth();

    const calendar =
        google.calendar({
            version: "v3",
            auth
        });

    await calendar.events.delete({
        calendarId: CALENDAR_ID,
        eventId,
        sendUpdates: "all"
    });
}


export async function updateGoogleCalendarEvent(
    eventId: string,
    input: {
        startsAt: Date;
        endsAt: Date;
    }
) {
    const auth = getGoogleAuth();

    const calendar =
        google.calendar({
            version: "v3",
            auth
        });

    const response =
        await calendar.events.patch({
            calendarId: CALENDAR_ID,
            eventId,
            sendUpdates: "all",

            requestBody: {
                start: {
                    dateTime:
                        input.startsAt.toISOString(),

                    timeZone:
                        "Asia/Kolkata"
                },

                end: {
                    dateTime:
                        input.endsAt.toISOString(),

                    timeZone:
                        "Asia/Kolkata"
                }
            }
        });

    return response.data;
}

function encodeGmailMessage(
    message: string
) {
    return Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}


export async function sendBookingMeetEmail(
    input: {
        customerName: string;
        customerEmail: string;
        programTitle: string;
        reference: string;
        startsAt: Date;
        endsAt: Date;
        meetUrl: string;
    }
) {
    const auth = getGoogleAuth();

    const gmail =
        google.gmail({
            version: "v1",
            auth
        });

    const organizerEmail =
        process.env.GOOGLE_CALENDAR_ID ||
        "booking.deepakkhot@gmail.com";

    const dateFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    const timeFormatter =
        new Intl.DateTimeFormat(
            "en-IN",
            {
                timeZone: "Asia/Kolkata",
                hour: "numeric",
                minute: "2-digit",
                hour12: true
            }
        );

    const sessionDate =
        dateFormatter.format(
            input.startsAt
        );

    const startTime =
        timeFormatter.format(
            input.startsAt
        );

    const endTime =
        timeFormatter.format(
            input.endsAt
        );

    const subject =
        `Deepak Khot Coaching Session - Google Meet Details`;

    const body = [
        `Hello ${input.customerName},`,
        "",
        "Your coaching session has been scheduled successfully.",
        "",
        `Program: ${input.programTitle}`,
        `Date: ${sessionDate}`,
        `Time: ${startTime} - ${endTime}`,
        `Booking Reference: ${input.reference}`,
        "",
        "Google Meet:",
        input.meetUrl,
        "",
        "Please use the above Google Meet link for your scheduled coaching session.",
        "",
        "Regards,",
        "Deepak Khot"
    ].join("\r\n");

    const recipients =
        Array.from(
            new Set([
                organizerEmail,
                input.customerEmail
            ])
        );

    const rawMessage = [
        `From: Deepak Khot <${organizerEmail}>`,
        `To: ${recipients.join(", ")}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        body
    ].join("\r\n");

    await gmail.users.messages.send({
        userId: "me",

        requestBody: {
            raw:
                encodeGmailMessage(
                    rawMessage
                )
        }
    });
}