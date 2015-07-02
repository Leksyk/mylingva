
Welcome to MyLingva - your personal vocabulary manager. If you are looking for a way to extend your vocabulary in one or more languages which integrates into your reading and internet browsing routines this might be of interest to you.

## The idea
The system knows all the words in the languages you speak and helps you to learn new ones by emphasizing them in texts your read, keeping them and letting you practice them with Anki for example and reminding you about previous sentences you've seen them in when you encounter them next time.

In case you already fluent in more than one language it can show you translation of a word to those language so you can improve your lookup capabilities into more than one language as opposite to memorizing pairs of words. (Especially helpful when those words sound somehow similar in close languages, say Polish and Ukrainian).

When you are writing a new text yourself (an email for example) the system can suggest to use recently learned words as synonymous to the ones you use all the time, so it can help you diversify the language you use and so enrich your written/spoken vocabulary.

## Where are you now?
We just about to publish the very first prototype of the chrome extension which remembers the known/unknown words you've encountered in 5 language: English, Ukrainian, Romanian, Polish and German. Apart from the words we also keep up to 10 sentences each word was used in (no way to see/manage them yet, sorry!)

When you open any page with text click on the extension icon in chrome and the extension will highlight unknown words in red (the first time all the text will be red) by pointing the cursor on a word and using hover menu you can mark it as known, ignored, or familiar to you.

You can see all the recorded words in extension settings (Right click on the extension icon -> Options).

The words are stored only locally within your browser and will not be uploaded anywhere yet, by uninstalling the extension you wipe out your dictionary as well! We will be working on a backend to synchronize your dictionary between devices and make it available on web but it's just not there yet.

## What about my privacy?
* The extension can see only the texts on the tabs you explicitly click on the extension icon.
* As mentioned above all the recorded information stored in the local storage of your browser and is not being uploaded anywhere so the access to the collected data is as restricted/protected as your computer is.

But the extension reporting actions [anonymously] users are doing via Google Analytics so we can see how it's being used and by how many users but we don't know who is doing what.
What is being reported to Google Analytics:
* urls visited (unless in incognito mode)
* word that are being marked as known/ignore/etc

All of the above is anonymous and we are not able to identify which actions are done by whom.

