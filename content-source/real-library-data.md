# Real library/backlog data — source for the Library + Backlog content migration

Raw data as provided by Vlad, kept verbatim for accurate migration later. This will replace the
34 generated placeholder movies currently in the live Library.

**Working interpretation (to confirm before migrating):**
- **"Rated ok" + Quentin Tarantino sections** → Library (confident scores, full P/F/S/V breakdowns)
- **"Watched" section (mostly suffixed `?`)** → the `?` marks an unconfirmed/uncertain score →
  Backlog, flagged "needs rewatch" — NOT going into Library as-is
- **"All Time Favourites - need ranking"** (all placeholder `11/10`) → watched, but not properly
  scored yet — likely Backlog "needs rewatch/ranking" too, to be resolved via Duels once that
  ships, rather than Library with a fake placeholder score
- **"To be Watched"** → Backlog, not-yet-watched
- **Gold-highlight feature**: any movie with an **11 in any single category** (not just a movie
  with a flat "11" mean) gets special gold styling in the Library grid — still needs confirming
  whether this means "any category = 11" specifically, or something else
- Score notation: comma as decimal separator (e.g. `7,75` = 7.75), the leading number per movie is
  the mean, `(P: x, F: x, S: x, V: x)` below it is the breakdown when given. Some entries (e.g.
  "Pulp Fiction 11") only have the mean with no breakdown given — likely implies all 4 categories
  are 11, but needs confirming, not assumed.

---

## Quentin Tarantino

~Reservoir Dogs 7,75
(P: 8, F: 7, S: 8, V: 8)
~Pulp Fiction 11
~Jackie Brown 10,25
(P: 10, F: 10, S: 10, V: 11)
~Kill Bill: Volume 1 10
(P: 10, F: 11, S: 9, V: 10)
~Kill Bill: Volume 2 9,75
(P: 10, F: 10, S: 9, V: 10)
~Grindhouse: Death Proof 7,5
(P: 6, F: 7, S: 8, V: 9)
~Inglorious Basterds 10
(P: 10, F: 11, S: 8, V: 11)
~Django Unchained 10,25
(P: 10, F: 10, S: 10, V: 11)
~The Hateful Eight 8,5
(P: 8, F: 10, S: 9, V: 7)
~Once Upon a Time in Hollywood 7,25
(P: 5, F: 10, S: 8, V: 6)

## All Time Favourites - need ranking

~Star Wars: Return of the Jedi 11/10
~Star Wars: Revenge of the Sith 11/10
~Matrix Trilogy (1999-2003) 11/10
~Baby Driver 11/10
~Inception 11/10
~8mile 11/10
~Trainspotting 11/10
~Deja Vu 11/10
~Arrival 11/10
~Eternal sunshine of a spotless mind 11/10
~Fight Club 11/10
~Tenet 11/10
~Interstellar 11/10
~The Dark Night 11/10
~Deadpool 11/10
~The Joker 11/10
~The Butterfly Effect 11/10
~Knowing 11/10
~In time 11/10
~Don Juan de Marco 11/10
~Love and Other Drugs 11/10
~Thor: Ragnarok 11/10
~Kingsman: The Secret Service 11/10
~A good year 11/10
~Jojo Rabbit 11/10
~Rainman 11/10
~Motherless Brooklyn 11/10
~Limitless 11/10
~Forrest Gump 11/10
~Gia 11/10
~Lost in Translation 11/10
~Definitely, Maybe 11/10
~The Terminal 11/10
~Groundhog Day 11/10
~Hardcore Henry 11/10
~Teambuilding 11/10
~|Dead Poets Society 11/10
~|Léon: The Professional 11/10
~|Casablanca 11/10
~|Undeva la Palilula 11/10
~|Barfly 11/10

## Watched

