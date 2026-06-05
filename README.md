# Akumas VLC Controller for Stream Deck

A simple plugin for the Stream Deck adding 12 new buttons to your Stream Deck

Play, Pause, Play/Pause, Stop, Last, Next are the core bread and butter buttons but I added more because I missed those in other plugins I found.

Volume can be tapped or held to raise/lower the volume.
A shuffle toggle to have your playlis shuffle played. 
Switch to different playlists on tap or add another playlist to the current one on top.
A Loop button to toggle no loop, full playlist loop or current song loop.
Of course there's also a button that shows the current song.

If you keep your VLC player on standard settings all you have to do is to:

1. Open VLC 
2. Tap Tools -> Settings
3. On the bottom of the settings window par "All" on "Show Settings"
4. Scroll down to Interface -> Main Interface and tick "Web"
5. Expand Main Interface and click "Lua" and add anything into the "Lua-HTTP" "Password" field. You need this password in Stream Deck.
6. Install the Plugin from the Elgato Plugin Market by searching for VLC and installing my VLC Controller.
7. Now drag any button onto your Stream Deck and click it so you set set your password. You only need to add the new password to ONE of the buttons as they all share the settings, for ease of use. Of course if you don't run VLC on your PC enter the correct IP adress and port. Normally it should be 127.0.0.1 or localhost and port on 8080.

Done. Any buttons you now add to your Stream Deck will automatically also inherit the settings.

Happy Tapping.

If you like my tools

Donate and find other tools of me here: https://ko-fi.com/akumanotsubasa

If you want to check out my Twitch Bot: https://lootbox.akumas.tools

All of my tools are free to use and have no purchases.
