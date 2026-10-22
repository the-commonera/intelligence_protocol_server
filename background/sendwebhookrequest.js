export default async function WebhookRequest(payload) {


    await fetch(payload.webhookrurl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload.data)
    });
}
