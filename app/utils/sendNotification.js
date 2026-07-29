// import admin from "../configs/firebase.js";
import { messaging } from "../configs/firebase.js";
export const sendPushNotification = async (
    token,
    title,
    body,
    data = {}
) => {

    if (!token) return;

    const message = {
        token,

        notification: {
            title,
            body,
        },

        data,
    };

    try {

        await messaging.send(message);

        console.log("Notification Sent");

    } catch (err) {

        console.log(err.message);

    }

};