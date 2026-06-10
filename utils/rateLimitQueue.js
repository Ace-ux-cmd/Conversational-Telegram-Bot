// MODULE TO STORE USERS AFTER MULTIPLE REPLY FAILURES


// Primary memory engine holding isolated data rows matching [userId] -> [msgObject]
const failedQueueMap = new Map();

// Safely registers an exhausted tracking item if the user isn't already queued.

function trackFailedMessage(userId, botInstance, msgObject) {
    // ignore if the user is already waiting in the queue matrix
    if (failedQueueMap.has(userId)) {
        return; 
    }

    // Save the context frame needed to send the message when the timer expires
    failedQueueMap.set(userId, {
        chatId: msgObject.chatId,
        messageId: msgObject.msgId
    });

    // Establish a precise 60-minute automated notification callback loop
    setTimeout(async () => {
        try {
            // Re-verify the item still exists in memory before attempting execution
            const queuedItem = failedQueueMap.get(userId);
            if (!queuedItem) return;

            // Notify the user that Katelyn's execution capacity has recovered
            await botInstance.sendMessage(
                queuedItem.chatId,
                "hey, sorry about earlier. things got chaotic for a bit. you good?",
                { reply_to_message_id: queuedItem.messageId }
            );

        } catch (err) {
            console.error(`Failed to dispatch rate-limit recovery alert to user ${userId}:`, err.message);
        } finally {
            // Evict the registration token key so the user can re-queue later if needed
            failedQueueMap.delete(userId);
        }
    }, 60 * 60 * 1000); // 60 minutes hard execution threshold delay
}

module.exports = { trackFailedMessage };
