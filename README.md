# diacrit

Requires NodeJS/NPM at a reasonably recent version.

Install dependencies and stuff:

```
$ npm install
```

Create a database for a language (for example, `ro`). Language files for supported stuff are in `words/` dir.

```
$ npm tsx @diacrit/scripts/create-language-db.ts ro words/ro.txt words/ro.sqlite3
```

This creates the database `words/ro.sqlite3`. Search it interactively by using (again with `ro` as an example):

```
$ npm tsx @diacrit/scripts/find-alternatives.ts ro words/ro.sqlite3
? pana
pana => pana, pană, pâna, până
?
```

You can stream multiple words into the command non-interactively as well.  

```
$ shuf -n 10 words/fr.txt | npx tsx @diacrit/scripts/find-alternatives.ts fr words/fr.sqlite3 
emancipassent => émancipassent
alienerons => aliénerons
littoral => littoral
apparient => apparient
pulverisateurs => pulvérisateurs
attenuat => atténuât
remissions => remissions, rémissions
decennie => décennie
mansarderez => mansarderez
sevissaient => sévissaient
```