~Wargames 6,75/10 ?
(P: 8, F: 5, S: 6, V: 8)
~Blade Runner 8/10 ?
~The Breakfast Club 10/10?
~Taxi Driver 10/10 ?
~Good Will Hunting 10/10 ?
~Die Hard 7/10 ?
~Dallas Buyers Club 10/10 ?
~The Perks of Being a Wallflower 10/10 ?
~Dumb and Dumber 9/10 ?
~Starsky and Hutch 10/10 ?
~Silence of the lambs 10/10 ?
~Top Gun 10/10 ?
~Il Gattorpardo 10/10 ?
~Dirty Dancing 10/10 ?
~One Flew Over the Cuckoo's Nest 10/10 ?
~Parasite 10/10?
~The Shawshank Redemption 10,25/10 ?
~The Aviator 10/10 ?
~Raiders of the Lost Arc 10/10 ?
~Spaceballs 10/10 ?
~The Big Lebowsky 10/10 ?
~Public Enemies 10/10 ?
~The Talented Mr. Ripley 10/10 ?
~All Eyez on Me 10/10 ?
~Ghost 10/10 ?
~A Midsummer Night's Dream 10/10 ?
~The Client 10/10 ?
~Uncut Gems 8,75/10 ?
~Tomorrowland 10/10 ?
~Fantastic Beasts and Where to Find Them 10/10 ?
~The Crimes of Grindelwald 9,75/10 ?
~Goodfellas 9.5/10 ?
~Birdman 10/10 ?
~The Curious Case of Benjamin Button 10/10 ?
~Hunger Games 10/10 ?
~Hunger Games Catching Fire 9/10 ?
~Hunger Games Mockingjay 10/10 ?
~The Golden Compass 10/10 ?
~About Time 10/10 ?
~Serendipity 10/10 ?
~Surrogates 10/10 ?
~Catch me if you can 10/10
~Paycheck 10/10 ?
~Karate Kid 10/10 ?
~Big Miracle 10/10 ?
~Eternal Beauty 10/10 ?
~Don't breathe 9/10 ?
~The Heat 10/10 ?
~Meet Joe Black 10/10 ?
~The Little Things 9/10 ?
~Hitman's Bodyguard 10/10 ?
~Hitman's Wife's Bodyguard 10/10 ?
~The A-Team 10/10 ?
~Tolkien 10/10 ?
~Amsterdam 9/10 ?
~The Age of Adeline ?
~Avatar: Way of Water 9/10 ?
~Avatar 10/10 ?
~Babylon 9/10 ?
~12 Monkeys 10/10 ?
~Secondhand Lions 10/10 ?
~Once Upon a Time in America 9/10 ?
~Transformers 9,25
(P: 9, F: 10, S: 8, V: 10)
~Transformers: Revenge of the Fallen 8
(P: 6, F: 10, S: 8, V: 8)
~Transformers: Dark of the Moon 9,25
(P: 10, F: 10, S: 8, V: 9)
~Transformers: Age of Extinction 8
(P: 7, F: 10, S: 8, V: 7)
~ Transformers: The Last Knight 7,5
(P: 6, F: 8, S: 8, V: 8)
~Bumblebee 9,25
(P: 9, F: 10, S: 8, V: 10)
~Transformers: Rise of The Beasts 9,5
(P: 9, F: 9, S: 10, V: 10)
pirates of the carrabean
~Survivor 8,25
(P: 8, F: 8, S: 7, V: 10)

## Rated ok

