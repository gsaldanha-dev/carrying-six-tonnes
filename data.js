/* ------------------------------------------------------------------
   cam    : [targetX,targetY,targetZ, camX,camY,camZ]
   labels : [x, y, z, text, screen dx, screen dy]
-------------------------------------------------------------------*/

/* the permanently labelled skeletons, shown on the overview */
const BASE = [
  /* elephant */
  [-2.24, 2.96, 0, 'cranium', -136, -59],
  [-2.52, 1.92, 0.15, 'mandible', -120, -3],
  [-2.86, 1.00, 0, 'trunk — no bone', -96, -30],
  [-3.10, 1.52, 0.30, 'tusks — upper incisors', -104, 62],
  [-1.42, 0.12, 0.62, 'fat cushion', -96, 56],
  [-1.86, 2.60, 0, 'cervical ×7', -24, -77],
  [-1.33, 2.56, 0.62, 'scapula — no clavicle', 18, -176],
  [-1.32, 3.24, 0, 'neural spines', 50, -24],
  [-0.30, 2.70, 0, 'thoracic ×20', 48, -58],
  [1.26, 2.72, 0, 'lumbar ×3', 77, -45],
  [1.72, 2.52, 0.55, 'pelvis', 96, -3],
  [0.10, 1.90, 0.92, 'ribs ×20', 200, 48],
  /* human */
  [-5.04, 1.72, 0, 'cranium', -69, -24],
  [-5.05, 1.47, 0, 'cervical ×7', -74, -6],
  [-5.14, 1.39, 0.12, 'clavicle', -69, 13],
  [-5.14, 1.24, 0.17, 'ribs ×12', -69, 32],
  [-5.04, 0.96, 0, 'lumbar ×5', -70, 37]
];

