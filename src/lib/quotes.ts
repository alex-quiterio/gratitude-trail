export const GRATITUDE_QUOTES = [
  {
    text: "This is a wonderful day. I've never seen this one before.",
    author: "Maya Angelou",
  },
  {
    text: "Think of all the beauty still left around you and be happy.",
    author: "Anne Frank",
  },
  {
    text: "Instructions for living a life: Pay attention. Be astonished. Tell about it.",
    author: "Mary Oliver",
  },
  {
    text: "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.",
    author: "Helen Keller",
  },
  {
    text: "Attention is the rarest and purest form of generosity.",
    author: "Simone Weil",
  },
  {
    text: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.",
    author: "Melody Beattie",
  },
  {
    text: "What separates privilege from entitlement is gratitude.",
    author: "Brené Brown",
  },
  {
    text: "Piglet noticed that even though he had a very small heart, it could hold a rather large amount of gratitude.",
    author: "A.A. Milne",
  },
  {
    text: "Joy is the simplest form of gratitude.",
    author: "Karl Barth",
  },
  {
    text: "At times, our own light goes out and is rekindled by a spark from another person.",
    author: "Albert Schweitzer",
  },
  {
    text: "Let us be grateful to people who make us happy; they are the charming gardeners who make our souls blossom.",
    author: "Marcel Proust",
  },
  {
    text: "Gratitude is the memory of the heart.",
    author: "Jean-Baptiste Massieu",
  },
  {
    text: "We can only be said to be alive in those moments when our hearts are conscious of our treasures.",
    author: "Thornton Wilder",
  },
  {
    text: "Wear gratitude like a cloak and it will feed every corner of your life.",
    author: "Rumi",
  },
  {
    text: "The present moment is the only moment available to us, and it is the door to all moments.",
    author: "Thich Nhat Hanh",
  },
  {
    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
    author: "Thich Nhat Hanh",
  },
  {
    text: "The most precious gift we can offer anyone is our attention.",
    author: "Thich Nhat Hanh",
  },
];

export function pickQuote(seed: number): (typeof GRATITUDE_QUOTES)[number] {
  return GRATITUDE_QUOTES[seed % GRATITUDE_QUOTES.length];
}
