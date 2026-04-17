const Filter = require('bad-words');
const filter = new Filter();

const text = "Fuck clg , idk what’s going on in my clg I hate it , all the people follow old ass traditional learning when the world is moving forward and there nee approaches why do we have to waste time in redoing reports like clowns fuck";

console.log("Is text profane?", filter.isProfane(text));