const ADAPTS = [
  {
    id: 'skull', n: 1, kind: 'diff', short: 'Skull',
    title: 'A skull full of air',
    cam: [-2.25, 2.60, 0, -3.9, 3.5, 3.4],
    humanCam: [-5.040,1.635,0.000, -5.410,1.875,0.541],
    humanParts: ['skull'],
    humanLabels: [[-5.04,1.73,0,'head ≈5 kg, skull solid',12,-16]],
    note: "Three hundred kilograms of head, held out in front of a short neck and lightened by air cells. A human head is about five, its skull a solid plate, balanced on top of a vertical spine. The elephant brain is not small in itself — about 5 kg, among the largest of any land mammal — it simply fills very little of that skull.",
    terms: [['Pneumatised',0], ['300 kg of head',0], ['Human: 5 kg head, solid plate',1]],
    rule: 'Big for attachment, hollow for weight.',
    labels: [
      [-2.24, 2.98, 0, 'pneumatised cranium', -130, -30],
      [-2.24, 2.62, 0.34, 'air cells in thin bony plates', 120, 0],
      [-2.30, 2.40, 0, 'braincase small for the skull, low and at the back', -186, 42],
      [-5.04, 1.72, 0, 'human head ~5 kg, skull a solid plate', -150, -26]
    ]
  },
  {
    id: 'teeth', n: 2, kind: 'diff', short: 'Teeth',
    title: 'A conveyor belt, not a replacement',
    cam: [-2.30, 2.30, 0, -4.1, 2.6, 2.8],
    humanCam: [-5.080,1.570,0.000, -5.395,1.774,0.460],
    humanParts: ['teeth'],
    humanLabels: [[-5.10,1.53,0,'two sets, pushed up',12,8]],
    note: "Six sets of molars per quadrant, each forming at the back and travelling forward; after the sixth there is nothing left. Humans grow two sets, pushed up vertically, and use them all at once.",
    terms: [['Six sets, replaced horizontally',0], ['Travelling forward',0], ['Human: two sets, pushed up',1]],
    rule: 'For an elephant, lifespan is set by a tooth.',
    labels: [
      [-3.10, 1.52, 0.30, 'tusks = upper incisors, grow for life', -138, 28],
      [-2.41, 2.06, 0.22, 'working molar', -108, -6],
      [-2.19, 2.16, 0.22, 'next set arriving, moving forward', 120, -26],
      [-2.54, 1.93, 0.15, 'mandible', -92, 34]
    ]
  },
  {
    id: 'spine', n: 3, kind: 'diff', short: 'Spine and ribs',
    title: 'Twenty ribs, three lumbar, seven in the neck',
    cam: [-0.10, 2.45, 0, -3.6, 3.9, 6.0],
    humanCam: [-5.060,1.130,0.000, -5.708,1.550,0.947],
    humanParts: ['vert','rib'],
    humanLabels: [[-5.14,1.24,0.17,'ribs ×12',14,-4],[-5.04,0.95,0,'lumbar ×5',14,16]],
    note: "Twenty rib pairs and only three lumbar, against twelve and five in a human — yet both have exactly seven cervical vertebrae. The elephant's seven are compressed into flat discs.",
    terms: [['Seven cervical — both',0], ['20 rib pairs, 3 lumbar',0], ['Human: 12 and 5',1]],
    rule: 'Same seven bones in the neck; completely different proportions.',
    labels: [
      [-1.86, 2.60, 0, 'cervical ×7 — short, compressed discs', -168, -48],
      [-1.32, 3.26, 0, 'tall neural spines = long lever arms', 26, -44],
      [-0.30, 2.72, 0, 'thoracic ×20 (human 12)', 40, -70],
      [0.10, 1.85, 0.95, 'ribs ×20 — a very long ribcage', 130, 14],
      [1.26, 2.74, 0, 'lumbar ×3 only (human 5)', 112, -46]
    ]
  },
  {
    id: 'shoulder', n: 4, kind: 'diff', short: 'Shoulder',
    title: 'No collarbone at all',
    cam: [-1.42, 2.25, 0.62, -2.9, 3.1, 4.0],
    humanCam: [-5.100,1.330,0.000, -5.452,1.558,0.514],
    humanParts: ['clav','scap'],
    humanLabels: [[-5.14,1.39,0.11,'clavicle',16,-12]],
    note: "With no clavicle the scapula slides free and the limb stays under the load. The human collarbone holds the arm out to the side, which is what allows reaching, throwing and climbing.",
    terms: [['No clavicle',0], ['Scapula slides free',0], ['Human: arm held out to the side',1]],
    rule: 'Range of movement given up; a limb built to carry gained.',
    labels: [
      [-1.33, 2.56, 0.62, 'scapula — massive blade, no clavicle', -176, -16],
      [-1.46, 1.98, 0.62, 'limb slung on muscle against the ribs', -186, 30],
      [-5.14, 1.39, 0.12, 'human clavicle holds the arm out', -150, 10]
    ]
  },
  {
    id: 'forelimb', n: 5, kind: 'diff', short: 'Forelimb',
    title: 'Walking on two arms',
    cam: [-1.45, 1.35, 0.62, -3.2, 1.9, 3.8],
    humanCam: [-5.070,1.060,0.180, -5.736,1.492,1.154],
    humanParts: ['fore'],
    humanLabels: [[-5.08,0.95,0.21,'radius + ulna cross',12,6]],
    note: "The same bones as a human arm, but the two are secured in pronation — permanently crossed and unable to rotate, with the ulna taking the load. A human forearm rotates freely between crossed and parallel, and that rotation is what turns the palm.",
    terms: [['Ulna takes the load',0], ['Locked in pronation',0], ['Human: the forearm rotates',1]],
    rule: 'Forearm rotation traded for weight-bearing.',
    labels: [
      [-1.44, 1.66, 0.62, 'humerus', -92, -10],
      [-1.49, 0.95, 0.52, 'radius — crossed over, locked there', -162, 18],
      [-1.35, 0.95, 0.72, 'ulna — the main weight-bearing bone', 124, 4],
      [-1.42, 0.52, 0.62, 'carpals', -86, 40]
    ]
  },
  {
    id: 'posture', n: 6, kind: 'diff', short: 'Columnar limbs',
    title: 'Straight columns, bone filled from the inside',
    cam: [-0.20, 1.40, 0, -4.2, 2.7, 7.0],
    humanCam: [-5.040,0.460,0.090, -5.965,1.060,1.443],
    humanParts: ['hind'],
    humanLabels: [[-5.04,0.68,0.09,'femur — hollow tube',12,-6]],
    note: "Bones stacked along the line the weight acts in, so the load is compression, and the marrow cavity is packed with trabecular bone. A human femur is a hollow tube and the leg stays bent, working as a spring.",
    terms: [['Columnar — pure compression',0], ['Trabecular infill',0], ['Human: hollow tube, bent, a spring',1]],
    rule: 'Crush resistance, bought with running and jumping.',
    labels: [
      [-1.42, 1.30, 0.62, 'forelimbs carry about 60% of the mass', -200, -14],
      [1.70, 1.60, 0.62, 'femur long, lower segments short', 128, -6],
      [0.20, 0.60, 0, 'four vertical columns to the ground', -130, 56],
      [-5.08, 0.48, 0.10, 'human leg keeps its bend — a spring', -168, 42]
    ]
  },
  {
    id: 'knee', n: 7, kind: 'same', short: 'The knee',
    title: 'An unexpected similarity',
    cam: [1.66, 1.35, 0.62, 3.4, 2.0, 3.8],
    humanCam: [-5.060,0.480,0.100, -5.375,0.684,0.560],
    humanParts: ['knee','hind'],
    humanLabels: [[-5.08,0.48,0.10,'large menisci',14,-10]],
    note: "Femur and tibia meet at nearly 180°, with the same screw-home locking as a human knee — about 16° against 10°. The menisci differ: narrow in the elephant, large in the human.",
    terms: [['Extended to ~180°',0], ['Screw-home 16°',0], ['Human: screw-home 10°',1]],
    rule: 'The same solution reached twice, from opposite directions.',
    labels: [
      [1.58, 1.40, 0.62, 'patella', 86, -16],
      [1.70, 1.80, 0.62, 'femur', 92, -34],
      [1.64, 1.00, 0.55, 'tibia — almost in line with the femur', 140, 18],
      [1.66, 1.38, 0.62, 'menisci extremely narrow; bone shape spreads the load', -230, 44]
    ]
  },
  {
    id: 'foot', n: 8, kind: 'diff', short: 'The foot',
    title: 'Nothing but cushion on the ground',
    cam: [-1.42, 0.30, 0.62, -2.8, 1.0, 3.0],
    humanCam: [-5.060,0.170,0.090, -5.467,0.434,0.685],
    humanParts: ['foot','pad'],
    humanLabels: [[-5.01,0.05,0.10,'calcaneus on the ground',-12,-14]],
    note: "No bone reaches the ground, and the cushion spreads sideways under load — pressure is force divided by area. A human heel bone strikes the ground with only a thin pad over it.",
    terms: [['No bone on the ground',0], ['Pressure = force ÷ area',0], ['Human: plantigrade heel',1]],
    rule: 'The force cannot be reduced, so the area is increased.',
    labels: [
      [-1.42, 0.49, 0.62, 'bones sit on a slope, lifted clear', -168, -30],
      [-1.58, 0.33, 0.62, 'prepollex — a sixth ray, not a toe', -170, 6],
      [-1.42, 0.11, 0.62, 'fat in collagen chambers', -140, 46],
      [-5.01, 0.05, 0.10, 'human heel bone strikes the ground', -176, 30]
    ]
  },
  {
    id: 'trunk', n: 9, kind: 'diff', short: 'The trunk',
    title: 'Movement without a skeleton',
    cam: [-2.75, 1.40, 0, -4.9, 2.1, 3.8],
    humanCam: [-5.060,0.745,0.200, -5.301,0.901,0.552],
    humanParts: ['fore'],
    humanLabels: [[-5.08,0.76,0.21,'hand — 27 bones',12,4]],
    note: "A muscular hydrostat of fixed volume, with no bone, no joint and no lever anywhere in it. The human hand does the same work with twenty-seven bones and muscles pulling on them.",
    terms: [['Muscular hydrostat',0], ['No bone, no joint, no lever',0], ['Human hand: 27 bones',1]],
    rule: 'Unlimited flexibility, and no rigidity whatsoever.',
    labels: [
      [-2.86, 1.30, 0, 'no bones, no joints', -118, -20],
      [-2.90, 0.70, 0, 'longitudinal, radial and helical fibres', -196, 18],
      [-5.08, 0.93, 0.22, 'the human hand does this with 27 bones', -200, 24]
    ]
  },
  {
    id: 'gait', n: 10, kind: 'diff', short: 'Locomotion',
    title: 'A run that never leaves the ground',
    cam: [-0.30, 1.10, 0, -1.4, 1.8, 9.4],
    humanCam: [-5.040,0.480,0.090, -6.012,1.110,1.510],
    humanParts: ['hind','foot','pad'],
    humanLabels: [[-5.01,0.05,0.10,'heel strike',-12,-12]],
    note: "About 25 km/h at the fastest, always with a walking footfall and never all four feet off the ground. A human sprinter passes 37 km/h and gains a flight phase.",
    terms: [['25 km/h, no aerial phase',0], ['Always a walking footfall',0], ['Human sprinter: 37 km/h',1]],
    rule: 'The elephant technically runs — while walking.',
    labels: [
      [-1.42, 0.11, 0.62, 'one foot always down', -124, 34],
      [0.30, 2.90, 0, '≈25 km/h, no aerial phase', 36, -54],
      [-5.01, 0.05, 0.10, 'a human sprinter exceeds 37 km/h, with flight', -228, 36]
    ]
  },
  {
    id: 'muscle', n: 11, kind: 'diff', short: 'Muscle',
    title: 'Bone holds, muscle moves',
    cam: [-0.20, 1.95, 0, -1.90, 3.30, 8.60],
    humanCam: [-5.040,0.620,0.100, -5.390,0.890,0.610],
    humanParts: ['hind','muscle'],
    humanLabels: [[-5.04,0.33,0.10,'calf: muscle kept low',12,-6]],
    note: "The limb muscle sits high, at the shoulder and the hip; below the elbow and the knee there is almost nothing but tendon. Because the bones stand in a column, the skeleton carries the weight and the muscles only move the limb. A human keeps a muscle belly low on the leg \u2014 the calf \u2014 because a bent knee has to be held up. The same pattern explains the tall neural spines: they are the anchor for the nuchal ligament that carries the head.",
    terms: [['Mass held high, tendon below',0], ['The column does the holding',0], ['Human: a calf low on the leg',1]],
    rule: 'The skeleton alone predicts the muscle.',
    labels: [
      [-1.34, 2.32, 0.62, 'muscle mass held high, at the shoulder', -212, -22],
      [-1.43, 0.96, 0.62, 'below the elbow, almost only tendon', -198, 26],
      [-1.19, 3.36, 0, 'nuchal ligament, anchored on the tall spines', 64, -44],
      [1.74, 2.30, 0.62, 'the same pattern at the hip', 104, -16],
      [-5.03, 0.35, 0.10, 'a human keeps a calf low on the leg', -196, 32]
    ]
  },
  {
    id: 'scale', n: 12, kind: 'diff', short: 'Why size forces it',
    title: 'The square–cube law',
    cam: [-2.40, 1.50, 0, -3.6, 2.5, 15.2],
    humanCam: null,
    humanParts: [],
    humanLabels: [],
    note: "Double every length and mass rises eight times while bone cross-section rises only four. A human is about a hundred times lighter, so it can afford hollow bones, bent limbs and a flight phase.",
    terms: [['Mass × 8',0], ['Supporting area × 4',0], ['Human: 100× lighter',1]],
    rule: 'Not shaped this way by choice. Shaped this way by geometry.',
    labels: [
      [-0.30, 3.30, 0, 'mass ∝ length³', 30, -40],
      [-1.42, 0.12, 0.62, 'supporting area ∝ length²', -158, 36],
      [-5.04, 1.80, 0, 'about a hundred times lighter', -150, -22]
    ]
  }
];

const SOURCES = [
  ['Long-bone microanatomy in elephants', 'arxiv.org/pdf/2511.05634'],
  ['Functional anatomy of the elephant foot cushion', 'PMC2048995'],
  ['The elephant knee joint', 'PMC2100174'],
  ['Osteology of the African elephant', 'repository.up.ac.za'],
  ['Are fast-moving elephants really running?', 'Hutchinson et al., Nature 2003'],
  ['Functional mechanics of the elephant proboscis', 'McGill'],
  ['Elephant dentition', 'Tsavo Trust · University College Cork']
];
