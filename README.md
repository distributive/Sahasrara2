## You don't need to host your own instance to add Sahasrara to your server
You can add the main instance by opening its profile and clicking "Add App":

<img width="300" height="300" alt="image" src="https://github.com/user-attachments/assets/23734413-bbe6-4853-bbe6-90f7cc2a1fa9" />

# Sahasrara

A card-fetching Discord bot for the card game [Netrunner](https://nullsignal.games/).

Named after the card [Sahasrara](https://www.netrunnerdb.com/en/card/03047) for it's flavour text, the original version of this bot was written in Haskell:

> _Out there, the thousand-petaled lotus symbolizes detachment from illusion. In here, it is the birthplace of a higher consciousness. Something infinitely pure._

Infinitely pure as Haskell may be, discord.js has more features.

## Client use

This bot supports a number of interactions (slash commands) and some inline commands:

### Searching for Netrunner cards

You can fetch cards by including the following in a Discord message:

- [[card]] to view a card
- {{card}} to view its art
- <\<card>> to view its flavour text
- ((card)) to view its legality history

Each Discord message is limited to 5 (by default) inline commands. Any additional commands will be ignored.

## Server use

### Running the bot

```bash
cp .env.example .env # You will need to add your application token and bot ID to the new file
npm install
node index.js
```

### Resources

The resources directory contains instance-specific data you may want to use during run time:

The following files are read at startup, and then overwritten as relevant superuser commands are applied:

- resources/aliases.yml
  - A list of card aliases (i.e. strings that, if used in an inline message, will be manually redirected to a specific card)
  - e.g. [[franklin]] may be redirected to fetch the card [Crick](https://netrunnerdb.com/en/card/08034).
- resources/serverWhitelist.yml
  - If the env setting `WHITELIST_SERVERS` is truthy, that instance of the bot will only work in whitelisted servers, which are stored in this file.

The following files are only read at startup, and not written to during runtime:

- resources/CardData
  - This directory allows you to define Netrunner data not on the external API you fetch the rest of your Netrunner data from.
  - The files contained within are expected to follow the same schema as the official [v3 Netrunner API](https://api.netrunnerdb.com/api/docs/).
  - If any local data conflicts with data pulled from the API, the local data takes precedence.
  - It supports the following subdirectories:
    - resources/CardData/Cards
    - resources/CardData/Printings
    - resources/CardData/CardSets
    - resources/CardData/CardCycles

## Acknowledgements

This software is based on the template [Slash Bot Template](https://github.com/GuriZenit/slash-bot-template) by GuriZenit.
