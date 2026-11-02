export type Question = {
  text: string;
  options: string[];
  correct: number;
  note?: string;
};

export const SESSION_CODE = "011126";

export const QUESTIONS: Question[] = [
  {
    text: "When was the GNOME project officially founded?",
    options: ["1991", "1997", "2001", "2005"],
    correct: 1,
    note: "Announced by Miguel de Icaza and Federico Mena Quintero on August 15, 1997.",
  },
  {
    text: 'What did the acronym "GNOME" originally stand for?',
    options: [
      "GNU Network Object Model Environment",
      "Graphical Network Operating Master Engine",
      "GNU Next-generation Open Media Ecosystem",
      "General Networked Object Management System",
    ],
    correct: 0,
  },
  {
    text: "Which iconic logo element is historically associated with GNOME?",
    options: [
      "A chameleon foot",
      "A penguin footprint",
      "A human foot",
      "A gear wheel",
    ],
    correct: 2,
  },
  {
    text: "Which GTK library version marked the shift toward responsive, modern GNOME apps using Libadwaita?",
    options: ["GTK+ 1.0", "GTK 2", "GTK 3", "GTK 4"],
    correct: 3,
  },
  {
    text: "In which Asian city was the very first GNOME.Asia Summit held in 2008?",
    options: ["Beijing, China", "Taipei, Taiwan", "Tokyo, Japan", "Seoul, South Korea"],
    correct: 0,
    note: "Held at Beihang University.",
  },
  {
    text: "What is the official default web browser of the GNOME desktop environment?",
    options: ["Firefox", "Epiphany (also known as Web)", "Chromium", "Midori"],
    correct: 1,
  },
  {
    text: "Which programming language was specifically created for the GNOME platform to bring C-like performance with modern object-oriented features?",
    options: ["Rust", "Vala", "Go", "Swift"],
    correct: 1,
  },
  {
    text: "What is the name of the official file manager in the GNOME desktop?",
    options: ["Dolphin", "Thunar", "Files (Nautilus)", "PCManFM"],
    correct: 2,
  },
  {
    text: "Which GNOME event program helps onboard new contributors, especially underrepresented groups in tech, to work on open-source projects with paid internships?",
    options: ["Google Summer of Code", "Outreachy", "Hacktoberfest", "Season of Docs"],
    correct: 1,
    note: "Co-founded by GNOME contributors.",
  },
  {
    text: "What major architectural update replaced X11 as the default display server protocol in GNOME starting with GNOME 3.22?",
    options: ["Wayland", "Mir", "Xwayland", "Vulkan"],
    correct: 0,
  },
  {
    text: "In which year did Linus Torvalds first announce Linux?",
    options: ["1989", "1990", "1991", "1992"],
    correct: 2,
    note: "Announced on the comp.os.minix newsgroup.",
  },
  {
    text: "Who launched the GNU Project in 1983?",
    options: ["Linus Torvalds", "Eric S. Raymond", "Richard Stallman", "Ian Murdock"],
    correct: 2,
  },
  {
    text: 'What does the name "GNU" stand for?',
    options: ["General Network Utilities", "Global Native Unix", "Great New Unix", "GNU's Not Unix"],
    correct: 3,
    note: "It's a recursive acronym.",
  },
  {
    text: 'What does "GPL" stand for?',
    options: [
      "General Public License",
      "Global Programming License",
      "GNU Project Library",
      "General Purpose Linux",
    ],
    correct: 0,
  },
  {
    text: 'In which year was the term "open source" adopted for software?',
    options: ["1985", "1991", "1998", "2005"],
    correct: 2,
    note: "Suggested by Christine Peterson, following Netscape's decision to release its browser source code.",
  },
  {
    text: "Which organization maintains the Open Source Definition and approves open source licenses?",
    options: ["W3C", "Open Source Initiative (OSI)", "IETF", "ISO"],
    correct: 1,
  },
  {
    text: "Git was created in 2005 after the Linux kernel project lost free use of which tool?",
    options: ["Subversion", "CVS", "Mercurial", "BitKeeper"],
    correct: 3,
  },
  {
    text: "What is the name of the Linux penguin mascot?",
    options: ["Tux", "Beastie", "Wilber", "Konqi"],
    correct: 0,
    note: "The others belong to BSD, GIMP and KDE.",
  },
  {
    text: "Which company acquired Red Hat in 2019?",
    options: ["Microsoft", "Oracle", "IBM", "Google"],
    correct: 2,
  },
  {
    text: "BlankOn, the Indonesian Linux distribution, is based on which distribution today?",
    options: ["Fedora", "Debian", "Arch Linux", "openSUSE"],
    correct: 1,
    note: "BlankOn follows Debian unstable (Sid).",
  },
  {
    text: "How many states are in Malaysia?",
    options: ["13", "1", "5", "8"],
    correct: 0,
  },
  {
    text: "What is the capital of Malaysia?",
    options: ["Kuala Terengganu", "London", "Jakarta", "Kuala Lumpur"],
    correct: 3,
  },
  {
    text: "What is the capital of the state of Terengganu?",
    options: ["Kuala Lumpur", "Kuala Terengganu", "Terengganu City", "Manchester"],
    correct: 1,
  },
  {
    text: "What is the mascot of the state of Terengganu?",
    options: ["Turtle", "Frog", "Giraffe", "T-rex"],
    correct: 0,
  },
  {
    text: "What is the national drink of Malaysia?",
    options: ["Coca Cola", "Strawberry Matcha Latte", "Caramel Macchiato", "Teh Tarik"],
    correct: 3,
  },
];
