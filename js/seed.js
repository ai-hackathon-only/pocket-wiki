// Seed pages for a fresh browser session.
// Code licence: MIT. Content licence: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).

export const SEED_PAGES = {
  'Main Page': `== Welcome to pocket-wiki ==
'''pocket-wiki''' is a standalone personal wiki engine inspired by MediaWiki that runs entirely inside your web browser. There is no server, no account creation, and no cloud database: every page, revision, and edit summary is stored in your browser's local storage.

=== Core Highlights ===
* '''Your Pages Stay in This Browser:''' Your notes and knowledge stay on your device under your complete control.
* '''Wikitext Authoring:''' Familiar wiki syntax including headings, bold, italic, internal wikilinks, and lists.
* '''Full Revision History:''' Track changes over time with per-save edit summaries and past revision viewing.
* '''Export and Import:''' Export your entire wiki into a single JSON file via [[Special:Export]], or restore a backup file using [[Special:Import]].
* '''Zero Dependencies:''' Built with plain HTML, CSS, and modern JavaScript ES modules without external frameworks or CDNs.

=== Explore Example Pages ===
To discover how pocket-wiki works, explore these starter articles:
* [[Wikitext Guide]] — Examples of formatting, headings, links, and lists.
* [[Your Pages Stay in This Browser]] — Privacy, offline persistence, and browser data storage.
* [[Architecture]] — How the hash router, storage module, and renderer function together.
* [[Nonexistent Page]] — An example of a wiki redlink that prompts you to create a new page.

=== Popular Articles ===
Read 10 starter articles on recent events, science, and technology:
* [[James Webb Space Telescope]] — Infrared astronomy at the Sun-Earth L2 Lagrange point.
* [[Artemis Program]] — Lunar exploration and crewed flight sequence.
* [[Renewable Energy Transition]] — Solar, wind, and grid storage technologies.
* [[Electric Vehicles]] — Battery systems and charging infrastructure.
* [[Large Language Models]] — Neural architectures and natural language processing.
* [[Quantum Computing]] — Qubits, superposition, and experimental platforms.
* [[2024 Summer Olympics]] — Venues, events, and athletics in Paris.
* [[Exoplanet Exploration]] — Transit methods and atmospheric characterization.
* [[Voyager Interstellar Mission]] — Twin probes crossing into interstellar space.
* [[Global Chip Manufacturing]] — Silicon fabrication and semiconductor supply chains.

=== Built by AI Agents ===
pocket-wiki was collaboratively designed, specified, and coded by autonomous AI agents (Claude Code and Antigravity agy) during a public AI hackathon. Learn more at [https://github.com/ai-hackathon-only/pocket-wiki the GitHub repository].`,

  'Wikitext Guide': `== Wikitext Formatting Guide ==
pocket-wiki implements an intuitive subset of classic wikitext syntax. All rendered HTML is strictly escaped to ensure that page content can never execute malicious scripts.

=== Text Formatting ===
* Enclose text in three single quotes for '''bold text'''.
* Enclose text in two single quotes for ''italic text''.
* Combine them for '''''bold italic text'''''.

=== Headings ===
Headings structure your documents into clear thematic sections:
* \`== Section Heading ==\` produces a primary level-2 heading with an underline.
* \`=== Subsection Heading ===\` produces a level-3 subsection heading.

=== Links ===
* '''Internal Wikilinks:''' Use double brackets like \`[[Main Page]]\` to link to [[Main Page]].
* '''Piped Wikilinks:''' Provide custom link text with a pipe, like \`[[Architecture|System Architecture]]\` to display as [[Architecture|System Architecture]].
* '''Redlinks:''' Links to pages that do not exist yet, such as [[Sandbox Article]], appear in distinct red. Clicking a redlink opens the editor to create that page.
* '''External Links:''' Use single brackets with a space between URL and label, such as [https://github.com/ai-hackathon-only/pocket-wiki Project Repository]. Only secure \`http://\` and \`https://\` protocols are permitted.

=== Lists ===
Create unordered lists using asterisks:
* First bullet point
** Nested sub-bullet point
* Second bullet point

Create ordered numbered lists using hash symbols:
# Step one: Draft your thoughts
# Step two: Add an edit summary
# Step three: Save the revision`,

  'Your Pages Stay in This Browser': `== Your Pages Stay in This Browser ==
Personal notes and knowledge bases are frequently locked inside proprietary clouds, vulnerable to subscription paywalls, server outages, and data mining.

'''pocket-wiki''' stores all data in your browser:
# '''Browser-Native Storage:''' All content resides exclusively in your browser's \`localStorage\`.
# '''Strict Isolation:''' The application enforces a strict Content Security Policy (CSP). It makes zero external network calls, loads zero remote fonts or analytics, and connects to no third-party APIs.
# '''Complete Portability:''' You own your data. Use [[Special:Export]] at any time to download your entire wiki as a structured JSON file. You can import that JSON file into pocket-wiki on any other device or browser using [[Special:Import]].
# '''Longevity:''' Because pocket-wiki is a single static web application with no server runtime requirements, it can run directly from GitHub Pages or locally from your own filesystem for decades.`,

  'Architecture': `== System Architecture ==
pocket-wiki is designed around small, single-purpose ES modules following clean web standards:

=== Module Overview ===
* '''\`index.html\`''': Single static entrypoint defining semantic shell structure, strict CSP headers, and mounting point \`#app\`.
* '''\`css/style.css\`''': Responsive design system specified in \`DESIGN.md\`, honoring archival warmth, single-column reading, and mobile 390px parity.
* '''\`js/storage.js\`''': Encapsulates all \`localStorage\` interactions under key \`pocket-wiki:v1\`. Handles loading, saving, listing, revision history, and JSON export/import.
* '''\`js/wikitext.js\`''': Wikitext parser that escapes raw HTML first before safely transforming headings, inline styles, wikilinks, and nested lists.
* '''\`js/diff.js\`''': Dependency-free Myers diff on lines with prefix and suffix optimization.
* '''\`js/app.js\`''': Hash-based client router supporting routes:
** \`#/wiki/:title\` — Read view
** \`#/edit/:title\` — Editor with required change summary
** \`#/history/:title\` — Full revision log
** \`#/diff/:title/:oldId...:newId\` — Line diff between two revisions
** \`#/rev/:title/:id\` — Old revision view
** \`#/special/:name\` — Modular special pages
* '''\`js/special.js\`''': Extensible registry powering [[Special:AllPages]], [[Special:RecentChanges]], [[Special:Search]], [[Special:Export]], and [[Special:Import]].`,

  'James Webb Space Telescope': `== James Webb Space Telescope ==
The '''James Webb Space Telescope''' (JWST) is an infrared space observatory launched in December 2021. Built by NASA with the European Space Agency and the Canadian Space Agency, it orbits the Sun-Earth L2 Lagrange point 1.5 million kilometres from Earth.

=== Mission Goals ===
* Study early stars and galaxies formed after the Big Bang.
* Observe star birth inside dust clouds.
* Measure atmospheric chemicals of [[Exoplanet Exploration|exoplanets]].

=== Instruments ===
JWST carries a 6.5-metre gold-coated beryllium mirror with four instruments: NIRCam, NIRSpec, MIRI, and FGS/NIRISS. A five-layer sunshield keeps optical sensors below 50 Kelvin.`,

  'Artemis Program': `== Artemis Program ==
The '''Artemis Program''' is a crewed lunar exploration program led by NASA with international partners. Its goal is landing humans on the Moon and preparing for long-term space exploration.

=== Core Systems ===
* '''Space Launch System (SLS):''' Heavy-lift rocket providing lunar injection capability.
* '''Orion Spacecraft:''' Crew vehicle designed for lunar transit and high-speed Earth re-entry.
* '''Gateway:''' Planned space station in lunar orbit for staging and research.

=== Flights ===
# Artemis I (2022): Uncrewed flight orbiting the Moon and returning to Earth.
# Artemis II: Crewed flight taking four astronauts around the Moon.
# Artemis III: Planned crewed landing near the lunar south pole.`,

  'Renewable Energy Transition': `== Renewable Energy Transition ==
The '''renewable energy transition''' is the global shift from fossil fuels toward low-carbon sources such as solar photovoltaics, wind power, and battery storage.

=== Main Technologies ===
* '''Solar Photovoltaics:''' Cells converting sunlight directly into electricity.
* '''Wind Power:''' Turbines supplying power to regional transmission networks.
* '''Grid Storage:''' Battery facilities and pumped hydro balancing electricity grids.
* Connected sectors such as [[Electric Vehicles]] support flexible grid demand.`,

  'Electric Vehicles': `== Electric Vehicles ==
An '''electric vehicle''' (EV) uses electric motors for propulsion, drawing electricity from onboard rechargeable batteries.

=== Core Components ===
* '''Battery Packs:''' Lithium-ion or lithium iron phosphate cells.
* '''Inverter and Motor:''' Electronics converting direct current to drive traction motors.
* '''Regenerative Braking:''' Converting kinetic energy into stored power during deceleration.

=== Infrastructure ===
Charging corridors provide alternating-current chargers and direct-current fast chargers, linking road travel to the [[Renewable Energy Transition]].`,

  'Large Language Models': `== Large Language Models ==
A '''large language model''' (LLM) is an artificial intelligence model trained on large text corpora to predict and generate language.

=== Structure ===
* '''Transformer Architecture:''' Neural networks using self-attention mechanisms to weigh relationships between tokens across context windows.
* '''Training Stages:''' Pre-training on text followed by instruction tuning and evaluation against safety criteria.
* Processing speed relies on silicon hardware produced by [[Global Chip Manufacturing]].

=== Uses ===
* Language translation and summarization
* Software code assistance
* Information search and text classification`,

  'Quantum Computing': `== Quantum Computing ==
'''Quantum computing''' uses quantum mechanics, including superposition and entanglement, to execute specific algorithms faster than classical systems.

=== Fundamentals ===
* '''Qubit:''' The basic information unit, holding combinations of 0 and 1 states.
* '''Superposition:''' Mathematical state allowing qubits to explore computational spaces.
* '''Entanglement:''' Correlated states linking multiple qubits together.

=== Hardware Platforms ===
Engineers create qubits using superconducting circuits, trapped ions, and neutral atoms fabricated with techniques from [[Global Chip Manufacturing]].`,

  '2024 Summer Olympics': `== 2024 Summer Olympics ==
The '''2024 Summer Olympics''', officially the Games of the XXXIII Olympiad, took place in Paris, France from 26 July to 11 August 2024.

=== Key Venues ===
* '''River Seine:''' The opening parade was held on the river instead of an enclosed stadium.
* '''City Landmarks:''' Beach volleyball stood beneath the Eiffel Tower, while skateboarding and 3x3 basketball used Place de la Concorde.
* '''New Events:''' Breaking debuted alongside surfing in Tahiti and sport climbing in Le Bourget.

=== Participation ===
Over 10,500 athletes from 206 National Olympic Committees contested 329 events across 32 sports.`,

  'Exoplanet Exploration': `== Exoplanet Exploration ==
'''Exoplanet exploration''' studies planets that orbit stars beyond our Solar System. Astronomers have confirmed more than 5,500 exoplanets since 1995.

=== Search Methods ===
* '''Transit Method:''' Detecting slight dips in star brightness when a planet passes in front.
* '''Radial Velocity:''' Measuring stellar wobble caused by gravitational interaction.
* '''Direct Imaging:''' Masking host starlight to record images of distant gas giants.

Space observatories, including the [[James Webb Space Telescope]], examine starlight filtered through exoplanet atmospheres to detect water vapour and methane.`,

  'Voyager Interstellar Mission': `== Voyager Interstellar Mission ==
The '''Voyager Interstellar Mission''' continues the flight of NASA twin spacecraft Voyager 1 and Voyager 2, launched in 1977.

=== Boundary Crossings ===
* '''Voyager 1''' crossed the heliopause into interstellar space in August 2012 at 121 astronomical units (AU) from the Sun.
* '''Voyager 2''' entered interstellar space in November 2018 at 119 AU.

=== Operations ===
Both spacecraft use radioisotope thermoelectric generators. Instruments transmit measurements of cosmic rays and plasma density to Earth through the Deep Space Network.`,

  'Global Chip Manufacturing': `== Global Chip Manufacturing ==
'''Global chip manufacturing''' encompasses the facilities, equipment, and supply chains that produce semiconductor integrated circuits.

=== Production Stages ===
* '''Silicon Ingots:''' Growing high-purity silicon crystals and slicing them into thin wafers.
* '''Photolithography:''' Exposing photoresist with ultraviolet light to imprint circuit patterns.
* '''Etch and Deposit:''' Etching microscopic channels and depositing conductive metal layers.
* '''Packaging:''' Cutting wafers into dies and wiring them into protective enclosures.

High-density chip fabrication produces processors required for [[Large Language Models]] and experimental [[Quantum Computing]].`
};

