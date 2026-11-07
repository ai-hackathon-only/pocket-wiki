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
Read starter articles covering notable topics:
* [[James Webb Space Telescope]] — Space observatory studying early galaxies and exoplanets.
* [[Artemis Program]] — Lunar exploration initiative aiming to return humans to the Moon.
* [[Large Language Models]] — Machine learning models trained on large text corpora.
* [[Mars Perseverance Rover]] — Robotic explorer searching for signs of ancient life on Mars.
* [[2024 Summer Olympics]] — International multi-sport event held in Paris.
* [[Electric Vehicles]] — Battery-powered road transport and charging networks.
* [[OpenStreetMap]] — Community-driven open map of the world.
* [[Gravitational-Wave Astronomy]] — Observing cosmic mergers through ripples in spacetime.
* [[RISC-V]] — Open standard instruction set architecture for computer hardware.
* [[Global Climate Action]] — Renewable power expansion and emissions reduction efforts.

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
The '''James Webb Space Telescope''' (JWST) is an infrared space observatory launched on 25 December 2021. Built by NASA in partnership with the European Space Agency and Canadian Space Agency, it orbits the Sun-Earth L2 Lagrange point, about 1.5 million kilometres from Earth.

=== Mission and Science Goals ===
JWST observes the universe in near-infrared and mid-infrared wavelengths:
* '''Early Universe:''' Detecting light from the first stars and galaxies that formed after the Big Bang.
* '''Galaxy Evolution:''' Comparing young galaxies with modern spiral and elliptical galaxies.
* '''Star and Planet Formation:''' Peering through dense interstellar dust clouds where solar systems form.
* '''Exoplanet Atmospheres:''' Measuring transmission spectra to identify water vapour, carbon dioxide, and methane in atmospheres orbiting other stars.

=== Technical Design ===
The telescope features a 6.5-metre primary mirror composed of 18 hexagonal beryllium segments coated in gold. A five-layer tennis-court-sized sunshield keeps instruments below 50 Kelvin (-223 degrees Celsius) to prevent heat from overwhelming faint infrared signals.

As of 2024, JWST observations have identified candidate galaxies that formed within 300 million years of the Big Bang and detected active atmospheric chemistry on distant gas giants.

