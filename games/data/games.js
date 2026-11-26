/**
 * Game library data.
 *
 * Each GAMES entry:
 *   id           unique slug (string)
 *   title        display name (string)
 *   aka          alternate name shown under the title, e.g. "Oh H*ll" (optional; searchable)
 *   cover        image path (e.g. "../games/images/catan.jpg"); "" => generated placeholder
 *   description  short blurb (string)
 *   minPlayers   number
 *   maxPlayers   number
 *   playtimeMin  minutes (number)
 *   playtimeMax  minutes (number)
 *   categories   string[]  (subset of CATEGORIES)
 *   complexity   "easy" | "medium" | "heavy" (shown as Easy / Medium / Involved),
 *                tiered relative to this collection: easy < 1.3 BGG weight,
 *                medium 1.3-1.99, heavy >= 2.0; judgment call when bggWeight is null
 *   bggWeight    BoardGameGeek complexity weight (1-5), or null if BGG has none
 *   tags         string[]  (free-form key tags)
 *   bggUrl       BoardGameGeek URL (string)
 *   howToPlay    { goal: string, steps: string[] } short rules summary
 *   howToPlayVideo YouTube 'How to Play' URL (string)
 *   favorite     true for a personal favorite (optional; shows a star + Favorites filter)
 *
 * Data here is author-controlled static content. If untrusted data is ever
 * added, switch user-facing fields from innerHTML to textContent.
 */

export const CATEGORIES = [
  "Strategy",
  "Party",
  "Social Deduction",
  "Cooperative",
  "Competitive",
  "Card Game",
  "Board Game",
  "Deck Building",
  "Engine Building",
  "Family",
  "Trivia",
  "Word Game",
  "Bluffing",
  "Dice",
  "Worker Placement",
  "Escape Room",
  "Legacy",
  "Campaign"
];

/** The categories shown first on cards and in the picker (rest behind "Show More"). */
export const CORE_CATEGORIES = [
  "Party",
  "Strategy",
  "Cooperative",
  "Social Deduction",
  "Card Game",
  "Family"
];

