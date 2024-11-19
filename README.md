# Requestify
Requestify is a web application for song requests where users can send requests and add songs to a DJs playlist, providing users the ability to directly interact with the event’s DJ for a smooth song requesting experience. With Requestify, we hope to improve on design and operational flaws in existing applications to streamline the user experience.

## As a DJ
1. Navigate to the url 'localhost:3000/login', which should open in your default browser upon running ./start.bat
2. Click 'Create An Account' and create an account using a unique email and DJ name
3. Login to that account
4. To add a Stripe product link, click on your profile picture in the top right corner, and select edit profile. Simply paste your product link into the Stripe text box and you are all set
5. To download your personalized QR code, click on the QR code on your dashboard, and press the 'Download QR Code' button. Display this QR code around the venue however you prefer for your audience to request songs
6. To manage your song queue, press the red button on the right side of the song request to remove it from your queue, or press the 'Clear Queue' button to remove all songs from the queue
7. Press the 'Send a Message' button to broadcast a message to all users at the venue

## As an Audience Member
1. Scan the DJ's unique QR code
2. Request any song (as long as it is available on Spotify). Include the artist and/or album name to ensure the correct song is queued
3. To view the current queue, select either the 'Activity' button in the navbar, or the 'See Current Activity' button on the home screen
4. From the Activity page, upvote or downvote songs to change their position in the DJ's Queue. Songs with more upvotes are more likely to be chosen by the DJ
5. Send a tip to the DJ via the Payment page. Selecting 'Pay with Stripe' will take you to Stipe's page, which will offer different payment options depending on your device

Figma Link: https://www.figma.com/design/sVdQLpxDp70WGc5TZEn5t9/Requestify?node-id=0-1&t=YsuaRYDMO6K6r7ye-1
