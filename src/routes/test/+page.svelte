
<script lang="ts">
    // @ts-nocheck
    import { DiscordSDK } from "@discord/embedded-app-sdk";
    import { onMount } from 'svelte';

    // Will eventually store the authenticated user's access_token
    let auth: any;

    const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID);

    setupDiscordSdk().then(() => {
    console.log("Discord SDK is authenticated");
    
    // We can now make API calls within the scopes we requested in setupDiscordSDK()
    // Note: the access_token returned is a sensitive secret and should be treated as such
    appendVoiceChannelName();
    appendGuildAvatar();
    });

    async function setupDiscordSdk() {
    await discordSdk.ready();
    console.log("Discord SDK is ready");

    // Authorize with Discord Client
    const { code } = await discordSdk.commands.authorize({
        client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
        response_type: "code",
        state: "",
        prompt: "none",
        scope: [
        "identify",
        "guilds",
        ],
    });

    // Retrieve an access_token from your activity's server
    const response = await fetch("/api/token", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify({
        code,
        }),
    });
    const { access_token } = await response.json();

    // Authenticate with Discord client (using the access_token)
    auth = await discordSdk.commands.authenticate({
        access_token,
    });

    if (auth == null) {
        throw new Error("Authenticate command failed");
    }
    }

    async function appendVoiceChannelName() {
    const app = document.querySelector('#app');

    let activityChannelName = 'Unknown';

    // Requesting the channel in GDMs (when the guild ID is null) requires
    // the dm_channels.read scope which requires Discord approval.
    if (discordSdk.channelId != null && discordSdk.guildId != null) {
        // Over RPC collect info about the channel
        const channel = await discordSdk.commands.getChannel({channel_id: discordSdk.channelId});
        if (channel.name != null) {
        activityChannelName = channel.name;
        }
    }

    // Update the UI with the name of the current voice channel
    const textTagString = `Activity Channel: "${activityChannelName}"`;
    const textTag = document.createElement('p');
    textTag.innerHTML = textTagString;
    app.appendChild(textTag);
    }

    async function appendGuildAvatar() {
    const app = document.querySelector('#app');

    // 1. From the HTTP API fetch a list of all of the user's guilds
    const guilds = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
        headers: {
        // NOTE: we're using the access_token provided by the "authenticate" command
        Authorization: `Bearer ${auth.access_token}`,
        'Content-Type': 'application/json',
        },
    }).then((response) => response.json());

    // 2. Find the current guild's info, including it's "icon"
    const currentGuild = guilds.find((g) => g.id === discordSdk.guildId);

    // 3. Append to the UI an img tag with the related information
    if (currentGuild != null) {
        const guildImg = document.createElement('img');
        guildImg.setAttribute(
        'src',
        // More info on image formatting here: https://discord.com/developers/docs/reference#image-formatting
        `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`
        );
        guildImg.setAttribute('width', '128px');
        guildImg.setAttribute('height', '128px');
        guildImg.setAttribute('style', 'border-radius: 50%;');
        app.appendChild(guildImg);
    }
    }
    onMount(async () => {
		document.querySelector('#app').innerHTML = `
    <div>

    </div>
    `;
	});
</script>

<div id="app"></div>

<style>
        :root {
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    line-height: 1.5;
    font-weight: 400;

    color-scheme: light dark;
    color: rgba(255, 255, 255, 0.87);
    background-color: #242424;

    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    }

    a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
    }
    a:hover {
    color: #535bf2;
    }

    body {
    margin: 0;
    display: flex;
    place-items: center;
    min-width: 320px;
    min-height: 100vh;
    }

    h1 {
    font-size: 3.2em;
    line-height: 1.1;
    }

    #app {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
    }

    .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
    }
    .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
    }
    .logo.vanilla:hover {
    filter: drop-shadow(0 0 2em #f7df1eaa);
    }

    button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
    }
    button:hover {
    border-color: #646cff;
    }
    button:focus,
    button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
    }

    @media (prefers-color-scheme: light) {
    :root {
        color: #213547;
        background-color: #ffffff;
    }
    a:hover {
        color: #747bff;
    }
    button {
        background-color: #f9f9f9;
    }
    }
</style>