export function seedIfEmpty(store) {
  if (!store.isEmpty()) {
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('pocket_wiki_seed_migrated_v1')) {
        localStorage.setItem('pocket_wiki_seed_migrated_v1', '1');
        if (typeof store.exists === 'function' && store.exists('Local Sovereignty') && !store.exists('Your Pages Stay in This Browser')) {
          const oldRev = store.load('Local Sovereignty');
          if (oldRev) {
            store.save('Your Pages Stay in This Browser', oldRev.text, 'Update seed title for existing visitors');
          }
        }
      }
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('pocket_wiki_seed_articles_v1')) {
        localStorage.setItem('pocket_wiki_seed_articles_v1', '1');
        for (const [title, text] of Object.entries(SEED_PAGES)) {
          if (typeof store.exists === 'function' && !store.exists(title)) {
            store.save(title, text, 'Seed starter article');
          }
        }
        if (typeof store.load === 'function' && store.exists('Main Page')) {
          const mainRev = store.load('Main Page');
          if (mainRev && !mainRev.text.includes('=== Popular Articles ===')) {
            store.save('Main Page', SEED_PAGES['Main Page'], 'Add popular articles to Main Page');
          }
        }
      }
    } catch (_) {
      // ignore storage access errors
    }
    return;
  }
  for (const [title, text] of Object.entries(SEED_PAGES)) {
    store.save(title, text, 'Initial seed revision');
  }
}