export const GAMES = [
  {
    id: "bang",
    title: "BANG!",
    cover: "../games/images/bang.jpg",
    description: "A wild Spaghetti Western-themed card game where players are secretly assigned roles like Sheriff, Deputy, Outlaw, or Renegade and engage in tactical shootouts.",
    minPlayers: 4,
    maxPlayers: 7,
    playtimeMin: 20,
    playtimeMax: 40,
    categories: ["Card Game", "Social Deduction", "Bluffing", "Party", "Competitive"],
    complexity: "medium",
    bggWeight: 1.63,
    tags: ["Hidden Roles", "Variable Player Powers", "Team Play", "Player Elimination", "Take That", "Hand Management", "Wild West"],
    bggUrl: "https://boardgamegeek.com/boardgame/3955/bang",
    howToPlay: {
      goal: "Your secret role decides how you win: the Sheriff and Deputies must take out the Outlaws and the Renegade, the Outlaws want the Sheriff dead, and the Renegade wants to be the last one standing.",
      steps: [
        "Everyone gets a secret role (only the Sheriff reveals theirs) and a character with a special ability. Your life points are also your hand limit.",
        "On your turn, draw 2 cards, then play as many as you like, but only one BANG! per turn. Shoot players within range, heal with Beer, or equip guns and horses.",
        "A target can dodge a BANG! with a Missed! card; otherwise they lose a life point. Discard down to your life total at the end of your turn.",
        "Eliminated players reveal their role. The game ends the moment one side's win condition is met."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=dcanu6cwfxc"
  },
  {
    id: "catan",
    favorite: true,
    title: "Catan",
    cover: "../games/images/catan.jpg",
    description: "Players collect and trade resources like lumber, brick, wool, grain, and ore to build roads, settlements, and cities on the modular island of Catan. Includes the 5-6 Player Expansion.",
    minPlayers: 3,
    maxPlayers: 6,
    playtimeMin: 60,
    playtimeMax: 120,
    categories: ["Strategy", "Board Game", "Family", "Dice", "Competitive"],
    complexity: "heavy",
    bggWeight: 2.28,
    tags: ["Trading", "Negotiation", "Resource Management", "Network Building", "Modular Board", "5-6 Player Expansion"],
    bggUrl: "https://boardgamegeek.com/boardgame/13/catan",
    howToPlay: {
      goal: "Be the first to reach 10 victory points.",
      steps: [
        "Each turn, roll two dice. Every settlement or city touching a hex with that number produces its resource (cities produce two).",
        "Trade resources with other players, or with the bank at 4:1 (better at ports).",
        "Spend resources to build roads, settlements (1 point), and cities (2 points), or to buy development cards.",
        "Rolling a 7 moves the robber: it blocks a hex, lets you steal a card, and anyone holding more than 7 cards discards half.",
        "Longest Road and Largest Army are each worth 2 bonus points."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=6OF32Eq5DZo"
  },
  {
    id: "codenames",
    title: "Codenames",
    cover: "../games/images/codenames.jpg",
    description: "Two opposing spymasters give one-word clues that can point to multiple words on the board, while their teammates try to find their agents without hitting the assassin.",
    minPlayers: 2,
    maxPlayers: 8,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Party", "Word Game", "Family", "Competitive"],
    complexity: "easy",
    bggWeight: 1.25,
    tags: ["Team Play", "Clue Giving", "Word Association", "Deduction"],
    bggUrl: "https://boardgamegeek.com/boardgame/178900/codenames",
    howToPlay: {
      goal: "Be the first team to find all of your agents on the 5×5 grid of words.",
      steps: [
        "Split into two teams. Each has a spymaster who can see the secret key card showing which words belong to which team.",
        "The spymaster gives a one-word clue plus a number, like “Ocean, 2,” pointing to that many of their team's words.",
        "Teammates touch words one at a time. Right guesses let you keep going (up to the number plus one); a bystander or the other team's word ends your turn.",
        "Touch the assassin and your team loses instantly."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=9BSi6Gi3Bzo"
  },
  {
    id: "coup",
    title: "Coup",
    cover: "../games/images/coup.jpg",
    description: "A fast-paced card game of bluffing, deduction, and deceit where players try to eliminate their rivals' influence. Includes the Coup: Reformation expansion, which adds team factions and support for up to 10 players.",
    minPlayers: 2,
    maxPlayers: 10,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Social Deduction", "Bluffing", "Card Game", "Competitive", "Party"],
    complexity: "medium",
    bggWeight: 1.41,
    tags: ["Hidden Roles", "Player Elimination", "Take That", "Variable Player Powers", "Team Factions", "Reformation Expansion"],
    bggUrl: "https://boardgamegeek.com/boardgame/131357/coup",
    howToPlay: {
      goal: "Be the last player with any influence (face-down character cards) left.",
      steps: [
        "Everyone starts with 2 face-down character cards and 2 coins.",
        "On your turn, take one action: Income (1 coin), Foreign Aid (2 coins), Coup (pay 7 to make someone lose a card), or a character action like the Duke's Tax, the Assassin's kill, or the Captain's steal.",
        "You can claim any character whether you have it or not, but anyone can challenge you. Whoever is wrong loses a card.",
        "Some actions can be blocked by claiming the right character. With 10 or more coins, you must Coup.",
        "The Reformation expansion adds Loyalist and Reformist factions so bigger groups (up to 10) can play."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=lPlBDZnxHQA"
  },
  {
    id: "pit",
    title: "Pit",
    cover: "../games/images/pit.jpg",
    description: "A noisy and chaotic real-time trading card game where players scream out offers to swap commodities, trying to corner the market on wheat, barley, or other goods.",
    minPlayers: 3,
    maxPlayers: 8,
    playtimeMin: 20,
    playtimeMax: 30,
    categories: ["Card Game", "Party", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.15,
    tags: ["Real-Time", "Trading", "Shouting", "Set Collection"],
    bggUrl: "https://boardgamegeek.com/boardgame/140/pit",
    howToPlay: {
      goal: "Corner the market by collecting all nine cards of one commodity, and be the first to 500 points.",
      steps: [
        "Deal out the cards so each player holds nine.",
        "When the round starts, everyone trades at once. Hold out 1–4 matching cards face down and shout the number (“Two! Two!”). Swap sight unseen with anyone offering the same number.",
        "When you hold all nine of one commodity, ring the bell to win the round and score that commodity's value.",
        "In editions with the Bull and Bear, the Bull is wild and helps you; get stuck holding the Bear and you lose points."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=OFht7Lnp1Ko"
  },
  {
    id: "hitster",
    title: "Hitster",
    cover: "../games/images/hitster.jpg",
    description: "The ultimate music trivia party game where players listen to music clips using a companion app and place them on a timeline in chronological order.",
    minPlayers: 2,
    maxPlayers: 10,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Party", "Trivia", "Card Game", "Competitive"],
    complexity: "easy",
    bggWeight: 1.02,
    tags: ["Music", "Timeline", "Companion App", "Team Play"],
    bggUrl: "https://boardgamegeek.com/boardgame/318243/hitster",
    howToPlay: {
      goal: "Be the first to build a timeline of 10 songs in the correct order.",
      steps: [
        "Scan a song card's QR code with the free Hitster app to play the song through Spotify.",
        "Without looking at the back, place the card in your timeline where you think its release year belongs.",
        "Flip it over. If it's in the right spot, it stays; if not, it's discarded.",
        "Name the artist and title to earn tokens. Spend them to skip a song, or to challenge another player's placement and steal the card if you're right."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=Y_NW6iZh1O0"
  },
  {
    id: "hues-and-cues",
    title: "Hues and Cues",
    cover: "../games/images/hues-and-cues.jpg",
    description: "A colorful communication game where players give one- or two-word clues to guide others to guess a specific color shade among 480 colors on the board.",
    minPlayers: 3,
    maxPlayers: 10,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Party", "Board Game", "Word Game", "Family", "Competitive"],
    complexity: "easy",
    bggWeight: 1.06,
    tags: ["Clue Giving", "Color Identification", "Guessing", "Communication"],
    bggUrl: "https://boardgamegeek.com/boardgame/302520/hues-and-cues",
    howToPlay: {
      goal: "Score the most points by guessing colors from your friends' clues.",
      steps: [
        "The cue giver draws a card, secretly picks one of its four colors, and finds it on the 480-color board.",
        "They give a one-word clue (no color names, and no pointing at things in the room). Everyone places one cone on the board.",
        "Then they give a two-word clue, and everyone places a second cone.",
        "Reveal the color. Cones on it score 3, one space away score 2, and two spaces away score 1. The cue giver scores for every cone inside the 3×3 frame."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=oZSveXpjbak"
  },
  {
    id: "monopoly-star-wars-the-clone-wars",
    title: "Monopoly: Star Wars - The Clone Wars",
    cover: "../games/images/monopoly-star-wars-the-clone-wars.jpg",
    description: "Classic Monopoly meets the Star Wars universe. Buy, sell, and trade properties across the galaxy, constructing settlements and cities while using Jedi and Sith cards.",
    minPlayers: 2,
    maxPlayers: 6,
    playtimeMin: 60,
    playtimeMax: 180,
    categories: ["Board Game", "Competitive", "Dice", "Family"],
    complexity: "medium",
    bggWeight: null,
    tags: ["Roll and Move", "Trading", "Negotiation", "Property Management", "Player Elimination", "Paper Money", "Star Wars"],
    bggUrl: "https://boardgamegeek.com/boardgame/38577/monopoly-clone-wars",
    howToPlay: {
      goal: "Bankrupt everyone else and be the last player standing.",
      steps: [
        "Roll two dice and move around the board. Buy any unowned property you land on, or it goes up for auction.",
        "Land on someone else's property and pay rent. Own a whole color group to start building settlements and then cities, this edition's version of houses and hotels.",
        "Draw a Jedi or Sith card when you land on those spaces.",
        "Trade properties and money freely. If you can't pay what you owe, you're out."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=4nz-_hvFw44"
  },
  {
    id: "one-night-ultimate-werewolf",
    title: "One Night Ultimate Werewolf",
    cover: "../games/images/one-night-ultimate-werewolf.jpg",
    description: "A fast-paced social deduction game for 3-10 players where everyone gets a hidden role with special abilities. Over a single night and day phase, villagers must find the werewolf.",
    minPlayers: 3,
    maxPlayers: 10,
    playtimeMin: 10,
    playtimeMax: 10,
    categories: ["Social Deduction", "Bluffing", "Party", "Card Game", "Competitive"],
    complexity: "medium",
    bggWeight: 1.38,
    tags: ["Hidden Roles", "Variable Player Powers", "Team Play", "Deduction", "Companion App"],
    bggUrl: "https://boardgamegeek.com/boardgame/147949/one-night-ultimate-werewolf",
    howToPlay: {
      goal: "Villagers win by voting out a werewolf. Werewolves win if no werewolf is voted out.",
      steps: [
        "Deal one role card to each player and three to the center. Everyone secretly looks at theirs.",
        "Night: everyone closes their eyes while the app narrates. Roles wake in order and act: the Seer peeks at a card, the Robber swaps with someone, the Troublemaker swaps two other players.",
        "Day: you get a few minutes to discuss, claim, and bluff. Your card may have changed overnight without you knowing.",
        "Everyone points at once. The player with the most votes is eliminated, and the card in front of them decides who wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=CI8P-ErLCOs"
  },
  {
    id: "phase-10",
    title: "Phase 10",
    cover: "../games/images/phase-10.jpg",
    description: "A rummy-type card game where players compete to complete 10 different phases—like sets of numbers or runs—before their opponents do.",
    minPlayers: 2,
    maxPlayers: 6,
    playtimeMin: 45,
    playtimeMax: 45,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.25,
    tags: ["Rummy", "Set Collection", "Melding", "Hand Management", "Take That"],
    bggUrl: "https://boardgamegeek.com/boardgame/1258/phase-10",
    howToPlay: {
      goal: "Be the first to complete all 10 phases, like two sets of three or a run of seven.",
      steps: [
        "On your turn, draw from the deck or the discard pile, then discard one card.",
        "When you have your current phase, lay it down. After that, you can add cards to any laid-down phase to empty your hand.",
        "Wilds fit anywhere; Skip cards make another player lose a turn.",
        "When someone goes out, everyone who completed their phase moves on to the next one. Cards left in your hand count as points against you, which break ties."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=e3tZ3YboyO4"
  },
  {
    id: "taboo",
    title: "Taboo",
    cover: "../games/images/taboo.jpg",
    description: "A classic word-guessing party game where players try to get their teammates to guess a word without using the five obvious \"taboo\" forbidden words.",
    minPlayers: 4,
    maxPlayers: 10,
    playtimeMin: 20,
    playtimeMax: 30,
    categories: ["Party", "Word Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.2,
    tags: ["Team Play", "Clue Giving", "Real-Time", "Communication"],
    bggUrl: "https://boardgamegeek.com/boardgame/1111/taboo",
    howToPlay: {
      goal: "Score more points than the other team by getting your teammates to guess words.",
      steps: [
        "On your team's turn, one player draws cards and races the timer.",
        "Describe the word at the top of the card without saying it, part of it, or any of the five “taboo” words listed below it.",
        "Every correct guess scores a point. Skipping a card gives the other team a point.",
        "A player from the other team watches with the buzzer and buzzes if you slip. That card goes to the other team."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=4QeA4nrcQV0"
  },
  {
    id: "trial-by-trolley",
    favorite: true,
    title: "Trial by Trolley",
    cover: "../games/images/trial-by-trolley.jpg",
    description: "A dark-humor party game from Cyanide & Happiness where players must argue why the trolley driver should spare their track and run over the other team instead.",
    minPlayers: 3,
    maxPlayers: 13,
    playtimeMin: 30,
    playtimeMax: 90,
    categories: ["Party", "Card Game", "Competitive"],
    complexity: "easy",
    bggWeight: 1.02,
    tags: ["Mature Content", "Humor", "Debating", "Team Play", "Storytelling"],
    bggUrl: "https://boardgamegeek.com/boardgame/282171/trial-by-trolley",
    howToPlay: {
      goal: "Win rounds by convincing the conductor to spare your track and run over the other one.",
      steps: [
        "One player is the conductor. Everyone else splits into two teams, each with a track.",
        "Each team adds an Innocent card to its own track and a Guilty card to the other team's track, then plays a Modifier card to twist things further.",
        "Both teams argue, loudly and creatively, for why their track should be spared.",
        "The conductor pulls the lever. The team whose track survives wins the round."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=6oeHHfSoqt8"
  },
  {
    id: "uno",
    title: "UNO",
    cover: "../games/images/uno.jpg",
    description: "A classic family card game where players match colors or numbers from their hand with the top card on the discard pile, racing to shed all their cards.",
    minPlayers: 2,
    maxPlayers: 10,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.1,
    tags: ["Shedding", "Matching", "Take That", "Hand Management", "Classic"],
    bggUrl: "https://boardgamegeek.com/boardgame/2223/uno",
    howToPlay: {
      goal: "Be the first to play all of your cards.",
      steps: [
        "Match the top card of the discard pile by color, number, or symbol. If you can't, draw a card.",
        "Action cards shake things up: Skip, Reverse, Draw Two, and Wilds. Wild Draw Four lets you pick the color and makes the next player draw four.",
        "Yell “UNO!” when you're down to one card. Get caught not saying it and you draw two.",
        "First to empty their hand wins the round. Optional scoring: first to 500 points wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=FkuqYtE1rw0"
  },
  {
    id: "five-crowns",
    title: "Five Crowns",
    cover: "../games/images/five-crowns.jpg",
    description: "A five-suited rummy-style card game where the wild card shifts in each round as players make runs and books to minimize their score.",
    minPlayers: 1,
    maxPlayers: 7,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.22,
    tags: ["Rummy", "Set Collection", "Wild Cards", "Hand Management", "Solo Mode"],
    bggUrl: "https://boardgamegeek.com/boardgame/1472/five-crowns",
    howToPlay: {
      goal: "Have the lowest score after 11 rounds.",
      steps: [
        "Round one deals 3 cards, round two deals 4, and so on up to 13 cards in the last round.",
        "The wild card changes each round to match the hand size: 3s are wild in round one, up to Kings in the last. Jokers are always wild.",
        "On your turn, draw and discard, trying to arrange your whole hand into books (3+ of a kind) and runs (3+ in a row in one suit).",
        "Once someone goes out, everyone else gets one final turn. Unmatched cards count as points against you."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=8BP2B8ifavc"
  },
  {
    id: "set",
    title: "Set",
    cover: "../games/images/set.jpg",
    description: "A fast-paced pattern recognition card game where players race to find triplets of cards that are either all identical or all completely different in four features.",
    minPlayers: 1,
    maxPlayers: 20,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "medium",
    bggWeight: 1.65,
    tags: ["Real-Time", "Pattern Recognition", "Puzzle", "Visual Perception", "Educational", "Solo Mode"],
    bggUrl: "https://boardgamegeek.com/boardgame/1198/set",
    howToPlay: {
      goal: "Find the most sets.",
      steps: [
        "Lay out 12 cards. Each card has four features: number, shape, color, and shading.",
        "A set is three cards where each feature is either all the same or all different across the three cards.",
        "There are no turns. The first person to spot a set shouts “Set!” and takes it, and three new cards are dealt.",
        "If nobody can find a set, add three more cards. When the deck runs out, the player with the most sets wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=azaArSs-i0c"
  },
  {
    id: "the-game-of-things",
    "title": "The Game of Things",
    cover: "../games/images/the-game-of-things.jpg",
    description: "A hilarious party game where players write anonymous, creative answers to wacky prompts, and everyone tries to guess who wrote what.",
    minPlayers: 4,
    maxPlayers: 15,
    playtimeMin: 45,
    playtimeMax: 45,
    categories: ["Party", "Bluffing", "Competitive"],
    complexity: "easy",
    bggWeight: 1.2,
    tags: ["Humor", "Writing", "Guessing", "Deduction", "Paper and Pencil"],
    bggUrl: "https://boardgamegeek.com/boardgame/10934/the-game-of-things",
    howToPlay: {
      goal: "Score points by guessing who wrote which answer, and by staying hidden.",
      steps: [
        "The reader draws a topic card, like “Things you shouldn't say at a wedding,” and reads it aloud.",
        "Everyone secretly writes an answer. The reader shuffles them and reads them all out loud.",
        "Starting left of the reader, players take turns guessing who wrote which answer. A correct guess scores a point, and the identified player is out for the round.",
        "Keep guessing until one player is left; they score bonus points for staying hidden."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=z4SHjRHmCaE"
  },
  {
    id: "telestrations",
    "title": "Telestrations",
    cover: "../games/images/telestrations.jpg",
    description: "A laugh-out-loud drawing party game combining telephone and sketching, where players sketch clues, pass them along, and guess the results.",
    minPlayers: 4,
    maxPlayers: 8,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Party", "Cooperative", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.07,
    tags: ["Drawing", "Humor", "Telephone Game", "Communication"],
    bggUrl: "https://boardgamegeek.com/boardgame/46213/telestrations",
    howToPlay: {
      goal: "Laugh at how a word gets mangled as it travels around the table. Scoring is optional.",
      steps: [
        "Everyone secretly picks a word and writes it on the first page of their sketchbook.",
        "Draw your word, then pass your book to the left.",
        "Look at the drawing you received, turn the page, and write what you think it is. Pass again.",
        "Alternate drawing and guessing until the books return to their owners, then reveal each chain from start to finish."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=w5zVtncdgWg"
  },
  {
    id: "twister",
    "title": "Twister",
    cover: "../games/images/twister.jpg",
    description: "A classic physical dexterity party game where players place hands and feet on colored dots on a large floor mat according to the spinner's instructions.",
    minPlayers: 2,
    maxPlayers: 4,
    playtimeMin: 10,
    playtimeMax: 10,
    categories: ["Party", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.09,
    tags: ["Physical Activity", "Dexterity", "Spinner", "Classic"],
    bggUrl: "https://boardgamegeek.com/boardgame/5894/twister",
    howToPlay: {
      goal: "Be the last player standing without falling over.",
      steps: [
        "Lay out the mat with its rows of red, yellow, green, and blue circles.",
        "A referee spins the spinner and calls out a body part and a color, like “Right hand, green.”",
        "Every player moves that hand or foot to an open circle of that color.",
        "Fall over, or touch the mat with an elbow or knee, and you're out."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=7A5XO0udmdo"
  },
  {
    id: "sushi-go",
    "title": "Sushi Go!",
    cover: "../games/images/sushi-go.jpg",
    description: "A fast-playing card-drafting game where players pick and pass cards to assemble the most delicious combinations of sushi dishes like maki, tempura, and sashimi.",
    minPlayers: 2,
    maxPlayers: 5,
    playtimeMin: 15,
    playtimeMax: 15,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: 1.16,
    tags: ["Card Drafting", "Set Collection", "Simultaneous Action", "Hand Management", "Cute Artwork"],
    bggUrl: "https://boardgamegeek.com/boardgame/133473/sushi-go",
    howToPlay: {
      goal: "Score the most points over three rounds by collecting the best sushi combos.",
      steps: [
        "Everyone gets a hand of cards. Each turn, keep one card face down and pass the rest to your left.",
        "Everyone reveals their chosen card at the same time. Repeat until all the cards are played.",
        "Each dish scores differently: tempura in pairs, sashimi in sets of three, dumplings grow with more, wasabi triples your next nigiri, and the most maki rolls earns a bonus.",
        "Puddings are scored after the third round: the most earns points, the fewest loses them."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=vkBMxDgteFg"
  },
  {
    id: "fluxx",
    "title": "Fluxx",
    cover: "../games/images/fluxx.jpg",
    description: "A chaotic card game where the rules are constantly changing. The players draw and play cards, modifying rules, goals, and keeper conditions.",
    minPlayers: 2,
    maxPlayers: 6,
    playtimeMin: 5,
    playtimeMax: 30,
    categories: ["Card Game", "Competitive", "Party"],
    complexity: "medium",
    bggWeight: 1.39,
    tags: ["Ever-changing Rules", "Chaos", "Take That", "Set Collection", "Hand Management"],
    bggUrl: "https://boardgamegeek.com/boardgame/258/fluxx",
    howToPlay: {
      goal: "Meet whatever the current Goal card says. When the goal changes, so does how you win.",
      steps: [
        "The game starts with one rule: draw one card, play one card.",
        "Play New Rule cards to change how many cards you draw, play, or can hold.",
        "Play Keepers in front of you, and play Goal cards to set the winning condition (usually owning two specific Keepers).",
        "Action cards cause one-time chaos. The moment anyone meets the current goal, they win."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=8D-7ty1hPuc"
  },
  {
    id: "we-didnt-playtest-this-at-all",
    favorite: true,
    "title": "We Didn't Playtest This at All",
    cover: "../games/images/we-didnt-playtest-this-at-all.jpg",
    description: "An intentionally ridiculous and chaotic card game where your sole objective is to win. Includes the Legacies expansion, allowing players to write on cards, apply stickers, and permanently alter the game in search of ridiculous victory.",
    minPlayers: 2,
    maxPlayers: 10,
    playtimeMin: 1,
    playtimeMax: 10,
    categories: ["Card Game", "Party", "Competitive", "Legacy"],
    complexity: "easy",
    bggWeight: 1.08,
    tags: ["Chaos", "Humor", "Take That", "Player Elimination", "Real-Time", "Legacies Expansion"],
    bggUrl: "https://boardgamegeek.com/boardgame/31016/we-didnt-playtest-all",
    howToPlay: {
      goal: "Win. Somehow.",
      steps: [
        "Everyone starts with two cards. On your turn, draw one card and play one card.",
        "Cards do ridiculous things: make someone lose instantly, start a rock-paper-scissors duel, or protect you from the next disaster.",
        "Get eliminated and you're out until the next game, which starts about 30 seconds later.",
        "With the Legacies expansion, players write on cards and add stickers to permanently change the game."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=iHLN937oiLE"
  },
  {
    id: "saboteur",
    "title": "Saboteur",
    cover: "../games/images/saboteur.jpg",
    description: "Players act as dwarf gold miners building tunnels into a mountain, but some are secret saboteurs working to block their efforts and steal the gold.",
    minPlayers: 3,
    maxPlayers: 10,
    playtimeMin: 30,
    playtimeMax: 30,
    categories: ["Card Game", "Social Deduction", "Bluffing", "Competitive", "Party"],
    complexity: "medium",
    bggWeight: 1.32,
    tags: ["Hidden Roles", "Team Play", "Path Building"],
    bggUrl: "https://boardgamegeek.com/boardgame/9220/saboteur",
    howToPlay: {
      goal: "Miners want to dig a tunnel to the gold; saboteurs want to stop them. Most gold after three rounds wins.",
      steps: [
        "Secret role cards decide who is a miner and who is a saboteur.",
        "On your turn, play a path card to extend the tunnel toward one of three face-down goal cards, play an action card (break someone's tools, repair yours, or peek at a goal with a map), or discard.",
        "Broken tools stop you from playing path cards until someone repairs them.",
        "If the tunnel reaches the treasure, the miners split the gold. If the cards run out first, the saboteurs take it."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=FNTesrTLh4I"
  },
  {
    id: "monopoly-deal",
    "title": "Monopoly Deal",
    cover: "../games/images/monopoly-deal.jpg",
    description: "A fast-paced card game variation of Monopoly where players race to collect three complete sets of properties while stealing cards and demanding rent.",
    minPlayers: 2,
    maxPlayers: 5,
    playtimeMin: 15,
    playtimeMax: 15,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "medium",
    bggWeight: 1.31,
    tags: ["Set Collection", "Take That", "Stealing", "Hand Management"],
    bggUrl: "https://boardgamegeek.com/boardgame/40398/monopoly-deal-card-game",
    howToPlay: {
      goal: "Be the first to collect three complete property sets of different colors.",
      steps: [
        "Draw 2 cards each turn (5 if your hand is empty) and play up to 3.",
        "Play cards as money into your bank, as properties in front of you, or as actions.",
        "Action cards let you charge rent, steal a property (Sly Deal), take a whole set (Deal Breaker), or cancel anything with Just Say No.",
        "When you owe money, pay from your bank or your properties. There's no change given."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=Gc0XrTjmCV8"
  },
  {
    id: "the-game-of-life-adventures-card-game",
    "title": "The Game of Life: Adventures Card Game",
    cover: "../games/images/the-game-of-life-adventures-card-game.jpg",
    description: "A card game spin-off of the classic Life game where players build a life story by collecting Adventure, Career, Family, and Wealth cards.",
    minPlayers: 2,
    maxPlayers: 4,
    playtimeMin: 20,
    playtimeMax: 30,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Set Collection", "Life Choices", "Hand Management", "Classic Remake"],
    bggUrl: "https://boardgamegeek.com/boardgame/88691/game-life-adventures-card-game",
    howToPlay: {
      goal: "Score the most points by building the best life story out of cards.",
      steps: [
        "On your turn, draw a card and play one into your life story: Career, Family, Wealth, and Adventure cards.",
        "Many cards have requirements, so you need the right cards in play before you can add them.",
        "Action cards let you swap or steal cards from other players' lives.",
        "When the game ends, total the points on your cards. The highest score wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=uuykGYWG_PQ"
  },
  {
    id: "four-on-a-couch",
    title: "Four on a Couch",
    cover: "../games/images/couch.jpg",
    description: "A fun and engaging parlor memory game where two teams compete to get four of their members seated on the designated couch by calling out secret names.",
    minPlayers: 8,
    maxPlayers: 20,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Party", "Competitive"],
    complexity: "medium",
    bggWeight: null,
    tags: ["Memory", "Team Play", "Secret Names", "Paper and Pencil", "Icebreaker"],
    bggUrl: "",
    howToPlay: {
      goal: "Be the first team to get four of your players sitting on the couch.",
      steps: [
        "Everyone writes their name on a slip. Shuffle and deal them out; the name you get is your secret identity.",
        "Sit in a circle with teams alternating (two from each team start on the couch), leaving one seat empty.",
        "The player next to the empty seat calls out a name. Whoever holds that name moves into the empty seat, and the caller and the mover swap name slips.",
        "Names keep moving, so remembering who holds which one is the whole game."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=eKIjx5mBNCw"
  },
  {
    id: "mafia",
    title: "Mafia",
    cover: "../games/images/mafia.jpg",
    description: "The classic social deduction parlor game where a small, informed minority of players (the Mafia) secretly eliminates citizens during the night, while the uninformed majority (the Citizens) tries to debate and execute them during the day.",
    minPlayers: 7,
    maxPlayers: 24,
    playtimeMin: 20,
    playtimeMax: 60,
    categories: ["Social Deduction", "Bluffing", "Party"],
    complexity: "medium",
    bggWeight: 1.38,
    tags: ["Hidden Roles", "Player Elimination", "Team Play", "Deduction", "Narrator Needed", "No Props Needed", "Classic"],
    bggUrl: "https://boardgamegeek.com/boardgame/925/werewolf",
    howToPlay: {
      goal: "Citizens win by eliminating all the Mafia. The Mafia wins once they equal or outnumber the citizens.",
      steps: [
        "A narrator secretly assigns roles: a few Mafia, plus citizens (often including a Doctor and a Detective).",
        "Night: everyone closes their eyes. The Mafia silently choose a victim, the Doctor picks someone to protect, and the Detective asks the narrator about one player.",
        "Day: the narrator reveals who was eliminated. Everyone debates, accuses, and votes to eliminate one suspect.",
        "Repeat until one side wins. Eliminated players stay silent."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=CU1fGfErrXA"
  },
  {
    id: "scum",
    title: "Scum",
    cover: "../games/images/scum.jpg",
    description: "Also known as President, this is a classic social shedding card game where players compete to empty their hands and achieve the highest social rank (President) or avoid the lowest (Scum) for the next round.",
    minPlayers: 3,
    maxPlayers: 8,
    playtimeMin: 15,
    playtimeMax: 40,
    categories: ["Card Game", "Competitive", "Party"],
    complexity: "easy",
    bggWeight: 1.14,
    tags: ["Classic Deck", "Shedding", "Social Hierarchy", "Card Trading", "Hand Management"],
    bggUrl: "https://boardgamegeek.com/boardgame/26353/scum",
    howToPlay: {
      goal: "Get rid of your cards first to become President, and avoid finishing last as the Scum.",
      steps: [
        "Deal out the whole deck. The leader plays a single, a pair, a triple, or four of a kind.",
        "Going around, each player must play the same number of cards at a higher rank, or pass. In most house rules, 2s are high.",
        "When everyone passes, the last player to play clears the pile and leads again.",
        "Finishing order sets the ranks for the next hand: the Scum hands their best cards to the President, who passes back their worst."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=ZLOo4EGYTl4"
  },
  {
    id: "psychiatrist",
    title: "Psychiatrist",
    cover: "../games/images/psychiatrist.jpg",
    description: "One player acts as the Psychiatrist and must diagnose a secret shared 'mental condition' or behavioral pattern chosen by the rest of the patients through clever questioning.",
    minPlayers: 5,
    maxPlayers: 20,
    playtimeMin: 15,
    playtimeMax: 45,
    categories: ["Party", "Social Deduction"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Deduction", "Roleplay", "Observation", "No Props Needed", "Icebreaker"],
    bggUrl: "",
    howToPlay: {
      goal: "As the Psychiatrist, figure out the “condition” the whole group secretly shares.",
      steps: [
        "The Psychiatrist leaves the room. Everyone else agrees on a rule for answering, like “answer as the person on your right.”",
        "The Psychiatrist returns and asks players questions, one at a time.",
        "Everyone answers following the rule. If someone breaks it, the group shouts “Psychiatrist!” and everyone switches seats.",
        "Keep asking until the Psychiatrist diagnoses the condition."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=D1mUwHHkxxA"
  },
  {
    id: "smurf",
    title: "Smurf",
    cover: "../games/images/smurf.jpg",
    description: "A fun parlor guessing game where one player leaves the room while the group chooses a secret verb. Upon returning, the guesser asks questions replacing the secret verb with 'Smurf' to deduce it from context.",
    minPlayers: 4,
    maxPlayers: 15,
    playtimeMin: 10,
    playtimeMax: 30,
    categories: ["Party", "Word Game"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Word Guessing", "Deduction", "No Props Needed", "Icebreaker", "Communication"],
    bggUrl: "",
    howToPlay: {
      goal: "Figure out the secret verb the group chose.",
      steps: [
        "The guesser leaves the room while everyone else picks a verb, like “swim” or “cook.”",
        "The guesser comes back and asks questions, swapping in “smurf” for the unknown verb: “Do you smurf outdoors?” “How often do you smurf?”",
        "Everyone answers honestly about the real verb.",
        "Keep going until the guesser names the verb, then someone new takes a turn."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+smurf+party+game"
  },
  {
    id: "decrypto",
    title: "Decrypto",
    cover: "../games/images/decrypto.jpg",
    description: "A highly-rated team deduction game where players compete to correctly transmit secret numerical codes to their teammates using verbal clues, while trying to intercept the opposing team's transmissions.",
    minPlayers: 3,
    maxPlayers: 8,
    playtimeMin: 15,
    playtimeMax: 45,
    categories: ["Party", "Word Game", "Competitive"],
    complexity: "medium",
    bggWeight: 1.82,
    tags: ["Deduction", "Clue Giving", "Team Play", "Word Association", "Codes"],
    bggUrl: "https://boardgamegeek.com/boardgame/225694/decrypto",
    howToPlay: {
      goal: "Intercept two of the other team's codes before they intercept two of yours, without miscommunicating twice.",
      steps: [
        "Each team has four secret keywords, numbered 1–4, hidden behind their screen.",
        "Each round, one player per team draws a three-digit code (like 3-1-4) and gives three clues hinting at those keywords, in order.",
        "Their team tries to guess the code, and the other team tries to intercept it.",
        "Clues pile up every round, so the other team slowly learns your words. Be clever without being obvious."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=2DBg7Z2-pQ4"
  },
  {
    id: "cambio",
    title: "Cambio",
    cover: "../games/images/cambio.jpg",
    description: "A fun and fast-paced card game of memory, bluffing, and luck where players try to minimize the sum of their four face-down cards by spying, swapping, and calling 'Cambio' when they have the lowest score.",
    minPlayers: 2,
    maxPlayers: 4,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Card Game", "Party", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Memory", "Classic Deck", "Card Swapping", "Spying", "Hand Management"],
    bggUrl: "",
    howToPlay: {
      goal: "Have the lowest total card value when the round ends.",
      steps: [
        "Each player gets four cards face down and may peek at two of them once.",
        "On your turn, draw a card and either swap it with one of your face-down cards or discard it. Discarded power cards let you peek at your cards, peek at an opponent's, or swap cards (house rules vary).",
        "When a card matching one of yours is discarded, slap yours on top to get rid of it. Guess wrong and you take a penalty card.",
        "When you think you're lowest, call “Cambio.” Everyone else gets one more turn, then all cards are revealed."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=dlLbkVR8oe8"
  },
  {
    id: "fishbowl",
    title: "Fishbowl Name Game",
    cover: "../games/images/fishbowl.jpg",
    description: "Also known as Salad Bowl, this is a three-round team party game that combines Charades, Password, and Catchphrase using slips of paper written by the players.",
    minPlayers: 4,
    maxPlayers: 20,
    playtimeMin: 30,
    playtimeMax: 45,
    categories: ["Party", "Word Game", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Team Play", "Charades", "Clue Giving", "Real-Time", "Memory", "Paper and Pencil"],
    bggUrl: "",
    howToPlay: {
      goal: "Score the most points for your team across three rounds.",
      steps: [
        "Everyone writes a few names, words, or phrases on slips and drops them in the bowl.",
        "Teams alternate. One player gets about a minute to get their team to guess as many slips as possible.",
        "Round 1: describe it using any words except the answer. Round 2: one word only. Round 3: charades, no words at all.",
        "The same slips are reused every round, so remembering earlier answers is the key."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=17dCJgvbxIs"
  },
  {
    id: "name-game",
    title: "Name Game",
    cover: "../games/images/name-game.jpg",
    description: "A memory-based parlor game where everyone writes down a secret name. After all names are read aloud once, players take turns guessing who wrote which name to recruit them into their team.",
    minPlayers: 6,
    maxPlayers: 20,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Party", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Memory", "Team Play", "Secret Names", "Paper and Pencil", "Icebreaker"],
    bggUrl: "",
    howToPlay: {
      goal: "Recruit everyone onto your team by figuring out who wrote which name.",
      steps: [
        "Everyone secretly writes down a famous name (real or fictional) and hands it to a reader.",
        "The reader reads every name aloud once, and only once.",
        "On your turn, ask someone if they wrote a specific name. Guess right and they join your team and you go again; guess wrong and it's their turn.",
        "Keep going until one team has recruited everyone."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+name+game+party+game"
  },
  {
    id: "azul",
    title: "Azul",
    cover: "../games/images/azul.jpg",
    description: "A gorgeous tile-drafting game where players compete as artisans decorating a Portuguese palace wall, grabbing colorful tiles from shared factories and arranging them into scoring patterns.",
    minPlayers: 2,
    maxPlayers: 4,
    playtimeMin: 30,
    playtimeMax: 45,
    categories: ["Strategy", "Board Game", "Family", "Competitive"],
    complexity: "medium",
    bggWeight: 1.77,
    tags: ["Tile Drafting", "Pattern Building", "Set Collection", "Abstract", "Hate Drafting"],
    bggUrl: "https://boardgamegeek.com/boardgame/230802/azul",
    howToPlay: {
      goal: "Score the most points by completing rows, columns, and color sets on your wall.",
      steps: [
        "On your turn, take all tiles of one color from a factory display (the rest slide to the center) or all of one color from the center pile.",
        "Place the tiles into one of your five pattern lines. Each line holds only one color, and any tiles that don't fit fall to your floor line as penalties.",
        "When every tile has been taken, completed pattern lines move one tile to your wall and score points for each tile it touches in a row or column.",
        "The game ends after a round in which someone finishes a full horizontal row. Add bonuses for complete rows, columns, and colors; highest score wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=dXuucWGrFMQ"
  },
  {
    id: "here-to-slay",
    title: "Here to Slay",
    cover: "../games/images/here-to-slay.jpg",
    description: "A fantasy card game from the creators of Unstable Unicorns where you build a party of heroes, roll dice to slay monsters, and sabotage your friends along the way.",
    minPlayers: 2,
    maxPlayers: 6,
    playtimeMin: 30,
    playtimeMax: 60,
    categories: ["Card Game", "Strategy", "Dice", "Competitive"],
    complexity: "medium",
    bggWeight: 1.69,
    tags: ["Fantasy", "Dice Rolling", "Take That", "Hand Management", "Variable Player Powers"],
    bggUrl: "https://boardgamegeek.com/boardgame/299252/here-to-slay",
    howToPlay: {
      goal: "Be the first to slay 3 monsters, or to build a party with 6 different hero classes.",
      steps: [
        "Everyone starts with a Party Leader card that sets their class and gives a special power.",
        "On your turn you get 3 action points. Spend them to draw a card, play a Hero or Item, roll to use a Hero's ability, or spend all 3 to attack a monster.",
        "Most actions involve rolling 2 dice against a target number. Other players can play Modifier cards to boost or wreck your roll, or Challenge cards to block a card you're playing.",
        "Slaying a monster requires the right heroes in your party plus a successful roll. The first player to hit either win condition wins immediately."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=gsPZoEJyYMM"
  },
  {
    id: "5-second-rule",
    title: "5 Second Rule",
    cover: "../games/images/5-second-rule.jpg",
    description: "A fast, frantic party game where you have to name three things in a category before the twisty timer runs out. Sounds easy... until the pressure hits and your brain goes blank.",
    minPlayers: 3,
    maxPlayers: 6,
    playtimeMin: 20,
    playtimeMax: 30,
    categories: ["Party", "Family", "Word Game", "Competitive"],
    complexity: "easy",
    bggWeight: 1.1,
    tags: ["Timer", "Rapid Fire", "Name Three", "Real-Time", "Under Pressure"],
    bggUrl: "https://boardgamegeek.com/boardgame/86073/5-second-rule",
    howToPlay: {
      goal: "Be the first player to move your pawn to the finish by answering prompts under pressure.",
      steps: [
        "The player to your left reads a card aloud, like “Name 3 types of cheese,” and flips the 5-second timer.",
        "Shout out three valid answers before the timer runs out. Answers already given this turn don't count.",
        "Get all three in time and move forward. Fail, and the next player gets the same prompt, but they can't repeat any of your answers.",
        "Special cards like Pass and Switch let you dodge or redirect a tough prompt. First to the finish wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=XUvK5lE4Mj4"
  },
  {
    id: "buzzword",
    title: "Buzzword",
    cover: "../games/images/buzzword.jpg",
    description: "A team party game where every clue on a card secretly contains the same hidden word. Race the timer to shout out the full answers and crack the buzzword.",
    minPlayers: 4,
    maxPlayers: 12,
    playtimeMin: 45,
    playtimeMax: 45,
    categories: ["Party", "Word Game", "Competitive"],
    complexity: "easy",
    bggWeight: 1.17,
    tags: ["Team Play", "Clue Giving", "Timer", "Guessing", "Wordplay"],
    bggUrl: "https://boardgamegeek.com/boardgame/8690/buzzword",
    howToPlay: {
      goal: "Score the most points for your team by guessing answers that all contain the round's buzzword.",
      steps: [
        "Split into two teams. The reader draws a card and announces the buzzword, like “Fire,” but keeps the clues secret.",
        "Flip the 45-second timer. The reader gives clues one at a time; the team shouts the full answer, which always includes the buzzword (e.g. “A truck that puts out fires” → Fire Truck).",
        "Each correct answer scores points. Pass if you're stuck and move to the next clue.",
        "When time runs out, the other team can steal any unanswered clues. Play alternates; highest score at the end wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=ulAXZhCd2YI"
  },
  {
    id: "why-are-you-like-this",
    title: "Why Are You Like This?",
    cover: "../games/images/why-are-you-like-this.jpg",
    description: "An Exploding Kittens party game where teammates talk, draw, or act out secret words, but each round's challenge card throws in a ridiculous twist that makes it way harder.",
    minPlayers: 2,
    maxPlayers: 99,
    playtimeMin: 15,
    playtimeMax: 15,
    categories: ["Party", "Word Game", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Team Play", "Charades", "Drawing", "Clue Giving", "Timer", "Humor"],
    bggUrl: "https://boardgamegeek.com/boardgame/425079/why-are-you-like-this",
    howToPlay: {
      goal: "Get your team to guess as many secret words as possible before time runs out.",
      steps: [
        "Split into teams. On your turn, draw a challenge card; it sets how you must give clues, plus a silly twist or restriction.",
        "Start the timer and work through word cards, talking, drawing, or gesturing as the challenge allows.",
        "Every word your team guesses before time is up scores a point. Break the challenge's rule and that word doesn't count.",
        "Pass to the next team and keep rotating. Playing as a couple? Use the two-player Date Night mode."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/watch?v=IzGRFHWCGhA"
  },
  {
    id: "swedish-twister",
    title: "Swedish Twister",
    cover: "../games/images/swedish-twister.jpg",
    description: "A no-equipment balance game, like Ninja for your feet. Everyone's feet stay linked in a circle while you take turns stretching to tag someone else's foot. Wobble, fall, or touch the floor and you're out.",
    minPlayers: 4,
    maxPlayers: 15,
    playtimeMin: 5,
    playtimeMax: 15,
    categories: ["Party", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["No Props Needed", "Physical", "Balance", "Player Elimination", "Last One Standing"],
    bggUrl: "",
    howToPlay: {
      goal: "Be the last player still standing.",
      steps: [
        "Stand in a tight circle, shoulder to shoulder, with each foot touching your neighbors' feet.",
        "The first player moves one foot to touch any other player's foot. That player must then move the foot that was touched to tag someone else, and so on.",
        "Once a foot is placed it stays put: no pivoting, sliding, or readjusting. You can lean on each other with your hands for balance.",
        "If you fall, can't reach, or touch the floor with anything but your feet, you're out. Rules vary by group, so agree on house rules first."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=swedish+twister+party+game+feet+circle"
  },
  {
    id: "dtr",
    title: "DTR (Determine the Relationship)",
    cover: "../games/images/dtr.jpg",
    description: "An improv guessing game. Two players leave the room while everyone else comes up with two secret relationships, like teacher and student or cop and speeder. The pair acts out a scene together, each guessing who they're playing and who the other person is.",
    minPlayers: 4,
    maxPlayers: 20,
    playtimeMin: 10,
    playtimeMax: 30,
    categories: ["Party"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Improv", "Roleplay", "Acting", "Guessing", "No Props Needed", "Humor"],
    bggUrl: "",
    howToPlay: {
      goal: "Act out the scene and figure out the relationship: your role and your partner's.",
      steps: [
        "Two players leave the room.",
        "Everyone else comes up with two relationships, like teacher and student, parent and child, or police officer and speeder.",
        "Bring one player back in and tell them both relationships. They pick one and secretly choose which role they'll play.",
        "Bring the second player back. The two act out a scene together, staying in character.",
        "Each player tries to guess the relationship and who the other person is playing. Then swap in a new pair."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=determine+the+relationship+improv+game"
  },
  {
    id: "moessing-bridge",
    title: "Moessing Bridge",
    aka: "Oh H*ll",
    cover: "",
    description: "The family's take on Oh H*ll, a classic trick-taking game with the exact same rules. Every round you bid exactly how many tricks you'll win, and you only score if you nail it. The hand size climbs and falls each round, and the dealer can't let the bids add up to an even split, so somebody always gets burned.",
    minPlayers: 3,
    maxPlayers: 7,
    playtimeMin: 45,
    playtimeMax: 90,
    categories: ["Card Game", "Competitive", "Strategy", "Family"],
    complexity: "medium",
    bggWeight: 1.73,
    tags: ["Classic Deck", "Trick-Taking", "Bidding", "Trump Suit", "Oh H*ll"],
    bggUrl: "https://boardgamegeek.com/boardgame/1115/oh-hell",
    howToPlay: {
      goal: "Score the most points by winning exactly the number of tricks you bid each round.",
      steps: [
        "Use a standard 52-card deck, aces high. Round one deals 1 card each; add a card every round up to the max (or as many as the deck allows), then count back down to 1.",
        "After dealing, flip the next card face up. Its suit is trump for the round. If no cards are left, play the round with no trump.",
        "Starting left of the dealer, each player bids how many tricks they'll take. The dealer bids last and can't make the total bids equal the number of tricks.",
        "The player left of the dealer leads. Follow suit if you can; if you can't, play any card, including a trump. The highest trump wins the trick, or the highest card of the led suit if no trump was played. The winner leads next.",
        "Hit your bid exactly and score 10 plus 1 per trick (common house scoring). Miss by any amount, over or under, and score nothing. Highest total after the last round wins."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+oh+hell+card+game"
  },
  {
    id: "speed",
    title: "Speed",
    cover: "",
    description: "A head-to-head race with a standard deck and zero turns. Both players slam cards onto the two center piles at the same time, one rank higher or lower, and the first to get rid of every card wins. Fast hands beat big brains here.",
    minPlayers: 2,
    maxPlayers: 2,
    playtimeMin: 5,
    playtimeMax: 10,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Classic Deck", "Real-Time", "Speed", "Shedding", "Two Player"],
    bggUrl: "",
    howToPlay: {
      goal: "Be the first to play every one of your cards.",
      steps: [
        "Deal 20 cards to each player: 15 face down as your draw pile, plus 5 in your hand. Put two face-down piles of 5 off to the side and two face-down cards in the center.",
        "Both players flip a center card at the same time, and then it's on. There are no turns.",
        "Play a card from your hand onto either center pile if it's one rank higher or lower than the top card. Aces wrap both ways, so King-Ace-2 works.",
        "Draw from your pile to keep 5 cards in your hand. If neither player can move, both flip a card from the side piles onto the center piles together. When the side piles run out, shuffle the center piles to make new ones.",
        "When your hand and draw pile are empty, you win."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+speed+card+game"
  },
  {
    id: "james-bond",
    title: "James Bond",
    cover: "",
    description: "A chaotic real-time matching game. Everyone races at once, swapping cards with the four in the middle to turn each of their 4-card piles into four of a kind. The catch is you can only hold one pile at a time, so you'd better remember what's in the others.",
    minPlayers: 2,
    maxPlayers: 4,
    playtimeMin: 5,
    playtimeMax: 15,
    categories: ["Card Game", "Competitive", "Family"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Classic Deck", "Real-Time", "Speed", "Set Collection", "Memory"],
    bggUrl: "",
    howToPlay: {
      goal: "Be the first to turn every one of your piles into four of a kind and shout \"James Bond!\"",
      steps: [
        "Deal 4 cards face up in the middle. Split the rest into face-down piles of 4: 6 piles each with 2 players, 4 with 3 players, or 3 with 4 players.",
        "On \"go,\" everyone plays at once. Pick up one of your piles and swap cards with the middle, one for one.",
        "You can only hold one pile at a time. Set it down face down before picking up another.",
        "Once every pile you have is four of a kind, yell \"James Bond!\" and flip them all face up to prove it. If you're wrong, you're out of that round."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+james+bond+card+game"
  },
  {
    id: "kemps",
    title: "Kemps",
    cover: "",
    description: "A team card game built on secret signals. You and your partner agree on a sneaky sign, then everyone races to swap cards for four of a kind. When you've got it, flash the signal so your partner can yell \"Kemps!\" before the other team catches on and calls you out.",
    minPlayers: 4,
    maxPlayers: 8,
    playtimeMin: 15,
    playtimeMax: 30,
    categories: ["Card Game", "Party", "Bluffing", "Competitive"],
    complexity: "easy",
    bggWeight: null,
    tags: ["Classic Deck", "Teams", "Secret Signals", "Real-Time", "Set Collection"],
    bggUrl: "",
    howToPlay: {
      goal: "Signal your partner when you have four of a kind so they can call \"Kemps!\" without the other team catching your signal first.",
      steps: [
        "Split into teams of two, with partners sitting across from each other. Each team picks a secret signal (a wink, a cough, a scratch) away from everyone else.",
        "Deal 4 cards to each player and 4 face up in the middle. On \"go,\" everyone swaps with the middle at once, one card for one, always keeping 4 in hand.",
        "When nobody wants the middle cards, the dealer clears them and deals 4 fresh ones.",
        "Got four of a kind? Give your signal. If your partner sees it, they yell \"Kemps!\" and point at you. If you really have it, your team scores; if not, you lose a point.",
        "If you catch the other team's signal, yell \"Stop Kemps!\" (or \"Counter-Kemps!\") at the player with four of a kind. Call it right and your team scores instead. Play to an agreed score, and fake signals are fair game."
      ]
    },
    howToPlayVideo: "https://www.youtube.com/results?search_query=how+to+play+kemps+card+game"
  }
];
