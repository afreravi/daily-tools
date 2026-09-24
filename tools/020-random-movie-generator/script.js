/* Random Movie Generator — vanilla JS, no build step. */
(function () {
  'use strict';

  /* ---------------- movie pool ----------------
     rating: approximate IMDb-style score (editorial, not live data)
     moods: cozy | dark | funny | thoughtful | romantic | tense | family | epic
  -------------------------------------------- */
  var MOVIES = [
    { t: 'The Apartment', y: 1960, d: 'Billy Wilder', r: 125, s: 8.3, g: ['romance', 'comedy', 'drama'], m: ['cozy', 'romantic', 'funny'], n: 'A clerk lends his flat to executives and loses his own life in the process.' },
    { t: '12 Angry Men', y: 1957, d: 'Sidney Lumet', r: 96, s: 9.0, g: ['drama', 'thriller'], m: ['tense', 'thoughtful'], n: 'One juror refuses to convict, and a room turns itself inside out.' },
    { t: 'Some Like It Hot', y: 1959, d: 'Billy Wilder', r: 121, s: 8.2, g: ['comedy', 'romance'], m: ['funny', 'cozy'], n: 'Two musicians flee the mob in disguise; the last line is immortal.' },
    { t: 'Rear Window', y: 1954, d: 'Alfred Hitchcock', r: 112, s: 8.5, g: ['thriller', 'mystery'], m: ['tense', 'thoughtful'], n: 'A photographer with a broken leg watches his neighbours too closely.' },
    { t: 'Psycho', y: 1960, d: 'Alfred Hitchcock', r: 109, s: 8.5, g: ['horror', 'thriller'], m: ['dark', 'tense'], n: 'The shower scene rewrote what a mainstream film was allowed to do.' },
    { t: 'Lawrence of Arabia', y: 1962, d: 'David Lean', r: 218, s: 8.3, g: ['adventure', 'drama', 'war'], m: ['epic', 'thoughtful'], n: 'A desert campaign filmed so wide you can feel the heat.' },
    { t: 'Dr. Strangelove', y: 1964, d: 'Stanley Kubrick', r: 95, s: 8.4, g: ['comedy', 'war'], m: ['dark', 'funny'], n: 'The funniest film ever made about the end of the world.' },
    { t: 'The Good, the Bad and the Ugly', y: 1966, d: 'Sergio Leone', r: 161, s: 8.8, g: ['western', 'adventure'], m: ['epic', 'tense'], n: 'Three gunslingers, one fortune, and the longest stare in cinema.' },
    { t: 'Bonnie and Clyde', y: 1967, d: 'Arthur Penn', r: 111, s: 7.7, g: ['crime', 'drama', 'romance'], m: ['dark', 'romantic'], n: 'The outlaw couple that made Hollywood admit violence was stylish.' },
    { t: '2001: A Space Odyssey', y: 1968, d: 'Stanley Kubrick', r: 149, s: 8.3, g: ['scifi', 'adventure'], m: ['thoughtful', 'epic'], n: 'A monolith, a computer, and a trip past the edge of explanation.' },
    { t: 'Butch Cassidy and the Sundance Kid', y: 1969, d: 'George Roy Hill', r: 110, s: 8.0, g: ['western', 'comedy', 'crime'], m: ['cozy', 'funny'], n: 'Two outlaws outrun the inevitable with excellent banter.' },
    { t: 'The Godfather', y: 1972, d: 'Francis Ford Coppola', r: 175, s: 9.2, g: ['crime', 'drama'], m: ['dark', 'epic'], n: 'A family business story where the business is power.' },
    { t: 'Chinatown', y: 1974, d: 'Roman Polanski', r: 130, s: 8.2, g: ['mystery', 'drama', 'crime'], m: ['dark', 'tense'], n: 'Water rights, Los Angeles, and a detective who learns too much.' },
    { t: 'The Godfather Part II', y: 1974, d: 'Francis Ford Coppola', r: 202, s: 9.0, g: ['crime', 'drama'], m: ['dark', 'epic'], n: 'Two timelines, one inheritance, no redemption.' },
    { t: 'Jaws', y: 1975, d: 'Steven Spielberg', r: 124, s: 8.1, g: ['thriller', 'adventure'], m: ['tense', 'epic'], n: 'The mechanical shark broke, so the suspense had to carry the film.' },
    { t: 'Taxi Driver', y: 1976, d: 'Martin Scorsese', r: 114, s: 8.2, g: ['crime', 'drama'], m: ['dark', 'thoughtful'], n: 'A veteran drives nights in a city that will not answer him.' },
    { t: 'Annie Hall', y: 1977, d: 'Woody Allen', r: 93, s: 8.0, g: ['romance', 'comedy'], m: ['funny', 'romantic', 'thoughtful'], n: 'A relationship told as a set of jokes that land too accurately.' },
    { t: 'Alien', y: 1979, d: 'Ridley Scott', r: 117, s: 8.5, g: ['horror', 'scifi'], m: ['tense', 'dark'], n: 'A crew, a ship, and something that is never quite fully seen.' },
    { t: 'Apocalypse Now', y: 1979, d: 'Francis Ford Coppola', r: 147, s: 8.4, g: ['war', 'drama'], m: ['dark', 'epic'], n: 'A river journey into a war that has stopped making sense.' },
    { t: 'The Empire Strikes Back', y: 1980, d: 'Irvin Kershner', r: 124, s: 8.7, g: ['scifi', 'adventure', 'action'], m: ['epic', 'family'], n: 'The sequel that gave the trilogy its gravity.' },
    { t: 'Raiders of the Lost Ark', y: 1981, d: 'Steven Spielberg', r: 115, s: 8.4, g: ['adventure', 'action'], m: ['epic', 'family'], n: 'The template every adventure film has been measured against since.' },
    { t: 'Blade Runner', y: 1982, d: 'Ridley Scott', r: 117, s: 8.1, g: ['scifi', 'mystery'], m: ['dark', 'thoughtful'], n: 'Rain, neon, and a question about what counts as alive.' },
    { t: 'E.T. the Extra-Terrestrial', y: 1982, d: 'Steven Spielberg', r: 115, s: 7.9, g: ['scifi', 'family', 'adventure'], m: ['family', 'cozy'], n: 'A suburban childhood rendered at exactly the right height.' },
    { t: 'The Thing', y: 1982, d: 'John Carpenter', r: 109, s: 8.2, g: ['horror', 'scifi'], m: ['tense', 'dark'], n: 'Paranoia in an Antarctic station, with practical effects that still hold.' },
    { t: 'Back to the Future', y: 1985, d: 'Robert Zemeckis', r: 116, s: 8.5, g: ['scifi', 'comedy', 'adventure'], m: ['funny', 'family'], n: 'Time travel as a family comedy, engineered almost perfectly.' },
    { t: 'Aliens', y: 1986, d: 'James Cameron', r: 137, s: 8.4, g: ['scifi', 'action', 'horror'], m: ['tense', 'epic'], n: 'The sequel that trades dread for firepower and somehow works.' },
    { t: 'Die Hard', y: 1988, d: 'John McTiernan', r: 132, s: 8.2, g: ['action', 'thriller'], m: ['tense', 'funny'], n: 'One building, one barefoot cop, one very good Christmas party.' },
    { t: 'Cinema Paradiso', y: 1988, d: 'Giuseppe Tornatore', r: 155, s: 8.5, g: ['drama', 'romance'], m: ['cozy', 'romantic', 'thoughtful'], n: 'A village cinema and the boy who loved it more than anything.' },
    { t: 'Do the Right Thing', y: 1989, d: 'Spike Lee', r: 120, s: 8.0, g: ['drama', 'comedy'], m: ['thoughtful', 'tense'], n: 'One hot day on one block, and everything that breaks.' },
    { t: 'Goodfellas', y: 1990, d: 'Martin Scorsese', r: 145, s: 8.7, g: ['crime', 'drama'], m: ['dark', 'tense'], n: 'Mob life as a rush that curdles, told at a relentless pace.' },
    { t: 'Terminator 2: Judgment Day', y: 1991, d: 'James Cameron', r: 137, s: 8.6, g: ['action', 'scifi'], m: ['tense', 'epic'], n: 'The blockbuster that made computer effects a storytelling tool.' },
    { t: 'Groundhog Day', y: 1993, d: 'Harold Ramis', r: 101, s: 8.1, g: ['comedy', 'romance'], m: ['funny', 'thoughtful', 'cozy'], n: 'A comedy about repetition that quietly becomes about becoming decent.' },
    { t: 'Schindler\u2019s List', y: 1993, d: 'Steven Spielberg', r: 195, s: 9.0, g: ['drama', 'war'], m: ['dark', 'thoughtful'], n: 'A history film made with deliberate, unshowy restraint.' },
    { t: 'The Shawshank Redemption', y: 1994, d: 'Frank Darabont', r: 142, s: 9.3, g: ['drama', 'crime'], m: ['thoughtful', 'cozy'], n: 'Friendship and patience inside a system designed to remove both.' },
    { t: 'Pulp Fiction', y: 1994, d: 'Quentin Tarantino', r: 154, s: 8.9, g: ['crime', 'drama'], m: ['dark', 'funny'], n: 'Structure as a punchline, dialogue as the main attraction.' },
    { t: 'Heat', y: 1995, d: 'Michael Mann', r: 170, s: 8.3, g: ['crime', 'thriller', 'action'], m: ['tense', 'dark'], n: 'A cop and a thief who understand each other better than their own lives.' },
    { t: 'Toy Story', y: 1995, d: 'John Lasseter', r: 81, s: 8.3, g: ['animation', 'family', 'comedy'], m: ['family', 'funny', 'cozy'], n: 'The first fully computer-animated feature, and still a great script.' },
    { t: 'Fargo', y: 1996, d: 'Joel Coen', r: 98, s: 8.1, g: ['crime', 'comedy', 'drama'], m: ['dark', 'funny'], n: 'Snow, a wood chipper, and the politest criminals in America.' },
    { t: 'Good Will Hunting', y: 1997, d: 'Gus Van Sant', r: 126, s: 8.3, g: ['drama', 'romance'], m: ['thoughtful', 'romantic'], n: 'A genius who has to decide whether talent obliges him to anything.' },
    { t: 'The Truman Show', y: 1998, d: 'Peter Weir', r: 103, s: 8.2, g: ['drama', 'comedy', 'scifi'], m: ['thoughtful', 'funny'], n: 'A life as a television set, and the cost of stepping off it.' },
    { t: 'Saving Private Ryan', y: 1998, d: 'Steven Spielberg', r: 169, s: 8.6, g: ['war', 'drama'], m: ['tense', 'epic'], n: 'The beach landing reset what a war film could show.' },
    { t: 'The Matrix', y: 1999, d: 'The Wachowskis', r: 136, s: 8.7, g: ['scifi', 'action'], m: ['epic', 'tense'], n: 'A philosophy lecture wearing a leather coat and moving very fast.' },
    { t: 'Fight Club', y: 1999, d: 'David Fincher', r: 139, s: 8.8, g: ['drama', 'thriller'], m: ['dark', 'thoughtful'], n: 'A provocation about consumerism that refuses to resolve cleanly.' },
    { t: 'Am\u00e9lie', y: 2001, d: 'Jean-Pierre Jeunet', r: 122, s: 8.3, g: ['romance', 'comedy'], m: ['cozy', 'romantic', 'funny'], n: 'Montmartre rendered in green and gold, with a very shy heroine.' },
    { t: 'The Lord of the Rings: The Fellowship of the Ring', y: 2001, d: 'Peter Jackson', r: 178, s: 8.9, g: ['fantasy', 'adventure'], m: ['epic', 'family'], n: 'The adaptation that proved fantasy could carry real weight.' },
    { t: 'Spirited Away', y: 2001, d: 'Hayao Miyazaki', r: 125, s: 8.6, g: ['animation', 'fantasy', 'adventure'], m: ['family', 'thoughtful', 'epic'], n: 'A bathhouse for spirits and a girl who has to work to get home.' },
    { t: 'City of God', y: 2002, d: 'Fernando Meirelles', r: 130, s: 8.6, g: ['crime', 'drama'], m: ['dark', 'tense'], n: 'A neighbourhood chronicle told with dizzying, deliberate energy.' },
    { t: 'Lost in Translation', y: 2003, d: 'Sofia Coppola', r: 102, s: 7.7, g: ['drama', 'romance', 'comedy'], m: ['thoughtful', 'cozy'], n: 'Two insomniacs in Tokyo and a friendship that stays undefined.' },
    { t: 'Eternal Sunshine of the Spotless Mind', y: 2004, d: 'Michel Gondry', r: 108, s: 8.3, g: ['romance', 'scifi', 'drama'], m: ['romantic', 'thoughtful'], n: 'A breakup told backwards through the memory being erased.' },
    { t: 'The Incredibles', y: 2004, d: 'Brad Bird', r: 115, s: 8.0, g: ['animation', 'action', 'family'], m: ['family', 'funny', 'epic'], n: 'A superhero family comedy with unusually sharp writing.' },
    { t: 'Pan\u2019s Labyrinth', y: 2006, d: 'Guillermo del Toro', r: 118, s: 8.2, g: ['fantasy', 'drama', 'war'], m: ['dark', 'thoughtful'], n: 'A fairy tale that refuses to soften the world around it.' },
    { t: 'The Departed', y: 2006, d: 'Martin Scorsese', r: 151, s: 8.5, g: ['crime', 'thriller', 'drama'], m: ['tense', 'dark'], n: 'Two men undercover on opposite sides, racing to unmask each other.' },
    { t: 'No Country for Old Men', y: 2007, d: 'Joel and Ethan Coen', r: 122, s: 8.2, g: ['thriller', 'crime', 'drama'], m: ['tense', 'dark'], n: 'A chase film with almost no music and no wasted frame.' },
    { t: 'There Will Be Blood', y: 2007, d: 'Paul Thomas Anderson', r: 158, s: 8.2, g: ['drama', 'western'], m: ['dark', 'epic'], n: 'An oilman builds an empire and hollows himself out doing it.' },
    { t: 'WALL-E', y: 2008, d: 'Andrew Stanton', r: 98, s: 8.4, g: ['animation', 'scifi', 'family'], m: ['family', 'romantic', 'thoughtful'], n: 'A silent robot romance carrying an environmental warning.' },
    { t: 'Up', y: 2009, d: 'Pete Docter', r: 96, s: 8.3, g: ['animation', 'adventure', 'family'], m: ['family', 'cozy', 'thoughtful'], n: 'The first ten minutes are a short film worth the ticket alone.' },
    { t: 'Inception', y: 2010, d: 'Christopher Nolan', r: 148, s: 8.8, g: ['scifi', 'action', 'thriller'], m: ['tense', 'epic', 'thoughtful'], n: 'A heist conducted inside layers of sleep.' },
    { t: 'The Social Network', y: 2010, d: 'David Fincher', r: 120, s: 7.8, g: ['drama'], m: ['thoughtful', 'dark'], n: 'A founding story told through two depositions and no heroes.' },
    { t: 'Drive', y: 2011, d: 'Nicolas Winding Refn', r: 100, s: 7.8, g: ['crime', 'thriller', 'action'], m: ['dark', 'tense'], n: 'Neon, synth, and a very quiet man who is not quiet for long.' },
    { t: 'The Grand Budapest Hotel', y: 2014, d: 'Wes Anderson', r: 99, s: 8.1, g: ['comedy', 'drama', 'adventure'], m: ['funny', 'cozy'], n: 'A concierge, a painting, and a perfectly symmetrical chase.' },
    { t: 'Whiplash', y: 2014, d: 'Damien Chazelle', r: 106, s: 8.5, g: ['drama', 'music'], m: ['tense', 'thoughtful'], n: 'A drumming student and a teacher who mistakes cruelty for rigour.' },
    { t: 'Mad Max: Fury Road', y: 2015, d: 'George Miller', r: 120, s: 8.1, g: ['action', 'adventure', 'scifi'], m: ['epic', 'tense'], n: 'Two hours of chase choreography with almost no dialogue wasted.' },
    { t: 'Arrival', y: 2016, d: 'Denis Villeneuve', r: 116, s: 7.9, g: ['scifi', 'drama', 'mystery'], m: ['thoughtful', 'epic'], n: 'First contact as a problem of language and grief.' },
    { t: 'Moonlight', y: 2016, d: 'Barry Jenkins', r: 111, s: 7.4, g: ['drama'], m: ['thoughtful', 'romantic'], n: 'Three chapters in one life, told with unusual tenderness.' },
    { t: 'Get Out', y: 2017, d: 'Jordan Peele', r: 104, s: 7.8, g: ['horror', 'thriller', 'comedy'], m: ['tense', 'dark', 'funny'], n: 'Social horror with a premise that keeps tightening.' },
    { t: 'Lady Bird', y: 2017, d: 'Greta Gerwig', r: 94, s: 7.4, g: ['comedy', 'drama'], m: ['funny', 'cozy', 'thoughtful'], n: 'A senior year and a mother, both drawn with real affection.' },
    { t: 'Spider-Man: Into the Spider-Verse', y: 2018, d: 'Bob Persichetti', r: 117, s: 8.4, g: ['animation', 'action', 'adventure'], m: ['family', 'funny', 'epic'], n: 'Animation treated as a visual language rather than a compromise.' },
    { t: 'Parasite', y: 2019, d: 'Bong Joon-ho', r: 132, s: 8.5, g: ['thriller', 'drama', 'comedy'], m: ['dark', 'funny', 'tense'], n: 'A class satire that changes genre halfway and never slips.' },
    { t: 'Knives Out', y: 2019, d: 'Rian Johnson', r: 130, s: 7.9, g: ['mystery', 'comedy', 'crime'], m: ['funny', 'cozy'], n: 'A whodunit with a cast that is clearly enjoying itself.' },
    { t: 'Little Women', y: 2019, d: 'Greta Gerwig', r: 135, s: 7.8, g: ['drama', 'romance'], m: ['cozy', 'romantic', 'thoughtful'], n: 'A familiar novel restructured around ambition and money.' },
    { t: 'Soul', y: 2020, d: 'Pete Docter', r: 100, s: 8.0, g: ['animation', 'family', 'comedy'], m: ['family', 'thoughtful', 'cozy'], n: 'A jazz pianist asks what a life is actually for.' },
    { t: 'Dune', y: 2021, d: 'Denis Villeneuve', r: 155, s: 8.0, g: ['scifi', 'adventure', 'drama'], m: ['epic', 'tense'], n: 'Desert scale, political machinery, and a score you feel in the floor.' },
    { t: 'Everything Everywhere All at Once', y: 2022, d: 'Daniels', r: 139, s: 7.8, g: ['scifi', 'comedy', 'action'], m: ['funny', 'thoughtful', 'family'], n: 'Multiverse chaos used to talk about a mother and a daughter.' },
    { t: 'Top Gun: Maverick', y: 2022, d: 'Joseph Kosinski', r: 130, s: 8.2, g: ['action', 'drama'], m: ['epic', 'tense'], n: 'Practical flight photography that makes the stakes physical.' },
    { t: 'Past Lives', y: 2023, d: 'Celine Song', r: 105, s: 7.8, g: ['romance', 'drama'], m: ['romantic', 'thoughtful', 'cozy'], n: 'Two childhood friends and the life that did not happen.' },
    { t: 'Oppenheimer', y: 2023, d: 'Christopher Nolan', r: 180, s: 8.3, g: ['drama', 'history'], m: ['dark', 'epic', 'thoughtful'], n: 'A biography built like a thriller about consequence.' },
    { t: 'The Holdovers', y: 2023, d: 'Alexander Payne', r: 133, s: 7.9, g: ['comedy', 'drama'], m: ['cozy', 'funny', 'thoughtful'], n: 'Three people stuck at a boarding school over the holidays.' },
    { t: 'Anatomy of a Fall', y: 2023, d: 'Justine Triet', r: 151, s: 7.7, g: ['drama', 'mystery', 'thriller'], m: ['tense', 'thoughtful'], n: 'A death, a marriage, and a trial that cannot settle either.' },
    { t: 'Godzilla Minus One', y: 2023, d: 'Takashi Yamazaki', r: 125, s: 7.7, g: ['scifi', 'action', 'drama'], m: ['epic', 'tense'], n: 'A monster film with a postwar survivor story underneath it.' },
    { t: 'Dune: Part Two', y: 2024, d: 'Denis Villeneuve', r: 166, s: 8.5, g: ['scifi', 'adventure', 'drama'], m: ['epic', 'tense'], n: 'The prophecy arrives, and it is not good news.' },
    { t: 'Casablanca', y: 1942, d: 'Michael Curtiz', r: 102, s: 8.5, g: ['romance', 'drama', 'war'], m: ['romantic', 'cozy', 'thoughtful'], n: 'A nightclub, an old flame, and a choice made for the right reason.' },
    { t: 'Seven Samurai', y: 1954, d: 'Akira Kurosawa', r: 207, s: 8.6, g: ['action', 'adventure', 'drama'], m: ['epic', 'thoughtful'], n: 'A village hires protectors, and the template for the team-up film is born.' },
    { t: 'The Ten Commandments', y: 1956, d: 'Cecil B. DeMille', r: 220, s: 7.9, g: ['adventure', 'drama', 'history'], m: ['epic', 'family'], n: 'The last great studio spectacle, and it behaves like one.' },
    { t: 'Ben-Hur', y: 1959, d: 'William Wyler', r: 212, s: 8.1, g: ['adventure', 'drama', 'history'], m: ['epic'], n: 'A chariot race that still sets the bar for practical staging.' },
    { t: 'Gladiator', y: 2000, d: 'Ridley Scott', r: 155, s: 8.5, g: ['action', 'adventure', 'drama', 'history'], m: ['epic', 'tense'], n: 'A revenge story that revived the sword-and-sandal epic.' },
    { t: 'The Imitation Game', y: 2014, d: 'Morten Tyldum', r: 114, s: 8.0, g: ['drama', 'history', 'thriller'], m: ['thoughtful', 'tense'], n: 'Codebreaking as a race against time and a study of isolation.' },
    { t: 'La La Land', y: 2016, d: 'Damien Chazelle', r: 128, s: 8.0, g: ['romance', 'drama', 'music', 'comedy'], m: ['romantic', 'cozy', 'thoughtful'], n: 'A musical about ambition, and about what it costs to keep both dreams.' }
  ];

  var GENRES = ['action', 'adventure', 'animation', 'comedy', 'crime', 'drama', 'family', 'fantasy', 'history', 'horror', 'music', 'mystery', 'romance', 'scifi', 'thriller', 'war', 'western'];
  var GENRE_LABEL = { scifi: 'Sci-fi' };

  var ERA_RANGE = {
    classic: [1940, 1959],
    newhollywood: [1960, 1979],
    eighties: [1980, 1999],
    modern: [2000, 2009],
    recent: [2010, 2019],
    current: [2020, 2100]
  };

  var STORE_SEEN = 'rmg_seen_v1';
  var STORE_WATCH = 'rmg_watchlist_v1';

  var $ = function (id) { return document.getElementById(id); };

  /* ---------- storage (guarded: file:// and private mode can throw) ---------- */
  function load(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }
  function save(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }

  var seen = load(STORE_SEEN, []);
  var watchlist = load(STORE_WATCH, []);
  if (!Array.isArray(seen)) seen = [];
  if (!Array.isArray(watchlist)) watchlist = [];

  var current = null;
  var lastTitle = null;

  function key(m) { return m.t + '|' + m.y; }

  function prettyGenre(g) { return GENRE_LABEL[g] || g; }

  /* ---------- build genre dropdown ---------- */
  (function buildGenres() {
    var sel = $('genre');
    GENRES.forEach(function (g) {
      var o = document.createElement('option');
      o.value = g;
      o.textContent = prettyGenre(g).charAt(0).toUpperCase() + prettyGenre(g).slice(1);
      sel.appendChild(o);
    });
  })();

  /* ---------- filtering ---------- */
  function getFilters() {
    return {
      genre: $('genre').value,
      era: $('era').value,
      mood: $('mood').value,
      minRating: parseFloat($('minRating').value),
      maxRuntime: parseInt($('maxRuntime').value, 10)
    };
  }

  function matches(m, f, includeSeen) {
    if (f.genre !== 'any' && m.g.indexOf(f.genre) === -1) return false;
    if (f.mood !== 'any' && m.m.indexOf(f.mood) === -1) return false;
    if (f.era !== 'any') {
      var band = ERA_RANGE[f.era];
      if (!band || m.y < band[0] || m.y > band[1]) return false;
    }
    if (isFinite(f.minRating) && m.s < f.minRating) return false;
    if (isFinite(f.maxRuntime) && m.r > f.maxRuntime) return false;
    if (!includeSeen && seen.indexOf(key(m)) !== -1) return false;
    return true;
  }

  function poolFor(f, includeSeen) {
    return MOVIES.filter(function (m) { return matches(m, f, includeSeen); });
  }

  /* ---------- chart (hand-rolled canvas bar chart) ---------- */
  function drawChart() {
    var canvas = $('poolChart');
    var ctx = canvas.getContext('2d');
    var f = getFilters();
    var pool = poolFor(f, false);
    var counts = {};
    pool.forEach(function (m) {
      m.g.forEach(function (g) {
        if (f.genre !== 'any' && g !== f.genre) return;
        counts[g] = (counts[g] || 0) + 1;
      });
    });

    var entries = Object.keys(counts).map(function (g) {
      return { label: prettyGenre(g), value: counts[g] };
    }).sort(function (a, b) { return b.value - a.value; }).slice(0, 8);

    var W = canvas.width, H = canvas.height;
    var padL = 92, padR = 16, padT = 16, padB = 34;
    ctx.clearRect(0, 0, W, H);

    if (!entries.length) {
      ctx.fillStyle = '#6a6773';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No titles match these filters.', W / 2, H / 2);
      $('chartCaption').textContent = 'Adjust a filter to repopulate the chart.';
      return;
    }

    var max = Math.max.apply(null, entries.map(function (e) { return e.value; }));
    var rowH = (H - padT - padB) / entries.length;
    var barH = Math.min(20, rowH * 0.6);
    var usableW = W - padL - padR;

    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'middle';

    entries.forEach(function (e, i) {
      var y = padT + i * rowH + rowH / 2;
      var w = Math.max(3, (e.value / max) * usableW);

      ctx.fillStyle = '#e6d6f6';
      ctx.fillRect(padL, y - barH / 2, usableW, barH);

      var grad = ctx.createLinearGradient(padL, 0, padL + w, 0);
      grad.addColorStop(0, '#8a2fc4');
      grad.addColorStop(1, '#60089c');
      ctx.fillStyle = grad;
      ctx.fillRect(padL, y - barH / 2, w, barH);

      ctx.fillStyle = '#23212a';
      ctx.textAlign = 'right';
      ctx.fillText(e.label, padL - 10, y);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#45046f';
      ctx.fillText(String(e.value), padL + w + 6, y);
    });

    ctx.strokeStyle = '#e6dff0';
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, H - padB);
    ctx.stroke();

    $('chartCaption').textContent = entries.length + ' genre' + (entries.length === 1 ? '' : 's') +
      ' shown across ' + pool.length + ' title' + (pool.length === 1 ? '' : 's') + '.';
  }

  /* ---------- rendering ---------- */
  function updatePoolLine() {
    var f = getFilters();
    var pool = poolFor(f, false);
    var total = poolFor(f, true).length;
    var line = $('poolLine');
    var err = $('filterError');

    if (pool.length === 0) {
      line.textContent = '';
      if (total > 0) {
        err.textContent = 'Every matching title is already marked as seen. Reset the seen list or relax a filter.';
      } else {
        err.textContent = 'No films match this combination. Try lowering the minimum rating or raising the runtime ceiling.';
      }
      err.classList.remove('d-none');
    } else {
      err.classList.add('d-none');
      err.textContent = '';
      line.textContent = pool.length + ' title' + (pool.length === 1 ? '' : 's') +
        ' in the pool' + (seen.length ? ' (seen titles excluded)' : '') + '.';
    }
    $('resetSeen').classList.toggle('d-none', seen.length === 0);
    drawChart();
  }

  function renderResult(m, f) {
    $('resTitle').textContent = m.t;
    $('resGenre').textContent = m.g.slice(0, 2).map(prettyGenre).join(' / ');
    $('resMeta').textContent = m.y + ' \u00b7 dir. ' + m.d + ' \u00b7 ' + m.r + ' min \u00b7 ' +
      m.g.map(prettyGenre).join(', ');
    $('resScore').textContent = m.s.toFixed(1);
    $('resNote').textContent = m.n;

    var reasons = [];
    if (f.genre !== 'any') reasons.push('it is a ' + prettyGenre(f.genre) + ' film');
    if (f.mood !== 'any') reasons.push('it fits the "' + f.mood + '" mood');
    if (f.era !== 'any') reasons.push('it sits in the ' + $('era').selectedOptions[0].textContent + ' band');
    reasons.push('it runs ' + m.r + ' minutes, inside your ' + f.maxRuntime + '-minute ceiling');
    reasons.push('its ' + m.s.toFixed(1) + ' score clears your ' + f.minRating.toFixed(1) + ' floor');

    $('resWhy').textContent = 'Picked because ' + reasons.join(', ') + '.';
    $('resultCard').classList.remove('d-none');
    if ($('seenBtn').textContent !== 'Already seen it \u2014 hide it') {
      $('seenBtn').textContent = 'Already seen it \u2014 hide it';
    }
    $('resultCard').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderWatchlist() {
    var ul = $('watchList');
    ul.innerHTML = '';
    if (!watchlist.length) {
      var li = document.createElement('li');
      li.className = 'list-group-item text-muted small px-0';
      li.textContent = 'Nothing saved yet. Spin, then add a pick to build your watchlist.';
      ul.appendChild(li);
      $('clearWatch').classList.add('d-none');
      return;
    }
    watchlist.forEach(function (m, i) {
      var li = document.createElement('li');
      li.className = 'list-group-item px-0 d-flex justify-content-between align-items-start';

      var left = document.createElement('div');
      var title = document.createElement('div');
      title.className = 'wl-title';
      title.textContent = m.t;
      var meta = document.createElement('div');
      meta.className = 'wl-meta';
      meta.textContent = m.y + ' \u00b7 ' + m.r + ' min \u00b7 ' + m.s.toFixed(1);
      left.appendChild(title);
      left.appendChild(meta);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wl-remove';
      btn.textContent = 'remove';
      btn.setAttribute('aria-label', 'Remove ' + m.t + ' from watchlist');
      btn.addEventListener('click', function () {
        watchlist.splice(i, 1);
        save(STORE_WATCH, watchlist);
        renderWatchlist();
      });

      li.appendChild(left);
      li.appendChild(btn);
      ul.appendChild(li);
    });
    $('clearWatch').classList.remove('d-none');
  }

  /* ---------- actions ---------- */
  function spin() {
    var f = getFilters();
    var pool = poolFor(f, false);
    if (!pool.length) {
      updatePoolLine();
      $('resultCard').classList.add('d-none');
      return;
    }
    var pick;
    if (pool.length > 1) {
      do {
        pick = pool[Math.floor(Math.random() * pool.length)];
      } while (key(pick) === lastTitle);
    } else {
      pick = pool[0];
    }
    lastTitle = key(pick);
    current = pick;
    renderResult(pick, f);
  }

  $('spinBtn').addEventListener('click', spin);

  $('againBtn').addEventListener('click', function () {
    spin();
  });

  $('watchBtn').addEventListener('click', function () {
    if (!current) return;
    var k = key(current);
    var exists = watchlist.some(function (m) { return key(m) === k; });
    if (exists) {
      $('watchBtn').textContent = 'Already on your watchlist';
      return;
    }
    watchlist.push(current);
    save(STORE_WATCH, watchlist);
    renderWatchlist();
    $('watchBtn').textContent = 'Added \u2713';
    window.setTimeout(function () { $('watchBtn').textContent = 'Add to watchlist'; }, 1600);
  });

  $('seenBtn').addEventListener('click', function () {
    if (!current) return;
    var k = key(current);
    if (seen.indexOf(k) === -1) seen.push(k);
    save(STORE_SEEN, seen);
    updatePoolLine();
    spin();
  });

  $('clearWatch').addEventListener('click', function () {
    watchlist = [];
    save(STORE_WATCH, watchlist);
    renderWatchlist();
  });

  $('resetSeen').addEventListener('click', function () {
    seen = [];
    save(STORE_SEEN, seen);
    updatePoolLine();
  });

  /* ---------- slider readouts + live pool updates ---------- */
  ['minRating', 'maxRuntime'].forEach(function (id) {
    var el = $(id);
    el.addEventListener('input', function () {
      if (id === 'minRating') $('minRatingOut').textContent = parseFloat(el.value).toFixed(1);
      if (id === 'maxRuntime') $('maxRuntimeOut').textContent = el.value + ' min';
      updatePoolLine();
    });
  });

  ['genre', 'era', 'mood'].forEach(function (id) {
    $(id).addEventListener('change', updatePoolLine);
  });

  /* keyboard shortcut: space spins when the form is not focused */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === ' ' && tag !== 'input' && tag !== 'select' && tag !== 'textarea' && tag !== 'button') {
      e.preventDefault();
      spin();
    }
  });

  renderWatchlist();
  updatePoolLine();
})();