''Related: [[Artemis Program]], [[Gravitational-Wave Astronomy]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Artemis Program': `== Artemis Program ==
The '''Artemis Program''' is a NASA-led spaceflight initiative seeking to return humans to the Moon and establish a sustained lunar presence. The program involves international partners, including the European Space Agency, Japan Aerospace Exploration Agency, and commercial contractors.

=== Mission Architecture ===
Artemis combines several primary spaceflight systems:
* '''Space Launch System (SLS):''' A heavy-lift expendable launch vehicle used to propel crew and cargo toward lunar orbit.
* '''Orion Spacecraft:''' The crew module designed for deep-space transit and atmospheric reentry at lunar velocities.
* '''Lunar Gateway:''' A planned orbital space station serving as a communications hub and staging platform.
* '''Human Landing System:''' Commercial landing vehicles designed to transfer astronauts between lunar orbit and the surface.

=== Progress and Milestones ===
Artemis 1 launched successfully on 16 November 2022, sending an uncrewed Orion spacecraft on a 25-day lunar test flight. Artemis 2 is scheduled to carry a four-person crew around the Moon on a lunar flyby trajectory. Artemis 3 aims to land astronauts near the lunar South Pole to inspect water ice deposits inside shadowed craters.

''Related: [[James Webb Space Telescope]], [[Mars Perseverance Rover]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Large Language Models': `== Large Language Models ==
'''Large Language Models''' (LLMs) are deep neural networks trained on vast collections of text to understand and generate natural language. Most modern models use the transformer neural architecture introduced in 2017.

=== How They Work ===
* '''Self-Attention:''' Transformers compute relationships between tokens across long sequences, learning context and syntax.
* '''Pre-Training:''' Models train on billions of words using next-token prediction to acquire broad linguistic knowledge.
* '''Fine-Tuning:''' Instruction tuning and reinforcement learning align models to answer questions, write code, and follow user prompts.

=== Practical Uses ===
LLMs power software development assistants, automated translation tools, text summarization systems, and conversational interfaces. They also assist research across natural science and data analysis.

=== Open Research Challenges ===
Ongoing technical challenges include factual accuracy, safety guardrails, memory requirements, and inference speed. Emerging efforts focus on efficient local model execution and open-weight architectures such as [[RISC-V]] hardware accelerators.

''Related: [[OpenStreetMap]], [[RISC-V]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Mars Perseverance Rover': `== Mars Perseverance Rover ==
'''Perseverance''' is a robotic rover manufactured by the Jet Propulsion Laboratory to explore Jezero Crater on Mars. Launched on 30 July 2020, the rover touched down on 18 February 2021.

=== Scientific Objectives ===
* '''Past Habitability:''' Investigating ancient river delta deposits inside Jezero Crater for biosignatures.
* '''Sample Collection:''' Drilling rock cores and sealing them in titanium sample tubes for future retrieval.
* '''Oxygen Production:''' Demonstrating atmospheric oxygen extraction using the MOXIE instrument.
* '''Aerial Reconnaissance:''' Deploying the Ingenuity helicopter, which completed 72 flights on Mars between 2021 and 2024.

=== Sample Return Planning ===
By mid-2024, Perseverance had deposited sample depots and cached more than 20 rock and regolith samples representing igneous, sedimentary, and alteration minerals.

''Related: [[Artemis Program]], [[James Webb Space Telescope]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  '2024 Summer Olympics': `== 2024 Summer Olympics ==
The '''2024 Summer Olympics''', officially the Games of the XXXIII Olympiad, took place in Paris, France from 26 July to 11 August 2024. Paris became the second city after London to host the Summer Games three times.

=== Key Highlights ===
* '''Opening Ceremony:''' Held along the River Seine rather than inside a traditional athletics stadium, with athletes parading on riverboats.
* '''Venues and Heritage:''' Events made extensive use of existing Parisian landmarks, including beach volleyball at the Eiffel Tower and equestrian competitions at the Palace of Versailles.
* '''New Sports:''' Breaking made its Olympic debut, while sport climbing, skateboarding, and surfing returned for their second Olympic appearances.
* '''Sustainability:''' Organizers relied on existing and temporary infrastructure for 95 percent of competition venues to reduce emissions.

=== Results ===
More than 10,000 athletes from 206 national Olympic committees competed across 329 medal events. The United States and China finished level on 40 gold medals each, with the United States leading the total medal count.

''Related: [[Electric Vehicles]], [[Global Climate Action]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Electric Vehicles': `== Electric Vehicles ==
'''Electric Vehicles''' (EVs) use one or more electric traction motors powered by rechargeable battery packs rather than internal combustion engines.

=== Vehicle Technology ===
* '''Battery Systems:''' Lithium-ion cells (including nickel-manganese-cobalt and lithium-iron-phosphate chemistries) provide energy storage.
* '''Regenerative Braking:''' Motors act as generators during deceleration, recovering kinetic energy back into the battery.
* '''Charging Infrastructure:''' Levels range from home alternating current (AC) chargers to direct current (DC) fast-charging stations delivering over 250 kW.

=== Global Adoption ===
Global EV sales exceeded 14 million passenger vehicles in 2023, representing nearly 18 percent of all new cars sold worldwide. Leading markets include China, Europe, and the United States. Adoption has accelerated alongside falling battery pack costs and expansion of public charging networks.

''Related: [[Global Climate Action]], [[RISC-V]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'OpenStreetMap': `== OpenStreetMap ==
'''OpenStreetMap''' (OSM) is a collaborative project to build a free, editable geographic database of the world. Founded by Steve Coast in 2004, it operates under the Open Database License (ODbL).

=== How Mapping Works ===
* '''Data Primitives:''' The OSM data model uses three elements: nodes (points with coordinates), ways (ordered lists of nodes representing roads or polygons), and relations (groups of elements).
* '''Community Mapping:''' Volunteers contribute data using GPS traces, satellite imagery, aerial photos, and field surveys.
* '''Software Integration:''' Routing engines, navigation applications, humanitarian disaster response teams, and public transit maps use OSM data globally.

=== Open Collaboration ===
Unlike proprietary mapping platforms, OpenStreetMap allows anyone to inspect, download, and modify the underlying vector geometry. Local chapters coordinate community mapping parties to map hiking trails, public services, and building outlines.

''Related: [[Large Language Models]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Gravitational-Wave Astronomy': `== Gravitational-Wave Astronomy ==
'''Gravitational-Wave Astronomy''' observes cosmic events by measuring ripples in spacetime caused by accelerating massive bodies, as predicted by Albert Einstein's general theory of relativity in 1916.

=== Observation Networks ===
* '''Laser Interferometers:''' Detectors such as LIGO (in Washington and Louisiana, United States), Virgo (Italy), and KAGRA (Japan) use laser beams traveling along multi-kilometre perpendicular vacuum arms.
* '''Interference Patterns:''' Passing gravitational waves compress one arm while stretching the other by a fraction of a proton's width, shifting the optical interference fringe.

=== Detected Phenomena ===
First detected directly in September 2015 from two colliding black holes, gravitational observatories have registered over 90 candidate mergers. Events include:
* Binary black hole coalescences.
* Binary neutron star collisions accompanied by gamma-ray bursts.
* Neutron star-black hole mergers.

The field provides a direct way to observe dark astrophysical objects that emit no light.

''Related: [[James Webb Space Telescope]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'RISC-V': `== RISC-V ==
'''RISC-V''' (pronounced "risk-five") is an open standard instruction set architecture (ISA) based on established reduced instruction set computer (RISC) design principles. Originating at the University of California, Berkeley in 2010, it is governed by the non-profit organization RISC-V International.

=== Architecture Features ===
* '''Royalty-Free:''' Designers can implement processor cores without purchasing proprietary licenses or paying royalties.
* '''Modularity:''' A base integer instruction set (RV32I or RV64I) pairs with optional standard extensions:
** \`M\`: Integer multiplication and division.
** \`A\`: Atomic memory instructions.
** \`F\` and \`D\`: Single- and double-precision floating-point.
** \`C\`: Compressed 16-bit instructions for compact code size.
** \`V\`: Vector computation for signal processing and machine learning.

=== Ecosystem Growth ===
RISC-V designs now run in microcontrollers, hard drive controllers, high-performance computing clusters, and embedded internet-of-things devices.

''Related: [[Large Language Models]], [[Electric Vehicles]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`,

  'Global Climate Action': `== Global Climate Action ==
'''Global Climate Action''' encompasses international policies, technological shifts, and conservation measures aimed at reducing greenhouse gas emissions and stabilizing global surface temperatures.

=== Clean Energy Growth ===
* '''Solar and Wind Deployment:''' Solar photovoltaic and onshore wind power have become the lowest-cost sources of new electricity generation across most world regions.
* '''Grid Storage:''' Large-scale battery installations and pumped-storage hydropower help balance intermittent renewable energy supply.
* '''Electrification:''' Transitioning passenger transport, building heat pumps, and industrial processes from fossil fuels to clean electricity.

=== Policy and Targets ===
Under the 2015 Paris Agreement, 196 parties committed to hold global temperature increases well below 2.0 degrees Celsius above pre-industrial levels, pursuing efforts toward 1.5 degrees Celsius. Countries update nationally determined contributions every five years to outline specific emission reduction milestones.

''Related: [[Electric Vehicles]], [[2024 Summer Olympics]], [[Main Page]].''
''Content licensed under [[Main Page|Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)]].''`
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
        const popularTitles = [
          'James Webb Space Telescope', 'Artemis Program', 'Large Language Models',
          'Mars Perseverance Rover', '2024 Summer Olympics', 'Electric Vehicles',
          'OpenStreetMap', 'Gravitational-Wave Astronomy', 'RISC-V', 'Global Climate Action'
        ];
        for (const title of popularTitles) {
          if (typeof store.exists === 'function' && !store.exists(title) && SEED_PAGES[title]) {
            store.save(title, SEED_PAGES[title], 'Add popular starter article');
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