~Pretty Woman 8
(P: 8, F: 8, S: 9, V: 7)
~Hidalgo 8
(P: 8, F: 8, S: 7, V: 9)
~Boss Level 6,5
(P: 7, F: 6, S: 5, V: 8)
~The Suicide Squad 9,25
(P: 9, F: 9, S: 9, V: 10)
~Now you see me 9
(P: 10, F: 8, S: 8, V: 10)
~Now you see me 2 8,75
(P: 9, F: 8, S: 8, V: 10)
~28 Days 7,75
(P: 8, F: 7, S: 6, V: 10)
~John Wick 9,75
(P: 8, F: 10, S: 10, V: 11)
~John Wick: Chapter 2 9,75
(P: 9, F: 10, S: 10, V: 10)
~John Wick: Chapter 3 9
(P: 9, F: 10, S: 8, V: 9)
~Ocean' Eleven 10
(P: 10, F: 10, S: 9, V: 11)
~Ocean's Twelve 9,75
(P: 11, F: 10, S: 8, V: 10)
~Ocean's Thirteen 9,5
(P: 9, F: 11, S: 7, V: 10)
~Ocean's Eight 8,25
(P: 7, F: 9, S: 8, V: 9)
~Knives Out 9
(P: 8, F: 10, S: 8, V:10)
~Glass Onion 8,25
(P: 7, F: 10, S: 7, V: 9)
~The Shining 9,5
(P: 7 F: 10, S: 11, V: 10)
~Free Guy 9
(P: 8, F: 10, S: 8, V: 10)
~The Italian Job 9,75
(P: 10, F: 10, S: 9, V:10)
~The Dictator 8,5
(P: 9, F: 8, S: 6, V: 11)
~Moneyball 8,75
(P: 10, F: 8, S: 7, V: 10)
~The Wolf of Wallstreet 9,75
(P: 9, F: 11, S: 8, V: 11)
~Focus 9,25
(P: 10, F: 9, S: 8, V: 10)
~That's My Boy 7,25
(P: 7, F: 6, S: 7, V: 9)
~Chef 9,5
(P: 9, F: 9, S: 10, V: 10)
~Miss Peregrine's Home for Peculiar Children 8,25
(P: 9, F: 10, S: 7, V: 8)
~Hair 8,5
(P: 7, F: 8, S: 10, V: 9)
~X-men 7,25
(P: 6, F: 8, S: 6, V: 9)
~X2: X-men United 8,25
(P: 9, F: 8, S: 6, V: 10)
~X-man: The Last Stand 7,5
(P: 7, F: 9, S: 6, V: 8)
~X-man Origins: Wolverine 5,25
(P: 5, F: 4, S: 5, V: 7)
~Deadpool 2 9,5
(P: 9, F: 10, S: 9, V: 10)
~Deadpool & Wolverine 9,5
(P: 10, F: 10, S: 8, V: 10)
~Star Wars: The Phantom Menace 8,5
(P: 7, F: 8, S: 10, V: 9)
~Star Wars: Attack of the Clones 9,5
(P: 9, F: 9, S: 10, V: 10)
~Star Wars: The Clone Wars 7,5
(P: 7, F: 6, S: 8, V: 9)
~Star Wars: A New Hope 9,75
(P: 10, F: 8, S: 11, V: 10)
~Star Wars: Empire Strikes Back 10
(P: 9, F: 9, S: 11, V: 11)
~Solo: A Star Wars Story 7,5
(P: 6, F: 9, S: 7, V: 8)
~Rogue One 9
(P: 9, F: 10, S: 8, V: 9)
~The Wolverine 6,25
(P: 6, F: 7, S: 5, V: 7)
~X-man: First Class 8,25
(P: 9, F: 8, S: 7, V: 9)
~X-man: Days of Future Past 9,25
(P: 9, F: 9, S: 8, V: 11)
~X-man: Apocalypse 7,5
(P: 7, F: 8, S: 6, V: 8)
~X-man: Dark Phoenix 7,25
(P: 8, F: 8, S: 6, V: 7)
~Ratchet & Clank 6,5
(P: 6, F: 8, S: 5, V: 7)
~Kingsman: The Golden Circle 9,25
(P: 8, F: 10, S: 9, V: 10)
~The King's Man 8,5
(P: 8 F: 8, S: 8, V: 10)
~The In-Laws 7,5
(P: 7, F: 7, S: 6, V: 10)
~Scarface 9,5
(P: 10, F: 9, S: 9, V: 10)
~Edge of Tomorrow 9,25
(P: 10, F: 9, S: 8, V: 10)
~Man Up 8,25
(P: 8, F: 8, S: 7, V: 10)
~The Tourist 8
(P: 8, F: 8, S: 7 , V: 9)
~Pixels 8,5
(P: 7, F: 8, S: 9, V: 10)
~The Adjustment Bureau 9,5
(P: 11, F: 9, S: 8, V; 10)
~The Great Gatsby 9,75
(P: 9, F: 10, S: 10, V: 10)
The Usual Suspects 9,75
(P: 11, F: 9, S: 9, V: 10)
~Wog the Dog 9
(P: 11, F: 8, S: 7, V: 10)
~Paranormal Activity 7,25
(P: 6, F: 7, S: 8, V: 8)
~The Old Man and The Sea 6,25
(P: 6, F: 6, S: 7, V: 6)
~Edward Scissorhands 9,25
(P: 10, F: 8, S: 9, V: 10)
~Charlie & The Chocolate Factory 9,75
(P: 10, F: 10, S: 9, V: 10)
~Wonka 8,5
(P: 8, F: 9, S: 8, V: 9)
~Scott Pilgrim vs. The World 9,25
(P: 8, F: 9, S: 10, V:10)
~Atonement 6,75
(P: 6, F: 8, S: 7, V: 6)
~Not Another Highschool Movie 7,5
(P: 8, F: 6, S: 6, V: 10)
~21 Jump Street 8,25
(P: 8, F: 8, S: 7, V: 10)
~22 Jump Street 8,5
(P: 8, F: 8, S: 8, V: 10)
~Idiocracy 7,75
(P: 8, F: 7, S: 6, V: 10)
~Clueless 7,5
(P: 7, F: 7, S: 7, V: 9)
~Primal Fear 9
(P: 10, F: 8, S: 8, V: 10)
~Tetris 8,75
(P: 8, F: 8, S: 9, V: 10)
~Ready Player One 8,75
(P: 7, F: 10, S: 9, V: 9)
~Wanted 9
(P: 8, F: 9, S: 8, V: 11)
~Me Before You 7,75
(P: 8, F: 7, S: 7, V: 9)
~John Carter 9,25
(P: 8, F: 9, S: 9, V: 11)
~Red Sparrow 8,25
(P: 9, F: 7, S: 7, V: 10)
~Hangover 7,25
(P: 7, F: 6, S: 7, V: 9)
~The Ron Clark Story 7,25
(P: 8, F: 6, S: 6, V: 9)
~Old Dads 6,5
(P: 7, F: 5, S: 6, V: 8)
~Super Mario Bros Movie 10
(P: 8, F: 11, S: 10, V: 11)
~Norbid 6,75
(P: 5 F: 6, S: 7, V: 9)
~Ford vs. Ferrari (Le Mans '66) 10
(P: 10, F: 10, S: 9, V: 11)
~Inside Out 2 8,5
(P: 9, F: 8, S: 8, V: 9)
~Mission Impossible 8
(P: 8, F: 8, S: 7, V: 9)
~Mission Impossible 2 5,75
(P: 6, F: 6, S: 4, V: 7)
~Mission Impossible 3 8,5
(P: 9, F: 8, S: 7, V: 9)
~Mission Impossible: Ghost Protocol 9
(P: 9, F: 10, S: 8, V: 9)
~Mission Impossible: Rogue Nation 9,75
(P: 10, F: 10, S: 9, V: 10)
~Mission Impossible: Fallout 10,5
(P: 11, F: 10, S: 10, V: 11)
~Mission Impossible: Dead Reckoning 9
(P: 8, F: 10, S: 9, V: 9)
~Mission Impossible: Final Reckoning 9,75
(P: 9, F: 11, S: 9 V: 10)
~Runaway Jury 8,25
(P: 9, F: 8, S: 6, V: 10)
~Two Distant Strangers 6,75
(P: 8, F: 6, S: 5, V: 8)
~Pitch Perfect 8,75
(P: 8, F: 7, S: 9, V: 11)
~Pitch Perfect 2 7,75
(P: 7, F: 7, S: 8, V: 9)
~Pitch Perfect 3 7
(P: 6, F: 8, S: 7, V: 7)
~Inside Man 8,75
(P: 10, F: 8, S: 6, V: 11)
~The Score 6,5
(P: 6, F: 6, S: 7, V: 7)
~The Big Short 8,75
(P: 10, F: 8, S: 6, V: 11)
~Flight 7,25
(P: 7, F: 8, S: 6, V: 8)
~Collateral 8,25
(P: 9, F: 8, S: 7, V: 9)
~Man of Fire 7,75
(P: 8, F: 8, S: 7, V: 8)
~Training Day 8,75
(P: 10, F: 8 , S: 8, V: 9)
~The Banker 8
(P: 9, F: 7, S: 6, V: 10)
~A Few Good Men 8
(P: 9, F: 7, S: 6, V: 10)
~The Departed 9,5
(P: 10, F: 10, S: 8, V: 10)
~The Martian 8,5
(P: 8, F: 9, S: 7, V: 10)
~World War Z 7
(P: 8, F: 7, S: 5, V: 8)
~Zodiac 7,75
(P: 9, F: 8, S: 6, V: 8)
~Bridge of Spies 8
(P: 9, F: 8, S: 6, V: 9)
~The Devil's Advocate 8,25
(P: 9, F: 8, S: 7, V: 9)
~Constantine 9
(P: 10, F: 9, S: 6, V: 11)
~Speed 7,75
(P: 8, F: 7, S: 6, V: 10)
~Point break 6,75
(P: 7, F: 8, S: 5, V: 7)
~The Man from U.N.C.L.E. 7,75
(P: 8, F: 8, S: 7, V: 8)
~Harry Potter Philosopher's Stone 8,5
(P: 8, F: 7, S: 10, V: 9)
~Harry Potter Chamber of Secrets 9,25
(P: 9, F: 8, S: 10, V: 10)
~Harry Potter Prisoner of Azkaban 8,5
(P: 8, F: 10, S: 8, V: 9)
~Harry Potter Goblet of Fire 7,25
(P: 6, F: 9, S: 7, V: 7)
~Harry Potter Order of the Phoenix 9,25
(P: 9, F: 10, S: 8, V: 10)
~Harry Potter Half-Blood Prince 8,5
(P: 7, F: 8, S: 9, V: 10)
~Harry Potter Deathy Hallows Part 1 9
(P: 9, F: 9, S: 8, V: 10)
~Harry Potter Deathly Hallows Part 2 9,25
(P: 9, F: 10, S: 8, V: 10)
~The Mask 8,75
(P: 9, F: 8, S: 8, V: 10)
~The Social Network 7,75
(P: 8, F: 8, S: 6, V: 9)
~Bruce Almighty 7,5
(P: 7, F: 7, S: 6, V: 10)
~Evan Almighty 7
(P: 5, F: 8, S: 6, V: 9)
~The Change-Up 6,25
(P: 5, F: 6, S: 6, V: 8)
~The Fast & The Furious 7
(P: 7, F: 6, S: 7, V: 8)
~2 Fast 2 Furious 7
(P: 6, F: 5, S: 8, V: 9)
~The Fast & The Furious: Tokyo Drift 6,5
(P: 5, F: 7, S: 8, V: 6)
~Fast & Furious 7,25
(P: 8, F: 7, S: 7, V: 8)
~Fast Five 8
(P: 8, F: 8, S: 8, V: 8)
~Fast & Furious 6 7,75
(P: 8, F: 9, S: 7, V: 8)
~Furios 7 7,5
(P: 7, F: 9, S: 7, V: 7)
~The Imitation Game 8,75
(P: 10, F: 8, S: 7, V: 10)
~The Lego Ninjago Movie 6,75
(P: 7, F: 7, S: 7, V: 6)

## To be Watched

Alien
Predator
A vs P
The godfather
schindler's list
Saving private ryan
The lion king
Spirit
ghostbusters
pelican files
scent of a woman
Sweet november
Capcana viitorului
Ghost rider
Omul care tunde iarba
The conjuring
Nightmare on elm street
Amityvile
The birds
Psycho
American psycho
Friday the 13th
Whiplash
Contact
Traffic
Finding neverland
Intimitate
Cold Mountain
Orele
Invinoveritas
21 de grame
Dancer in the dark
Hearts in Atlantis
The big fish
Arizona Dream
Codename mercury
Form Dusk till Dawn
The rock
Legendele toamnei
Saw
Remember me
Les miserable
V from Vendetta
Before sunrise
True romance - Q
Mere rosii
One day
Brokeback moutain
The room
Watchmen
Stardust
Philadelphia
Ms doubtfire
Nany McFee
Almost famous
Wayne's world
The logest yard
2012
Gone with the wind
Shutter island
Sex and the City
Cursa Nebunilor
Ciuleandra
Southside with You
Bonnie and Clyde
pacientul englez
The Legend of 1900
Sin City
Weekend at bernie's
La Dolce Vita
Up
Amadeus
Whe Harry met Sally
Chinatown
James Bond
Terminator
Her
Red eye
La vie en rose
La vie est belle
Juno
Begin Again
revolutionary world
The secret
Dinner for Schurms
Bratz
American Gangster
The Town
The number 23
Seven Pshycopaths
The master
Clear and Present Danger
Mariage Story
Independence Day
Armageddon
Shallow.Grave
King of Comedy
Closer
Scream
Ronin
American Assassin
The Pianist
Old Boy
sfera
All the money in the world
The master
Split
The craft
Palm Springs
The Men who Stare at Goats
Donnie Brasco
Zorba the Great
Vaniila Sky
Basic Instinct
The platform
Rush Hour
T2: Trainspotting
Se7en
Source Code
Dune
Sleeplees in Seatle
500 Days of Summer
Law abiding citizen
Rounders
Heat
Code
The Whole Nine Yards
The time travelers wife
Snatch
The Vault
The lobster
Blow
Gangs of new york
The irishman
Casino
American History X
Insomnia
Memento
Mona Lisa
A time to kill
Crash
Crazy Stupid Love
The Place Beyond The Pines
Red Eye
Southpaw
The good sheperd
Out of sight
Legend
Tinker Tailor Soldier Spy
Vice
American Hustler
The machinist
Awakening
Dead Again
Creed
Malcom X
The gentlemen
The blues brothers
The Fault in our starts
Terminal
The bankrobbers: the backstory
Jerry and Marge Go Large
Nixon
Naked
Unstoppable
The Taking of Pelham 123
Enemy of the State
The Prestige
The 355
Death on the Nile
Uncharted
The Batman
The Lost City
The secrets of dumbledore
Top Gun: Maverick
Lightyear
Elvis
Minions: Rise of Gru
The Fablemans
The Rainmaker
River's Edge
Something's gotta give
Bill & Ted's Excellent Adventure
Official Competition
Elvis
The Menu
Everything Everywhere all at Once
The Unbereable Weight of Massive Talent
Hustle
Vengeance
Bullet Train
Don't Worry Darling
Do Revenge
The Banshees of Inisherin
Don't Look Up
Tar
The Whale
Whiskey Tango Foxtrot
Boiler Room
Gone in 60 Seconds
The Lobster
The Favourite
9th Gate
The Wash
A Beautiful Mind
Four Lions
Triangle of Sadness
Seven Pounds
Coach Carter
L'homme fidele
The unbearable lightness of being
The Prince of Tides
Solaris
Notting Hill
Hiroshima mon amour
Next
The girl nextdoor
Eyes Wide Shut
Requem For a Dream
What's Eating Gilbert Grape
Once
Office Space
Cel Ales
The founder
Past Midnight - Q
Natural Born Killers - Q
Blowout
Crimson Dawn
Wall Street
Fast and Furious
Passengers
Johnny English
Johnny English 2
Johnny English 3
Grown Ups
The Click
50 First Dates
Maze Runner
Night at the Museum
Night at the Museum 2
Jumanji
Liar Liar
Ace Ventura
Raging Bull
Citizen Kane
Wizard of Oz
Lawrence of arabia
Vertigo
On The Waterfront
Sunset boulevard
The Sound of Music
12 angry men
west side story
2001 Space Odyssey
E.T.
China Town
The Brigde on the River Kwai
Singing in the Rain
It's a Wonderful Life
Dr Strangelove
Some Like it Hot
Ben-Hur
Gladiator
From Here to Eternity
Unforgiveb
Rocky
A Streetcar Named Desire
The Philadelphia Story
To Kill a Mockingbird
An American in Paris
The Best Years of Our Lives
Mr Fair Lady
Clockwork Orange
Doctor Zhivago
The Searchers
The Reader
Lucy
Compton
How to train your dragon
How to train your dragon 2
How to train your dragon 3
Totally Killer
The Good Killer
The Darkest Minds
Real Steell
The Truman Show
Man In Black
Man In Black 2
Man In Black 3
Man In Black: International
Odd Thomas
Tag
The Dark Tower
Valentine's Day
Collosal
The Wizard of Lies
I Love you, Man
Eyes Wide Shut
Honey Don't
Meet Dave
The Five Year Engagement
Superbad
Premium Rush
Suicide Squad
Central Intelligence
Lucy
Bernie
three kings
from paris with love
A Bronx Tale
tiptoe
Lean on Me
Just Like Heaven
Upload
The Town
The Worst Person in The World
